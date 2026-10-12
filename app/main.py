"""
FastAPI ML Service for Facial Biometric Authentication.
Provides endpoints for face vectorization and verification.
"""

from fastapi import Depends, FastAPI, File, Header, UploadFile, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional
import hmac
import logging
import json
import os

from app.engine import face_engine

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Shared secret the gateway sends on every call. Fail closed: refuse to start without it,
# so the service can never run unauthenticated by accident.
ML_SERVICE_API_KEY = os.environ.get("ML_SERVICE_API_KEY", "")
if not ML_SERVICE_API_KEY:
    raise RuntimeError("ML_SERVICE_API_KEY is not set; the ML service will not start without gateway auth")


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
    version="1.0.0"
)

# CORS middleware for cross-origin requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Pydantic models for request/response validation
class VectorizeResponse(BaseModel):
    """Response model for /vectorize endpoint."""
    vector: List[float] = Field(..., description="512-dimensional facial embedding")
    
    class Config:
        json_schema_extra = {
            "example": {
                "vector": [0.12, -0.4, 0.23, "..."]
            }
        }


class VerifyRequest(BaseModel):
    """Request model for /verify_user endpoint (for saved_vector)."""
    saved_vector: List[float] = Field(..., description="Previously saved 512D embedding from database")


class VerifyResponse(BaseModel):
    """Response model for /verify_user endpoint."""
    match: bool = Field(..., description="Whether the faces match")
    confidence: float = Field(..., description="Similarity score (0.0 to 1.0)")
    
    class Config:
        json_schema_extra = {
            "example": {
                "match": True,
                "confidence": 0.87
            }
        }


@app.get("/")
async def root():
    """Health check endpoint."""
    return {
        "service": "Facial Biometric ML Service",
        "status": "operational",
        "version": "1.0.0"
    }


@app.get("/health")
async def health_check():
    """Detailed health check endpoint."""
    return {
        "status": "healthy",
        "engine_initialized": face_engine._initialized
    }


@app.post("/vectorize", response_model=VectorizeResponse, dependencies=[Depends(require_gateway_key)])
async def vectorize(file: UploadFile = File(...)):
    """
    Generate a 512-dimensional facial embedding from an uploaded image.
    
    **Usage**: Called during user registration/enrollment to generate the vector
    that will be saved to the database.
    
    **Security**: 
    - Returns 400 if no face is detected
    - Returns 400 if multiple faces are detected (security risk)
    
    Args:
        file: Image file (JPEG, PNG, etc.)
        
    Returns:
        VectorizeResponse with 512D embedding vector
        
    Raises:
        HTTPException 400: If face detection fails or multiple faces detected
        HTTPException 500: If embedding generation fails
    """
    try:
        # Read image bytes
        image_bytes = await file.read()
        
        if len(image_bytes) == 0:
            raise HTTPException(status_code=400, detail="Empty file uploaded")
        
        # Generate embedding
        vector = face_engine.image_to_vector(image_bytes)
        
        logger.info(f"Successfully generated vector for file: {file.filename}")
        
        return VectorizeResponse(vector=vector)
    
    except ValueError as e:
        # Face detection errors (no face, multiple faces, etc.)
        error_msg = str(e)
        logger.warning(f"Face detection error: {error_msg}")
        raise HTTPException(status_code=400, detail=error_msg)
    
    except Exception as e:
        # Unexpected errors
        logger.error(f"Unexpected error in /vectorize: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error during vectorization")


@app.post("/verify_user", response_model=VerifyResponse, dependencies=[Depends(require_gateway_key)])
async def verify_user(
    file: UploadFile = File(...),
    saved_vector: str = Form(...)
):
    """
    Verify if a live image matches a previously saved facial embedding.
    
    **Usage**: Called during user login to authenticate the user.
    
    **Flow**:
    1. Backend retrieves saved_vector from database for the user
    2. Backend sends live image + saved_vector to this endpoint
    3. Service compares and returns match result
    4. Backend generates JWT if match=true, returns 401 if match=false
    
    **Security**:
    - Match threshold τ is app.matching.MATCH_THRESHOLD (the only one in the system)
    - Returns 400 if no face or multiple faces detected
    
    Args:
        file: Live image file from login attempt
        saved_vector: JSON string of the 512D vector from database
        
    Returns:
        VerifyResponse with match status and confidence score
        
    Raises:
        HTTPException 400: If face detection fails or invalid saved_vector
        HTTPException 500: If verification fails unexpectedly
    """
    try:
        # Read image bytes
        image_bytes = await file.read()
        
        if len(image_bytes) == 0:
            raise HTTPException(status_code=400, detail="Empty file uploaded")
        
        # Parse saved_vector from JSON string
        try:
            saved_vector_list = json.loads(saved_vector)
            
            if not isinstance(saved_vector_list, list):
                raise ValueError("saved_vector must be a list")
            
            if len(saved_vector_list) != 512:
                raise ValueError(f"saved_vector must have 512 dimensions, got {len(saved_vector_list)}")
            
        except json.JSONDecodeError:
            raise HTTPException(status_code=400, detail="Invalid JSON format for saved_vector")
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))
        
        # Perform verification
        is_match, confidence = face_engine.verify_match(
            current_image_bytes=image_bytes,
            saved_vector=saved_vector_list,
        )
        
        logger.info(f"Verification complete: match={is_match}, confidence={confidence:.4f}")
        
        return VerifyResponse(match=is_match, confidence=confidence)
    
    except ValueError as e:
        # Face detection errors
        error_msg = str(e)
        logger.warning(f"Face detection error in verification: {error_msg}")
        raise HTTPException(status_code=400, detail=error_msg)
    
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    
    except Exception as e:
        # Unexpected errors
        logger.error(f"Unexpected error in /verify_user: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error during verification")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
