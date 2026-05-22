"""Aggregator must survive partial/empty agent output without 500ing the analysis."""
from app.agents.graph import _aggregate_node


def _full_state():
    return {
        "resume_text": "x",
        "job_description": "y",
        "location": None,
        "hr_result": {
            "ats_score": 80,
            "missing_keywords": ["k8s"],
            "matched_keywords": ["python", "fastapi"],
            "strengths": ["api design"],
            "summary": "hr summary",
            "priority_improvements": [{"text": "add k8s", "priority": "HIGH"}],
        },
        "tech_result": {
            "technical_score": 70,
            "technical_gaps": ["terraform"],
            "strengths": ["docker"],
            "technical_highlights": ["fastapi", "docker"],
            "summary": "tech summary",
            "skills_coverage": {"Python": 90},
        },
        "market_result": {
            "market_fit_score": 65,
            "trending_skills_missing": ["llms"],
            "market_insights": ["competitive"],
            "summary": "market summary",
            "action_items": [{"text": "learn llms", "priority": "MEDIUM"}],
            "experience_gap": "At level",
            "salary_range": "$110k–$140k/yr",
        },
        "final_result": None,
    }


def test_aggregator_happy_path():
    out = _aggregate_node(_full_state())
    fr = out["final_result"]
    assert fr["overall_score"] > 0
    assert "k8s" in fr["missing_keywords"]
    assert fr["agent_feedback"]["hr_agent"]["score"] == 80


def test_aggregator_handles_missing_hr():
    """No hr_result -> still returns a valid (low-score) result instead of KeyError."""
    state = _full_state()
    state["hr_result"] = None
    out = _aggregate_node(state)
    fr = out["final_result"]
    assert fr["overall_score"] >= 0
    assert fr["agent_feedback"]["hr_agent"]["score"] == 0


def test_aggregator_handles_partial_dicts():
    state = _full_state()
    state["hr_result"] = {"ats_score": 80}  # missing every list field
    state["tech_result"] = {}
    state["market_result"] = {"market_fit_score": 50}
    out = _aggregate_node(state)
    fr = out["final_result"]
    assert isinstance(fr["overall_score"], int)
    assert fr["missing_keywords"] == []
    assert fr["strengths"] == []
