import asyncio
import logging

from fastapi import APIRouter, File, Form, Header, HTTPException, Request, UploadFile
from fastapi.responses import Response

from app.agents.graph import analysis_graph
from app.agents.market_agent import _extract_role
from app.limiter import limiter
from app.schemas.response import AnalysisResult
from app.services.pdf_parser import parse_pdf
from app.services.pii_sanitizer import sanitize
from app.services.report_generator import generate_report
from app.services.storage import get_analysis, get_user_analyses, get_user_id_from_token, save_analysis

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1")

_MAX_PDF_BYTES = 10 * 1024 * 1024  # 10 MB
_ANALYSIS_TIMEOUT = 90  # seconds


@router.post("/analyze-resume", response_model=AnalysisResult)
@limiter.limit("20/hour")
async def analyze_resume(
    request: Request,
    file: UploadFile = File(..., description="PDF resume"),
    job_description: str = Form(..., min_length=10, max_length=10_000),
    location: str | None = Form(None),
    authorization: str | None = Header(None),
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

    try:
        state = await asyncio.wait_for(
            asyncio.to_thread(
                analysis_graph.invoke,
                {
                    "resume_text": sanitized_text,
                    "job_description": sanitized_job,
                    "location": location,
                    "hr_result": None,
                    "tech_result": None,
                    "market_result": None,
                    "final_result": None,
                },
            ),
            timeout=_ANALYSIS_TIMEOUT,
        )
    except asyncio.TimeoutError:
        raise HTTPException(
            status_code=504,
            detail="Analysis timed out. The AI agents took too long to respond. Please try again.",
        )

    if not state.get("final_result"):
        raise HTTPException(status_code=500, detail="Analysis pipeline failed to produce a result.")

    result = AnalysisResult(**state["final_result"])

    # Extract user from JWT (non-fatal)
    user_id: str | None = None
    if authorization and authorization.startswith("Bearer "):
        token = authorization[7:]
        try:
            user_id = await asyncio.to_thread(get_user_id_from_token, token)
        except Exception:
            pass

    # Persist to Supabase (non-fatal if it fails)
    try:
        job_title = _extract_role(sanitized_job)
        analysis_id = await asyncio.to_thread(
            save_analysis, result.model_dump(exclude={"analysis_id"}), user_id, job_title
        )
        result.analysis_id = analysis_id
    except Exception:
        logger.warning("Failed to save analysis to Supabase", exc_info=True)

    return result


@router.get("/analyses")
async def list_analyses(authorization: str | None = Header(None)) -> list[dict]:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Authentication required.")
    token = authorization[7:]
    user_id = await asyncio.to_thread(get_user_id_from_token, token)
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid or expired token.")
    return await asyncio.to_thread(get_user_analyses, user_id)


@router.get("/results/{analysis_id}", response_model=AnalysisResult)
async def get_result(analysis_id: str):
    data = await asyncio.to_thread(get_analysis, analysis_id)
    if not data:
        raise HTTPException(status_code=404, detail="Analysis not found.")
    return AnalysisResult(analysis_id=analysis_id, **data)


@router.post("/generate-report")
async def generate_report_endpoint(result: AnalysisResult) -> Response:
    pdf_bytes = await asyncio.to_thread(generate_report, result)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=resume-analysis-report.pdf"},
    )
