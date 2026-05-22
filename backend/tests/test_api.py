"""API endpoint smoke tests."""
from unittest.mock import AsyncMock, MagicMock, patch


def test_health(client):
    resp = client.get("/health")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "ok"
    assert "version" in data


def test_analyze_missing_file(client):
    resp = client.post(
        "/api/v1/analyze-resume",
        data={"job_description": "Senior Python Developer with FastAPI experience needed."},
    )
    assert resp.status_code == 422


def test_analyze_missing_job_description(client, sample_pdf_bytes):
    resp = client.post(
        "/api/v1/analyze-resume",
        files={"file": ("resume.pdf", sample_pdf_bytes, "application/pdf")},
    )
    assert resp.status_code == 422


def test_analyze_non_pdf_rejected(client):
    resp = client.post(
        "/api/v1/analyze-resume",
        files={"file": ("resume.txt", b"plain text resume", "text/plain")},
        data={"job_description": "Senior Python Developer with FastAPI experience needed."},
    )
    assert resp.status_code == 400
    assert "PDF" in resp.json()["detail"]


def test_analyze_job_description_too_short(client, sample_pdf_bytes):
    resp = client.post(
        "/api/v1/analyze-resume",
        files={"file": ("resume.pdf", sample_pdf_bytes, "application/pdf")},
        data={"job_description": "too short"},
    )
    assert resp.status_code == 422


def test_analyze_success(client, sample_pdf_bytes, mock_final_result):
    with (
        patch("app.api.v1.routes.parse_pdf", new_callable=AsyncMock,
              return_value="John Smith, Senior Python Developer, 5 years FastAPI Docker experience."),
        patch("app.api.v1.routes.analysis_graph") as mock_graph,
        patch("app.api.v1.routes.save_analysis", return_value="test-analysis-uuid"),
    ):
        mock_graph.invoke.return_value = mock_final_result

        resp = client.post(
            "/api/v1/analyze-resume",
            files={"file": ("resume.pdf", sample_pdf_bytes, "application/pdf")},
            data={"job_description": "Senior Python Developer with FastAPI and Docker experience required."},
        )

    assert resp.status_code == 200
    data = resp.json()
    assert data["overall_score"] == 74
    assert data["analysis_id"] == "test-analysis-uuid"
    assert "python" in data["matched_keywords"]
    assert "hr_agent" in data["agent_feedback"]


def test_analyze_supabase_failure_is_nonfatal(client, sample_pdf_bytes, mock_final_result):
    """analysis_id should be None if Supabase save fails — not a 500."""
    with (
        patch("app.api.v1.routes.parse_pdf", new_callable=AsyncMock,
              return_value="John Smith, Python developer."),
        patch("app.api.v1.routes.analysis_graph") as mock_graph,
        patch("app.api.v1.routes.save_analysis", side_effect=RuntimeError("DB down")),
    ):
        mock_graph.invoke.return_value = mock_final_result

        resp = client.post(
            "/api/v1/analyze-resume",
            files={"file": ("resume.pdf", sample_pdf_bytes, "application/pdf")},
            data={"job_description": "Senior Python Developer with FastAPI and Docker required."},
        )

    assert resp.status_code == 200
    assert resp.json()["analysis_id"] is None


def test_get_result_not_found(client):
    with patch("app.api.v1.routes.get_analysis", return_value=None):
        resp = client.get("/api/v1/results/nonexistent-id")
    assert resp.status_code == 404


def test_get_result_found(client, mock_final_result):
    from tests.conftest import MOCK_FINAL_RESULT
    with patch("app.api.v1.routes.get_analysis", return_value=MOCK_FINAL_RESULT):
        resp = client.get("/api/v1/results/some-uuid")
    assert resp.status_code == 200
    assert resp.json()["overall_score"] == 74


def test_list_analyses_requires_auth(client):
    resp = client.get("/api/v1/analyses")
    assert resp.status_code == 401


def test_list_analyses_invalid_token(client):
    with patch("app.api.v1.routes.get_user_id_from_token", return_value=None):
        resp = client.get("/api/v1/analyses", headers={"Authorization": "Bearer bad-token"})
    assert resp.status_code == 401


def test_list_analyses_success(client):
    with (
        patch("app.api.v1.routes.get_user_id_from_token", return_value="user-123"),
        patch("app.api.v1.routes.get_user_analyses", return_value=[
            {"id": "abc", "created_at": "2025-01-01T00:00:00", "overall_score": 74, "quick_stats": None}
        ]),
    ):
        resp = client.get("/api/v1/analyses", headers={"Authorization": "Bearer valid-token"})
    assert resp.status_code == 200
    assert len(resp.json()) == 1
