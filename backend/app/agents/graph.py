from langgraph.graph import END, StateGraph

from .hr_agent import hr_agent_node
from .market_agent import market_agent_node
from .state import AnalysisState
from .tech_agent import tech_agent_node


def _aggregate_node(state: AnalysisState) -> dict:
    hr = state["hr_result"]
    tech = state["tech_result"]
    market = state["market_result"]

    # Weighted score: HR 40%, Tech 40%, Market 20%
    raw = hr["ats_score"] * 0.4 + tech["technical_score"] * 0.4 + market["market_fit_score"] * 0.2

    # Penalise for missing keywords: -2 per gap, capped at -20
    gap_count = len(hr["missing_keywords"]) + len(tech["technical_gaps"])
    penalty = min(gap_count * 2, 20)

    overall = max(0, int(raw - penalty))

    missing = list(dict.fromkeys(
        hr["missing_keywords"] + tech["technical_gaps"] + market["trending_skills_missing"]
    ))[:12]

    strengths = list(dict.fromkeys(hr["strengths"] + tech["strengths"]))[:6]

    all_matched = list(dict.fromkeys(hr["matched_keywords"]))[:20]

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
                    "score": hr["ats_score"],
                    "summary": hr["summary"],
                    "details": hr["matched_keywords"][:6],
                },
                "tech_lead_agent": {
                    "score": tech["technical_score"],
                    "summary": tech["summary"],
                    "details": tech["technical_highlights"][:5],
                },
                "market_analyst_agent": {
                    "score": market["market_fit_score"],
                    "summary": market["summary"],
                    "details": market["market_insights"][:5],
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
