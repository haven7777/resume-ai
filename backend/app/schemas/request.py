from pydantic import BaseModel, Field


class AnalyzeRequest(BaseModel):
    job_description: str = Field(..., min_length=10, max_length=10_000)


class ParsedPayload(BaseModel):
    raw_text: str
    sanitized_text: str
    job_description: str
    parser_used: str
