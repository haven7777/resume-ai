from langchain_core.messages import HumanMessage, SystemMessage
from langchain_groq import ChatGroq
from pydantic import BaseModel, Field

from .state import AnalysisState

_MODEL = "llama-3.3-70b-versatile"

_SYSTEM = """You are a senior HR recruiter and ATS specialist with 15 years of experience.
Analyze the resume against the job description and return:
- ats_score: ATS keyword compatibility (0-100)
- years_of_experience: total relevant years extracted from resume
- matched_keywords: keywords from the JD that appear in the resume
- missing_keywords: important JD keywords absent from the resume
- strengths: 3-5 notable strengths relevant to this specific role
- summary: a concise 2-3 sentence professional evaluation

Be factual. Base your analysis only on what is explicitly stated in the resume."""


class HRResult(BaseModel):
    ats_score: int = Field(..., ge=0, le=100)
    years_of_experience: int = Field(..., ge=0)
    matched_keywords: list[str]
    missing_keywords: list[str]
    strengths: list[str]
    summary: str


def hr_agent_node(state: AnalysisState) -> dict:
    llm = ChatGroq(model=_MODEL, temperature=0)
    result: HRResult = llm.with_structured_output(HRResult).invoke([
        SystemMessage(content=_SYSTEM),
        HumanMessage(content=f"RESUME:\n{state['resume_text']}\n\nJOB DESCRIPTION:\n{state['job_description']}"),
    ])
    return {"hr_result": result.model_dump()}
