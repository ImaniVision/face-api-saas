"""
FaceEngine: Singleton class for facial recognition operations.
Uses MediaPipe for face detection and InsightFace (ArcFace) for embedding generation.
"""

import cv2
import numpy as np
import mediapipe as mp
from insightface.app import FaceAnalysis
from typing import List
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class FaceEngine:
    """
    Singleton class for facial biometric operations.
    Handles face detection, alignment, and embedding generation.
    """
    
    _instance = None
    _initialized = False
    
    def __new__(cls):
        """Singleton pattern implementation."""
        if cls._instance is None:
            cls._instance = super(FaceEngine, cls).__new__(cls)
        return cls._instance
    
    def __init__(self):
        """Initialize the face recognition models (only once)."""
        if not FaceEngine._initialized:
            logger.info("Initializing FaceEngine...")
            
            # Initialize MediaPipe Face Detection
            self.mp_face_detection = mp.solutions.face_detection
            self.face_detector = self.mp_face_detection.FaceDetection(
                model_selection=1,  # 1 for full-range detection (better for selfies)
                min_detection_confidence=0.7
            )
            
            # Initialize InsightFace for embedding generation
            # Only detection + recognition: buffalo_l's landmark and gender/age models don't affect the
            # embedding (verified identical) but cost ~60 ms p50 / ~200 ms p95 per image on CPU.
            self.face_analyzer = FaceAnalysis(
                name='buffalo_l',  # High-quality model
                allowed_modules=['detection', 'recognition'],
                providers=['CPUExecutionProvider']  # Use GPU if available: ['CUDAExecutionProvider', 'CPUExecutionProvider']
            )
            # 320x320 detection: 45 ms vs 189 ms at 640 on CPU. Re-validated on LFW before adopting
            # (FRR 2.1% vs 2.2%, 0 false accepts in 155k): spikes/ironmask/RESULTS.md.
            self.face_analyzer.prepare(ctx_id=0, det_size=(320, 320))
            
            FaceEngine._initialized = True
            logger.info("FaceEngine initialized successfully!")
    
    def _preprocess_image(self, image_bytes: bytes) -> np.ndarray:
        """
        Decode image bytes to a BGR numpy array (OpenCV's order, which InsightFace expects).
        """
        nparr = np.frombuffer(image_bytes, np.uint8)
        image_bgr = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if image_bgr is None:
            raise ValueError("Failed to decode image")
        return image_bgr

    def _detect_faces(self, image_bgr: np.ndarray) -> int:
        """
        Count faces with MediaPipe, which (unlike InsightFace) expects RGB.
        """
        results = self.face_detector.process(cv2.cvtColor(image_bgr, cv2.COLOR_BGR2RGB))
        
        if not results.detections:
            return 0
        
        return len(results.detections)
    
    def image_to_vector(self, image_bytes: bytes) -> List[float]:
        """
        Convert an image to a 512-dimensional facial embedding vector.
        
        This method:
        1. Detects faces in the image
        2. Validates exactly one face is present (security requirement)
        3. Generates a normalized 512D embedding using ArcFace
        
        Args:
            image_bytes: Raw image bytes
            
        Returns:
            List of 512 float values representing the facial embedding
            
        Raises:
            ValueError: If no face or multiple faces are detected
        """
        image_bgr = self._preprocess_image(image_bytes)

        # Detect faces using MediaPipe (fast pre-check)
        num_faces = self._detect_faces(image_bgr)
        
        if num_faces == 0:
            raise ValueError("No face detected in the image")
        elif num_faces > 1:
            raise ValueError(f"Multiple faces detected ({num_faces}). Please ensure only one face is visible")
        
        # InsightFace expects BGR; feeding it RGB cost 10 points of FRR at τ on LFW
        # (spikes/ironmask/RESULTS.md).
        faces = self.face_analyzer.get(image_bgr)
        
        if len(faces) == 0:
            raise ValueError("Face detected but embedding generation failed")
        
        if len(faces) > 1:
            raise ValueError(f"Multiple faces detected during embedding ({len(faces)})")
        
        # Extract and normalize the embedding
        embedding = faces[0].embedding
        
        # Normalize the vector (L2 normalization)
        norm = np.linalg.norm(embedding)
        if norm > 0:
            embedding = embedding / norm
        
        # Convert to list for JSON serialization
        return embedding.tolist()


# Global singleton instance
face_engine = FaceEngine()
