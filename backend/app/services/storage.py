import os
import uuid

from supabase import Client, create_client

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


def get_user_id_from_token(token: str) -> str | None:
    try:
        resp = _get_client().auth.get_user(token)
        return resp.user.id if resp.user else None
    except Exception:
        return None


def save_analysis(result: dict, user_id: str | None = None, job_title: str | None = None) -> str:
    analysis_id = str(uuid.uuid4())
    row: dict = {"id": analysis_id, "result": result}
    if user_id:
        row["user_id"] = user_id
    if job_title:
        row["job_title"] = job_title
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
