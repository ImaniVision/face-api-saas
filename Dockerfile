# Use stable Debian bookworm
FROM python:3.10-slim-bookworm

WORKDIR /app

ENV PYTHONUNBUFFERED=1 \
    DEBIAN_FRONTEND=noninteractive

# 1. Install System Dependencies
# FIX: Replaced 'libgl1-mesa-glx' with 'libgl1'
# Added 'build-essential' here to ensure InsightFace compiles correctly
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    build-essential \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender1 \
    libgomp1 \
    libgl1 \
    wget \
    ca-certificates && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# 2. Install Python Dependencies
# We install directly here to ensure versions are correct even if requirements.txt is missing
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir \
    fastapi==0.109.0 \
    uvicorn[standard]==0.27.0 \
    python-multipart==0.0.6 \
    onnxruntime==1.16.3 \
    opencv-python-headless==4.9.0.80 \
    mediapipe==0.10.9 \
    numpy==1.24.3 \
    scikit-learn==1.4.0 \
    Pillow==10.2.0 \
    pydantic==2.5.3 \
    python-dotenv==1.0.0 \
    insightface==0.7.3

# 3. Cleanup
# Remove gcc/g++ to keep the image small after installing libraries
RUN apt-get remove -y build-essential && \
    apt-get autoremove -y && \
    apt-get clean

# 4. Download Models
# We removed "|| true" -> If this fails, the build should fail.
RUN python -c "from insightface.app import FaceAnalysis; app = FaceAnalysis(name='buffalo_l'); app.prepare(ctx_id=0)"

# 5. Setup App
COPY ./app ./app

# 6. Security
RUN useradd -m -u 1000 mluser && chown -R mluser:mluser /app
USER mluser

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')" || exit 1

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1"]