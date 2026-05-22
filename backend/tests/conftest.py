import pytest
from fastapi.testclient import TestClient
@pytest.fixture(autouse=True)
def disable_rate_limiter():
    """Disable rate limiting during tests."""
    from app.limiter import limiter
    limiter.enabled = False
    yield
    limiter.enabled = True


MOCK_FINAL_RESULT = {
    "overall_score": 74,
    "missing_keywords": ["kubernetes", "terraform"],
    "matched_keywords": ["python", "fastapi", "docker"],
    "strengths": ["Strong Python background", "API design experience"],
    "agent_feedback": {
        "hr_agent": {"score": 76, "summary": "Good keyword match.", "details": ["python", "fastapi"]},
        "tech_lead_agent": {"score": 72, "summary": "Solid technical skills.", "details": ["docker"]},
        "market_analyst_agent": {"score": 70, "summary": "Competitive candidate.", "details": ["High demand role"]},
    },
    "priority_improvements": [{"text": "Add Kubernetes experience", "priority": "HIGH"}],
    "action_items": [{"text": "Learn Terraform", "priority": "MEDIUM"}],
    "skills_coverage": {"Python": 90, "Docker": 70},
    "quick_stats": {
        "total_keywords": 5,
        "match_rate": 60,
        "experience_gap": "At level",
        "salary_range": "$110k–$140k/yr",
    },
}


@pytest.fixture
def client():
    from app.main import app
    return TestClient(app)


@pytest.fixture
def mock_final_result():
    return {"final_result": MOCK_FINAL_RESULT}


@pytest.fixture
def sample_pdf_bytes():
    """Minimal valid PDF bytes for upload tests."""
    from fpdf import FPDF
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Helvetica", size=12)
    pdf.cell(0, 10, "John Smith - Senior Python Developer")
    pdf.ln()
    pdf.cell(0, 10, "5 years experience with Python, FastAPI, Docker")
    return bytes(pdf.output())
