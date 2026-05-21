from typing import Any, Optional, TypedDict


class AnalysisState(TypedDict):
    resume_text: str
    job_description: str
    hr_result: Optional[dict[str, Any]]
    tech_result: Optional[dict[str, Any]]
    market_result: Optional[dict[str, Any]]
    final_result: Optional[dict[str, Any]]
