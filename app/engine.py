"""
FaceEngine: Singleton class for facial recognition operations.
Uses MediaPipe for face detection and InsightFace (ArcFace) for embedding generation.
"""

import cv2
import numpy as np
import mediapipe as mp
from insightface.app import FaceAnalysis
from typing import Optional, Tuple, List
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
            self.face_analyzer = FaceAnalysis(
                name='buffalo_l',  # High-quality model
                providers=['CPUExecutionProvider']  # Use GPU if available: ['CUDAExecutionProvider', 'CPUExecutionProvider']
            )
            self.face_analyzer.prepare(ctx_id=0, det_size=(640, 640))
            
            FaceEngine._initialized = True
            logger.info("FaceEngine initialized successfully!")
    
    def _preprocess_image(self, image_bytes: bytes) -> np.ndarray:
        """
        Convert image bytes to numpy array in RGB format.
        
        Args:
            image_bytes: Raw image bytes
            
        Returns:
            numpy array in RGB format
        """
        # Decode image
        nparr = np.frombuffer(image_bytes, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if image is None:
            raise ValueError("Failed to decode image")
        
        # Convert BGR to RGB (MediaPipe and InsightFace expect RGB)
        image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        return image_rgb
    
    def _detect_faces(self, image_rgb: np.ndarray) -> int:
        """
        Detect faces in the image using MediaPipe.
        
        Args:
            image_rgb: Image in RGB format
            
        Returns:
            Number of faces detected
        """
        results = self.face_detector.process(image_rgb)
        
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
        # Preprocess image
        image_rgb = self._preprocess_image(image_bytes)
        
        # Detect faces using MediaPipe (fast pre-check)
        num_faces = self._detect_faces(image_rgb)
        
        if num_faces == 0:
            raise ValueError("No face detected in the image")
        elif num_faces > 1:
            raise ValueError(f"Multiple faces detected ({num_faces}). Please ensure only one face is visible")
        
        # Generate embedding using InsightFace
        faces = self.face_analyzer.get(image_rgb)
        
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
    
    def verify_match(
        self, 
        current_image_bytes: bytes, 
        saved_vector: List[float],
        threshold: float = 0.6
    ) -> Tuple[bool, float]:
        """
        Verify if a live image matches a saved facial embedding.
        
        This method:
        1. Generates embedding from the current image
        2. Calculates cosine similarity with the saved vector
        3. Compares against threshold for authentication decision
        
        Args:
            current_image_bytes: Raw bytes of the current/live image
            saved_vector: Previously saved 512D embedding (from database)
            threshold: Similarity threshold for match (default: 0.6 for strict security)
            
        Returns:
            Tuple of (is_match: bool, confidence: float)
            - is_match: True if similarity >= threshold
            - confidence: Cosine similarity score (0.0 to 1.0)
            
        Raises:
            ValueError: If face detection/embedding fails
        """
        # Generate embedding from current image
        current_vector = self.image_to_vector(current_image_bytes)
        
        # Convert to numpy arrays
        current_vec = np.array(current_vector)
        saved_vec = np.array(saved_vector)
        
        # Ensure vectors are normalized
        current_vec = current_vec / np.linalg.norm(current_vec)
        saved_vec = saved_vec / np.linalg.norm(saved_vec)
        
        # Calculate cosine similarity
        # For normalized vectors: cosine_similarity = dot_product
        similarity = float(np.dot(current_vec, saved_vec))
        
        # Clamp to [0, 1] range (should already be, but just in case)
        similarity = max(0.0, min(1.0, similarity))
        
        # Determine match based on threshold
        is_match = similarity >= threshold
        
        logger.info(f"Verification result: similarity={similarity:.4f}, threshold={threshold}, match={is_match}")
        
        return is_match, similarity


# Global singleton instance
face_engine = FaceEngine()
