# Quick Start Guide - Run Locally (No Docker)

## Option 1: Use Pre-built InsightFace (Recommended for Windows)

```bash
# 1. Create virtual environment
python -m venv venv
venv\Scripts\activate

# 2. Install everything EXCEPT insightface first
pip install fastapi uvicorn python-multipart opencv-python-headless mediapipe numpy scikit-learn Pillow pydantic python-dotenv onnxruntime

# 3. Try installing insightface (may work without compilation)
pip install insightface

# 4. Run the service
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Option 2: Use Alternative Face Recognition Library

If insightface still fails, use `face_recognition` library instead:

```bash
pip install face-recognition
```

Then I can modify the code to use this library instead.

## Option 3: Use Google Colab (Cloud-based, No Installation)

Run the entire service in Google Colab for free:

1. Upload the code to Google Drive
2. Run in Colab with GPU support
3. Use ngrok to expose the API

## What to Tell Your Friend

**Problem**:

- Debian Trixie (testing branch) package repositories are unstable
- Docker build fails at `apt-get install` with exit code 100
- This is a known issue with Debian testing branch

**Possible Fixes**:

1. Use a stable Debian base image (bookworm instead of trixie)
2. Add retry logic to apt-get
3. Use a different base image (Ubuntu, Alpine)
4. Skip Docker and run locally

**Quick Fix I Can Implement**:
Change Docker base image from `python:3.10-slim` (uses Debian Trixie) to `python:3.10-slim-bookworm` (stable Debian)
