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


def save_analysis(result: dict) -> str:
    analysis_id = str(uuid.uuid4())
    _get_client().table("analyses").insert({"id": analysis_id, "result": result}).execute()
    return analysis_id


def get_analysis(analysis_id: str) -> dict | None:
    resp = _get_client().table("analyses").select("result").eq("id", analysis_id).single().execute()
    if resp.data:
        return resp.data["result"]
    return None
