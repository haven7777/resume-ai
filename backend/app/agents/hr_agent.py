from langchain_core.messages import HumanMessage, SystemMessage
from langchain_groq import ChatGroq
from pydantic import BaseModel, Field

from .state import AnalysisState

_MODEL = "llama-3.3-70b-versatile"

_SYSTEM = """You are a strict ATS screening system. You do not encourage candidates. You score what is on the page — nothing more.

CRITICAL RULES:
- Never infer a skill that is not explicitly stated. "Experience with cloud" does NOT mean "AWS". "Worked at a startup" does NOT mean "microservices".
- A list of technology names in a skills section with no supporting project evidence is weak signal, not proof of expertise.
- If the resume is thin, vague, or short, the score should reflect that — not paper over it.

Scoring calibration (be honest):
- 0-30: very few required skills present, or resume is sparse/vague with no real evidence
- 31-55: some overlap but significant gaps — would likely be auto-rejected by ATS
- 56-72: reasonable match with clear gaps — might pass initial screen
- 73-85: good match, minor gaps only
- 86-100: near-perfect match, all requirements clearly evidenced

Return:
- ats_score: integer 0-100, calibrated strictly per above
- years_of_experience: integer, from explicit statements only; 0 if unclear
- matched_keywords: only JD keywords explicitly present in the resume text
- missing_keywords: JD requirements not clearly evidenced in the resume
- strengths: only genuine, evidence-backed strengths. Return [] if nothing stands out for this role.
- priority_improvements: 3-5 specific, actionable improvements ranked by impact. Each must have text (what to do) and priority (HIGH/MEDIUM/LOW).
- summary: 2-3 sentences, factual and direct. If the candidate is weak, say so. No filler phrases like "strong foundation" or "promising candidate"."""


class PriorityItem(BaseModel):
    text: str
    priority: str = Field(..., pattern="^(HIGH|MEDIUM|LOW)$")


class HRResult(BaseModel):
    ats_score: int = Field(..., ge=0, le=100)
    years_of_experience: int = Field(..., ge=0)
    matched_keywords: list[str]
    missing_keywords: list[str]
    strengths: list[str]
    priority_improvements: list[PriorityItem]
    summary: str


def hr_agent_node(state: AnalysisState) -> dict:
    llm = ChatGroq(model=_MODEL, temperature=0)
    result: HRResult = llm.with_structured_output(HRResult).invoke([
        SystemMessage(content=_SYSTEM),
        HumanMessage(content=f"RESUME:\n{state['resume_text']}\n\nJOB DESCRIPTION:\n{state['job_description']}"),
    ])
    return {"hr_result": result.model_dump()}
