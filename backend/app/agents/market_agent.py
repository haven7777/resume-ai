from langchain_core.messages import HumanMessage, SystemMessage
from langchain_groq import ChatGroq
from pydantic import BaseModel, Field

from .state import AnalysisState

_MODEL = "llama-3.3-70b-versatile"

_SYSTEM = """You are a tech recruiting market analyst. Your job is to give candidates an accurate picture of where they stand in the current job market — including the uncomfortable truth if they're not competitive.

CRITICAL RULES:
- The job market for tech roles (especially senior) is highly competitive. Most applicants are rejected.
- A candidate missing multiple core requirements is not "mostly competitive" — they are likely to be screened out.
- Do not factor in company names on the resume as inflating the score unless the specific work is described.

Scoring calibration:
- 0-35: not competitive for this role right now — significant reskilling needed
- 36-55: below market threshold for this specific role — might qualify for a junior version
- 56-70: borderline — could get interviews but likely to lose out to stronger candidates
- 71-84: competitive with some gaps to address
- 85-100: strong market position for this role

Return:
- market_fit_score: integer 0-100, calibrated strictly
- trending_skills_missing: in-demand skills for this role the candidate clearly lacks
- market_insights: 3-5 direct observations. Include: how competitive this role is, what's missing, realistic outcome of applying with this resume right now.
- demand_level: Low / Medium / High / Very High for this role type
- salary_range: realistic salary range for this candidate given their experience, gaps, and location. If a location is provided, use local market rates for that city/country. Format as a range (e.g. "$80k–$100k/yr", "£45k–£55k/yr", "Not competitive at target level"). Be honest.
- experience_gap: one short phrase describing the experience gap (e.g. "2–3 years short", "At level", "Overqualified", "No relevant experience").
- action_items: 3-5 concrete things the candidate should do to improve their market position. Each must have text (what to do) and priority (HIGH/MEDIUM/LOW).
- summary: 2-3 sentences. If the candidate is unlikely to land this specific role with this resume, say so directly."""


class ActionItem(BaseModel):
    text: str
    priority: str = Field(..., pattern="^(HIGH|MEDIUM|LOW)$")


class MarketResult(BaseModel):
    market_fit_score: int = Field(..., ge=0, le=100)
    trending_skills_missing: list[str]
    market_insights: list[str]
    demand_level: str
    salary_range: str
    experience_gap: str
    action_items: list[ActionItem]
    summary: str


def market_agent_node(state: AnalysisState) -> dict:
    llm = ChatGroq(model=_MODEL, temperature=0)

    location_line = f"\nCANDIDATE LOCATION: {state['location']}" if state.get("location") else ""

    result: MarketResult = llm.with_structured_output(MarketResult).invoke([
        SystemMessage(content=_SYSTEM),
        HumanMessage(
            content=f"RESUME:\n{state['resume_text']}\n\nJOB DESCRIPTION:\n{state['job_description']}{location_line}"
        ),
    ])
    return {"market_result": result.model_dump()}
