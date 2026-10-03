"""
FastAPI ML Service for Facial Biometric Authentication.
Enrols faces as cancelable (IronMask) templates and verifies against them. Raw embeddings
never leave this service.
"""

import base64
import binascii
import hmac
import logging
import os
from typing import List, Optional

from fastapi import Depends, FastAPI, File, Form, Header, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from app.engine import face_engine
from app.protection import ENROLMENT_PHOTOS, FP32, HELPER_BYTES, ProtectedTemplate, enrolment_template, protect, verify

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Shared secret the gateway sends on every call. Fail closed: refuse to start without it,
# so the service can never run unauthenticated by accident.
ML_SERVICE_API_KEY = os.environ.get("ML_SERVICE_API_KEY", "")
if not ML_SERVICE_API_KEY:
    raise RuntimeError("ML_SERVICE_API_KEY is not set; the ML service will not start without gateway auth")

# Format new templates are written in (1 = fp32, the validated production format; 2 = int8 candidate).
# Verification reads every known format, so old and new templates coexist during a migration.
ENROL_TEMPLATE_VERSION = int(os.environ.get("ENROL_TEMPLATE_VERSION", str(FP32)))
if ENROL_TEMPLATE_VERSION not in HELPER_BYTES:
    raise RuntimeError(f"ENROL_TEMPLATE_VERSION must be one of {sorted(HELPER_BYTES)}")


async def require_gateway_key(x_ml_service_key: Optional[str] = Header(default=None)) -> None:
    """Reject any caller that isn't the gateway."""
    if x_ml_service_key is None or not hmac.compare_digest(
        x_ml_service_key.encode(), ML_SERVICE_API_KEY.encode()
    ):
        raise HTTPException(status_code=401, detail="Unauthorized")

# Initialize FastAPI app
app = FastAPI(
    title="Facial Biometric ML Service",
    description="Stateless ML service for facial recognition authentication",
    version="2.0.0"
)

# CORS middleware for cross-origin requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class EnrollResponse(BaseModel):
    """A protected template. Store both fields; neither reveals the face on its own."""
    digest: str = Field(..., description="Base64 SHA-256 of the secret codeword (32 bytes)")
    helper: str = Field(..., description="Base64 orthogonal matrix P in the layout `version` names")
    version: int = Field(..., description="Template format: 1 = fp32 (1 MiB), 2 = int8 (257 KiB)")


class VerifyResponse(BaseModel):
    """No similarity score: a protected template only yields match / no match."""
    match: bool = Field(..., description="Whether the face matches the enrolled template")


@app.get("/")
async def root():
    """Health check endpoint."""
    return {
        "service": "Facial Biometric ML Service",
        "status": "operational",
        "version": "2.0.0"
    }


@app.get("/health")
async def health_check():
    """Detailed health check endpoint."""
    return {
        "status": "healthy",
        "engine_initialized": face_engine._initialized
    }


async def _read_image(file: UploadFile, label: str) -> bytes:
    image_bytes = await file.read()
    if len(image_bytes) == 0:
        raise HTTPException(status_code=400, detail=f"{label}: empty file uploaded")
    return image_bytes


def _embed(image_bytes: bytes, label: str) -> List[float]:
    try:
        return face_engine.image_to_vector(image_bytes)
    except ValueError as e:
        # No face, several faces, undecodable: the caller can fix these by retaking the photo.
        logger.warning(f"Face detection error ({label}): {e}")
        raise HTTPException(status_code=400, detail=f"{label}: {e}")


@app.post("/enroll", response_model=EnrollResponse, dependencies=[Depends(require_gateway_key)])
async def enroll(files: List[UploadFile] = File(...)):
    """
    Build a protected template from ENROLMENT_PHOTOS photos of one person.

    Each photo must contain exactly one face, and every photo must match the averaged template
    under τ (so one template can't mix people). Returns 400 with the failing photo's number.
    """
    if len(files) != ENROLMENT_PHOTOS:
        raise HTTPException(status_code=400, detail=f"Enrolment needs exactly {ENROLMENT_PHOTOS} photos, got {len(files)}")
    try:
        vectors = [_embed(await _read_image(f, f"Photo {i}"), f"Photo {i}") for i, f in enumerate(files, start=1)]
        try:
            template = protect(enrolment_template(vectors), ENROL_TEMPLATE_VERSION)
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))
        logger.info("Enrolled a protected template")
        return EnrollResponse(
            digest=base64.b64encode(template.digest).decode(),
            helper=base64.b64encode(template.helper).decode(),
            version=template.version,
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in /enroll: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error during enrolment")


@app.post("/verify", response_model=VerifyResponse, dependencies=[Depends(require_gateway_key)])
async def verify_face(
    file: UploadFile = File(...),
    helper: UploadFile = File(..., description="The stored P, raw bytes"),
    digest: str = Form(..., description="The stored digest, base64"),
    version: int = Form(..., description="The stored template version"),
):
    """
    1:1: does this live photo match the one protected template the gateway looked up?
    The decision (and α) lives in app.protection.
    """
    try:
        try:
            template = ProtectedTemplate(base64.b64decode(digest, validate=True), await helper.read(), version)
        except binascii.Error:
            raise HTTPException(status_code=400, detail="Malformed protected template")
        probe = _embed(await _read_image(file, "Photo"), "Photo")
        try:
            match = verify(probe, template)
        except ValueError:
            raise HTTPException(status_code=400, detail="Malformed protected template")
        logger.info(f"Verification complete: match={match}")
        return VerifyResponse(match=match)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in /verify: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error during verification")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
