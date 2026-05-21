from langchain_core.messages import HumanMessage, SystemMessage
from langchain_groq import ChatGroq
from pydantic import BaseModel, Field

from .state import AnalysisState

_MODEL = "llama-3.3-70b-versatile"

_SYSTEM = """You are a principal software engineer and technical interviewer with deep expertise across
modern software stacks. Analyze the resume for technical depth and return:
- technical_score: overall technical strength for this role (0-100)
- technical_highlights: 3-5 standout technical achievements or projects
- technical_gaps: key technical skills or experience missing for this role
- project_depth: brief assessment of the complexity and quality of projects shown
- strengths: 3-5 technical strengths relevant to the role
- summary: a concise 2-3 sentence technical evaluation

Focus on evidence of real engineering skill: system design, scale, ownership, impact."""


class TechResult(BaseModel):
    technical_score: int = Field(..., ge=0, le=100)
    technical_highlights: list[str]
    technical_gaps: list[str]
    project_depth: str
    strengths: list[str]
    summary: str


def tech_agent_node(state: AnalysisState) -> dict:
    llm = ChatGroq(model=_MODEL, temperature=0)
    result: TechResult = llm.with_structured_output(TechResult).invoke([
        SystemMessage(content=_SYSTEM),
        HumanMessage(content=f"RESUME:\n{state['resume_text']}\n\nJOB DESCRIPTION:\n{state['job_description']}"),
    ])
    return {"tech_result": result.model_dump()}
