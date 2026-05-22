import logging
import os
import uuid

from supabase import Client, create_client

logger = logging.getLogger(__name__)

_client: Client | None = None


def _get_client() -> Client:
    global _client
    if _client is None:
        url = os.getenv("SUPABASE_URL", "")
        key = os.getenv("SUPABASE_SERVICE_KEY", "")
        if not url or not key:
            raise RuntimeError("SUPABASE_URL and SUPABASE_SERVICE_KEY must be set")
        _client = create_client(url, key)
    return _client


def _is_uuid(value: str) -> bool:
    try:
        uuid.UUID(value)
        return True
    except (ValueError, TypeError):
        return False


def get_user_id_from_token(token: str) -> str | None:
    """Verify the bearer token with Supabase and return the authenticated user id.

    Defense in depth:
    - Supabase verifies the JWT signature and expiry server-side via auth.get_user.
    - We additionally require aud == "authenticated" (Supabase sets this for real users).
    - We additionally require the id to parse as a UUID before trusting it as a row owner.
    """
    if not token or not isinstance(token, str):
        return None
    try:
        resp = _get_client().auth.get_user(token)
    except Exception as exc:
        # supabase-py raises AuthApiError / AuthInvalidJwtError; both subclass Exception.
        # Treat any auth-layer failure as "no user" rather than 500ing the request.
        logger.debug("auth.get_user failed: %s", exc)
        return None
    user = getattr(resp, "user", None)
    if user is None:
        return None
    aud = getattr(user, "aud", None)
    if aud != "authenticated":
        logger.warning("Rejected token with aud=%r (expected 'authenticated')", aud)
        return None
    user_id = getattr(user, "id", None)
    if not user_id or not _is_uuid(str(user_id)):
        logger.warning("Rejected token with malformed user id: %r", user_id)
        return None
    return str(user_id)


def save_analysis(result: dict, user_id: str | None = None, job_title: str | None = None) -> str:
    analysis_id = str(uuid.uuid4())
    row: dict = {"id": analysis_id, "result": result}
    # Only persist user_id if it round-trips as a UUID — defense against any
    # caller that smuggles a non-UUID value past get_user_id_from_token.
    if user_id and _is_uuid(user_id):
        row["user_id"] = user_id
    if job_title:
        row["job_title"] = job_title[:200]  # cap to keep index sane
    _get_client().table("analyses").insert(row).execute()
    return analysis_id


def get_analysis(analysis_id: str) -> dict | None:
    resp = _get_client().table("analyses").select("result").eq("id", analysis_id).limit(1).execute()
    if resp.data:
        return resp.data[0]["result"]
    return None


def get_user_analyses(user_id: str) -> list[dict]:
    resp = (
        _get_client()
        .table("analyses")
        .select("id, created_at, job_title, result->overall_score, result->quick_stats")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .limit(50)
        .execute()
    )
    return resp.data or []
