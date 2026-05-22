import logging

from langgraph.graph import END, StateGraph

from .hr_agent import hr_agent_node
from .market_agent import market_agent_node
from .state import AnalysisState
from .tech_agent import tech_agent_node

logger = logging.getLogger(__name__)


def _aggregate_node(state: AnalysisState) -> dict:
    # Use .get on every field — a single malformed agent dict must not 500 the run.
    hr = state.get("hr_result") or {}
    tech = state.get("tech_result") or {}
    market = state.get("market_result") or {}

    if not (hr and tech and market):
        logger.warning(
            "Aggregator received incomplete state: hr=%s tech=%s market=%s",
            bool(hr), bool(tech), bool(market),
        )

    hr_score = int(hr.get("ats_score") or 0)
    tech_score = int(tech.get("technical_score") or 0)
    market_score = int(market.get("market_fit_score") or 0)

    hr_missing = hr.get("missing_keywords") or []
    hr_matched = hr.get("matched_keywords") or []
    hr_strengths = hr.get("strengths") or []
    tech_gaps = tech.get("technical_gaps") or []
    tech_strengths = tech.get("strengths") or []
    tech_highlights = tech.get("technical_highlights") or []
    market_missing = market.get("trending_skills_missing") or []
    market_insights = market.get("market_insights") or []

    # Weighted score: HR 40%, Tech 40%, Market 20%
    raw = hr_score * 0.4 + tech_score * 0.4 + market_score * 0.2

    # Penalise for missing keywords: -2 per gap, capped at -20
    penalty = min((len(hr_missing) + len(tech_gaps)) * 2, 20)
    overall = max(0, int(raw - penalty))

    missing = list(dict.fromkeys(hr_missing + tech_gaps + market_missing))[:12]
    strengths = list(dict.fromkeys(hr_strengths + tech_strengths))[:6]
    all_matched = list(dict.fromkeys(hr_matched))[:20]

    total_keywords = len(all_matched) + len(missing)
    match_rate = int(len(all_matched) / total_keywords * 100) if total_keywords > 0 else 0

    return {
        "final_result": {
            "overall_score": overall,
            "missing_keywords": missing,
            "matched_keywords": all_matched,
            "strengths": strengths,
            "agent_feedback": {
                "hr_agent": {
                    "score": hr_score,
                    "summary": hr.get("summary", ""),
                    "details": hr_matched[:6],
                },
                "tech_lead_agent": {
                    "score": tech_score,
                    "summary": tech.get("summary", ""),
                    "details": tech_highlights[:5],
                },
                "market_analyst_agent": {
                    "score": market_score,
                    "summary": market.get("summary", ""),
                    "details": market_insights[:5],
                },
            },
            "priority_improvements": hr.get("priority_improvements", []),
            "action_items": market.get("action_items", []),
            "skills_coverage": tech.get("skills_coverage", {}),
            "quick_stats": {
                "total_keywords": total_keywords,
                "match_rate": match_rate,
                "experience_gap": market.get("experience_gap", "Unknown"),
                "salary_range": market.get("salary_range", "Unknown"),
            },
        }
    }


def build_graph():
    g = StateGraph(AnalysisState)

    g.add_node("hr_agent", hr_agent_node)
    g.add_node("tech_agent", tech_agent_node)
    g.add_node("market_agent", market_agent_node)
    g.add_node("aggregate", _aggregate_node)

    g.set_entry_point("hr_agent")
    g.add_edge("hr_agent", "tech_agent")
    g.add_edge("tech_agent", "market_agent")
    g.add_edge("market_agent", "aggregate")
    g.add_edge("aggregate", END)

    return g.compile()


# Module-level singleton — compiled once on import
analysis_graph = build_graph()
