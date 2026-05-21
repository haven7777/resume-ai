from langchain_core.messages import HumanMessage, SystemMessage
from langchain_groq import ChatGroq
from pydantic import BaseModel, Field

from .state import AnalysisState

_MODEL = "llama-3.3-70b-versatile"

_SYSTEM = """You are a principal engineer doing a technical screen. You reject most candidates. You only pass candidates with clear, specific, evidence-based technical profiles.

CRITICAL RULES:
- Company name-dropping (e.g., "worked at Google") is not a technical achievement unless accompanied by specific project details and impact.
- Listing technologies without describing what was built, at what scale, and with what outcome = no evidence.
- Vague phrases like "experience with distributed systems" or "built REST APIs" are NOT sufficient — they are resume filler.
- A short or generic resume is a red flag, not a neutral signal.

Scoring calibration:
- 0-30: no concrete technical evidence — resume is a list of buzzwords or too vague to evaluate
- 31-50: some relevant skills mentioned but zero project depth, metrics, or specifics
- 51-68: partial evidence — some specifics but missing depth or key technical requirements
- 69-82: solid evidence with minor gaps
- 83-100: strong, specific, well-evidenced technical profile matching the role's requirements

Return:
- technical_score: integer 0-100, calibrated per above. Be ruthless with vague resumes.
- technical_highlights: only achievements with specific evidence (what, how, what scale/outcome). If there are none, return [].
- technical_gaps: concrete gaps between what the role needs and what the resume proves.
- project_depth: one honest sentence. "No concrete projects described", "Vague project descriptions with no measurable impact", or similar are valid outputs.
- strengths: only verifiable, role-relevant technical strengths. Return [] if none exist.
- skills_coverage: estimate the candidate's coverage (0-100) in each of these 5 areas based on the resume evidence: Frontend, Backend, DevOps, Data, Leadership. Return an integer for each.
- summary: 2-3 sentences, direct verdict. If the candidate would be rejected at the technical screen, say so and why."""


class TechResult(BaseModel):
    technical_score: int = Field(..., ge=0, le=100)
    technical_highlights: list[str]
    technical_gaps: list[str]
    project_depth: str
    strengths: list[str]
    skills_coverage: dict[str, int]
    summary: str


def tech_agent_node(state: AnalysisState) -> dict:
    llm = ChatGroq(model=_MODEL, temperature=0)
    result: TechResult = llm.with_structured_output(TechResult).invoke([
        SystemMessage(content=_SYSTEM),
        HumanMessage(content=f"RESUME:\n{state['resume_text']}\n\nJOB DESCRIPTION:\n{state['job_description']}"),
    ])
    return {"tech_result": result.model_dump()}
