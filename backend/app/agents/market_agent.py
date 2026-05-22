import logging
import os
import re

from duckduckgo_search import DDGS
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_groq import ChatGroq
from pydantic import BaseModel, Field
from tavily import TavilyClient

from app.schemas.response import PriorityItem

from .state import AnalysisState

logger = logging.getLogger(__name__)

_MODEL = "llama-3.3-70b-versatile"

_SYSTEM = """You are a tech recruiting market analyst. Your job is to give candidates an accurate picture of where they stand in the current job market — including the uncomfortable truth if they're not competitive.

CRITICAL RULES:
- The job market for tech roles (especially senior) is highly competitive. Most applicants are rejected.
- A candidate missing multiple core requirements is not "mostly competitive" — they are likely to be screened out.
- Do not factor in company names on the resume as inflating the score unless the specific work is described.
- If LIVE MARKET DATA is provided below, use those figures directly for salary_range and demand_level. Do not override real data with estimates.

Scoring calibration:
- 0-35: not competitive for this role right now — significant reskilling needed
- 36-55: below market threshold for this specific role — might qualify for a junior version
- 56-70: borderline — could get interviews but likely to lose out to stronger candidates
- 71-84: competitive with some gaps to address
- 85-100: strong market position for this role

Return:
- market_fit_score: integer 0-100, calibrated strictly
- trending_skills_missing: in-demand skills for this role the candidate clearly lacks
- market_insights: 3-5 direct observations. Include: how competitive this role is, what's missing, realistic outcome.
- demand_level: Low / Medium / High / Very High for this role type
- salary_range: if LIVE MARKET DATA is provided use those figures; otherwise estimate from resume experience and location. Format as range (e.g. "$80k–$100k/yr", "£45k–£55k/yr").
- experience_gap: one short phrase (e.g. "2–3 years short", "At level", "Overqualified").
- action_items: 3-5 concrete improvements. Each has text and priority (HIGH/MEDIUM/LOW).
- summary: 2-3 sentences. If unlikely to land this role with this resume, say so directly."""


class MarketResult(BaseModel):
    market_fit_score: int = Field(..., ge=0, le=100)
    trending_skills_missing: list[str]
    market_insights: list[str]
    demand_level: str
    salary_range: str
    experience_gap: str
    action_items: list[PriorityItem]
    summary: str


def _extract_role(job_description: str) -> str:
    for line in job_description.splitlines():
        line = line.strip()
        if line and len(line) < 120:
            # Strip common prefixes like "Job Title:", "Role:", etc.
            line = re.sub(r"^(job title|role|position|title)\s*[:\-]\s*", "", line, flags=re.IGNORECASE)
            if line:
                return line
    return job_description[:80]


def _fetch_market_context(role: str, location: str | None) -> str:
    query = f'"{role}" salary range 2025'
    if location:
        query += f" {location}"

    tavily_key = os.getenv("TAVILY_API_KEY", "").strip()
    if tavily_key:
        try:
            results = TavilyClient(api_key=tavily_key).search(
                query, max_results=4, search_depth="basic"
            )
            snippets = [r["content"][:400] for r in results.get("results", []) if r.get("content")]
            if snippets:
                logger.debug("Tavily returned %d results for: %s", len(snippets), query)
                return "\n\n".join(snippets)
        except Exception:
            logger.debug("Tavily search failed, falling back to DuckDuckGo", exc_info=True)

    try:
        results = list(DDGS().text(query, max_results=4))
        if results:
            logger.debug("DuckDuckGo returned %d results", len(results))
            return "\n\n".join(f"{r['title']}: {r['body'][:300]}" for r in results)
    except Exception:
        logger.debug("DuckDuckGo search failed", exc_info=True)

    return ""


def market_agent_node(state: AnalysisState) -> dict:
    role = _extract_role(state["job_description"])
    context = _fetch_market_context(role, state.get("location"))

    context_block = (
        f"\n\nLIVE MARKET DATA — use these figures directly for salary and demand estimates:\n{context}"
        if context else ""
    )

    location_line = f"\nCANDIDATE LOCATION: {state['location']}" if state.get("location") else ""

    llm = ChatGroq(model=_MODEL, temperature=0)
    result: MarketResult = llm.with_structured_output(MarketResult).invoke([
        SystemMessage(content=_SYSTEM),
        HumanMessage(
            content=(
                f"RESUME:\n{state['resume_text']}\n\n"
                f"JOB DESCRIPTION:\n{state['job_description']}"
                f"{location_line}"
                f"{context_block}"
            )
        ),
    ])
    return {"market_result": result.model_dump()}
