import logging
import pathlib
import socket
import uuid

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.services.openai_service import openai_service

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s %(message)s")
logger = logging.getLogger("image-analyzer")

app = FastAPI(title="Image Analyzer API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

ALLOWED_TYPES = {"image/jpeg", "image/png"}
MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024


@app.post("/api/analyze")
async def analyze_image(image: UploadFile = File(...)) -> dict:
    request_id = str(uuid.uuid4())
    logger.info("analysis request started request_id=%s filename=%s", request_id, image.filename)

    if image.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=400,
            detail={
                "code": "INVALID_IMAGE_TYPE",
                "message": "Only JPG and PNG files are supported."
            },
        )

    image_bytes = await image.read()
    if len(image_bytes) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=400,
            detail={
                "code": "FILE_TOO_LARGE",
                "message": "Image must be 10 MB or smaller."
            },
        )

    if not image_bytes:
        raise HTTPException(
            status_code=400,
            detail={
                "code": "EMPTY_FILE",
                "message": "Uploaded file is empty."
            },
        )

    try:
        analysis_markdown = openai_service.analyze_image(image_bytes, image.content_type)
        logger.info("analysis request completed request_id=%s", request_id)
        return {
            "requestId": request_id,
            "analysisMarkdown": analysis_markdown,
        }
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("analysis request failed request_id=%s", request_id)
        raise HTTPException(
            status_code=500,
            detail={
                "code": "ANALYSIS_FAILED",
                "message": str(exc),
            },
        ) from exc


@app.get("/api/health")
async def health() -> dict:
    return {
        "status": "ok",
        "serverHostname": socket.gethostname(),
    }


FRONTEND_DIST = pathlib.Path(__file__).resolve().parents[2] / "frontend" / "dist"
if FRONTEND_DIST.exists():
    app.mount("/", StaticFiles(directory=FRONTEND_DIST, html=True), name="frontend")
