from pydantic import BaseModel, Field


class AgentFeedback(BaseModel):
    score: int = Field(..., ge=0, le=100)
    summary: str
    details: list[str]


class PriorityItem(BaseModel):
    text: str
    priority: str  # "HIGH" | "MEDIUM" | "LOW"


class QuickStats(BaseModel):
    total_keywords: int
    match_rate: int
    experience_gap: str
    salary_range: str


class AnalysisResult(BaseModel):
    analysis_id: str | None = None
    overall_score: int = Field(..., ge=0, le=100)
    missing_keywords: list[str]
    matched_keywords: list[str]
    strengths: list[str]
    agent_feedback: dict[str, AgentFeedback]
    priority_improvements: list[PriorityItem]
    action_items: list[PriorityItem]
    skills_coverage: dict[str, int]
    quick_stats: QuickStats
