from pydantic import BaseModel, Field


class AgentFeedback(BaseModel):
    score: int = Field(..., ge=0, le=100)
    summary: str
    details: list[str]


class AnalysisResult(BaseModel):
    overall_score: int = Field(..., ge=0, le=100)
    missing_keywords: list[str]
    strengths: list[str]
    agent_feedback: dict[str, AgentFeedback]
