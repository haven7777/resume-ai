"""Market agent unit tests — covers role extraction and search fallback."""
from unittest.mock import MagicMock, patch

from app.agents.market_agent import _extract_role, _fetch_market_context


def test_extract_role_first_line():
    jd = "Senior Python Developer\n\nWe are looking for..."
    assert _extract_role(jd) == "Senior Python Developer"


def test_extract_role_strips_prefix():
    jd = "Job Title: Frontend Engineer\n\nResponsibilities..."
    assert _extract_role(jd) == "Frontend Engineer"


def test_extract_role_skips_blank_lines():
    jd = "\n\nData Scientist\nWe need someone..."
    assert _extract_role(jd) == "Data Scientist"


def test_extract_role_fallback_long_jd():
    jd = "x" * 200  # no newlines, no short first line
    result = _extract_role(jd)
    assert len(result) <= 80


def test_fetch_market_context_uses_tavily_when_key_set():
    mock_instance = MagicMock()
    mock_instance.search.return_value = {
        "results": [{"content": "Software Engineers earn $120k–$160k in SF"}]
    }
    mock_cls = MagicMock(return_value=mock_instance)
    with (
        patch.dict("os.environ", {"TAVILY_API_KEY": "fake-key"}),
        patch("app.agents.market_agent.TavilyClient", mock_cls),
    ):
        result = _fetch_market_context("Software Engineer", "San Francisco")

    assert "120k" in result
    mock_instance.search.assert_called_once()


def test_fetch_market_context_returns_empty_on_all_failures():
    with (
        patch.dict("os.environ", {"TAVILY_API_KEY": ""}),
        patch("app.agents.market_agent.DDGS", side_effect=Exception("rate limited")),
    ):
        result = _fetch_market_context("Software Engineer", None)

    assert result == ""


def test_fetch_market_context_falls_back_to_ddg_when_no_tavily_key():
    mock_instance = MagicMock()
    mock_instance.text.return_value = [
        {"title": "Salary Survey", "body": "Engineers earn $100k–$130k"}
    ]
    mock_cls = MagicMock(return_value=mock_instance)
    with (
        patch.dict("os.environ", {"TAVILY_API_KEY": ""}),
        patch("app.agents.market_agent.DDGS", mock_cls),
    ):
        result = _fetch_market_context("Engineer", "New York")

    assert "100k" in result
