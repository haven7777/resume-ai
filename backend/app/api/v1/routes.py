import asyncio

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from fastapi.responses import Response

from app.agents.graph import analysis_graph
from app.schemas.response import AnalysisResult
from app.services.pdf_parser import parse_pdf
from app.services.pii_sanitizer import sanitize
from app.services.report_generator import generate_report

router = APIRouter(prefix="/api/v1")

_MAX_PDF_BYTES = 10 * 1024 * 1024  # 10 MB


@router.post("/analyze-resume", response_model=AnalysisResult)
async def analyze_resume(
    file: UploadFile = File(..., description="PDF resume"),
    job_description: str = Form(..., min_length=10, max_length=10_000),
):
    if file.content_type not in ("application/pdf", "application/octet-stream"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted.")

    first_chunk = await file.read(_MAX_PDF_BYTES + 1)
    if len(first_chunk) > _MAX_PDF_BYTES:
        raise HTTPException(status_code=413, detail="PDF exceeds 10 MB limit.")
    await file.seek(0)

    raw_text = await parse_pdf(file)
    if not raw_text.strip():
        raise HTTPException(status_code=422, detail="Could not extract text from PDF.")

    sanitized_text = sanitize(raw_text)
    sanitized_job = sanitize(job_description)

    # Run LangGraph pipeline in a thread so it doesn't block the event loop
    state = await asyncio.to_thread(
        analysis_graph.invoke,
        {
            "resume_text": sanitized_text,
            "job_description": sanitized_job,
            "hr_result": None,
            "tech_result": None,
            "market_result": None,
            "final_result": None,
        },
    )

    if not state.get("final_result"):
        raise HTTPException(status_code=500, detail="Analysis pipeline failed to produce a result.")

    return AnalysisResult(**state["final_result"])


@router.post("/generate-report")
async def generate_report_endpoint(result: AnalysisResult) -> Response:
    pdf_bytes = await asyncio.to_thread(generate_report, result)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=resume-analysis-report.pdf"},
    )
