# WINDOWS INSTALLATION GUIDE

## Issue: InsightFace Build Error on Windows

The error occurs because `insightface==0.7.3` requires C++ compilation, which needs Microsoft Visual C++ Build Tools.

## Solutions (Choose One)

### ✅ **Solution 1: Use Pre-built Wheel (RECOMMENDED)**

Install a pre-built version that doesn't require compilation:

```bash
# Uninstall if partially installed
pip uninstall insightface -y

# Install pre-built wheel
pip install insightface --no-build-isolation
```

If that doesn't work, try installing from a wheel directly:

```bash
pip install https://github.com/deepinsight/insightface/releases/download/v0.7.3/insightface-0.7.3-cp311-cp311-win_amd64.whl
```

### ✅ **Solution 2: Install Visual C++ Build Tools**

1. Download Microsoft C++ Build Tools:
   https://visualstudio.microsoft.com/visual-cpp-build-tools/

2. Run the installer and select:
   - "Desktop development with C++"
   - Make sure "MSVC" and "Windows SDK" are checked

3. Restart your terminal and try again:
   ```bash
   uv pip install -r requirements.txt
   ```

### ✅ **Solution 3: Use Docker (EASIEST)**

Skip local installation and use Docker instead:

```bash
# Build the Docker image
docker-compose up --build

# Or with docker directly
docker build -t facial-ml-service .
docker run -p 8000:8000 facial-ml-service
```

This avoids all Windows compilation issues!

### ✅ **Solution 4: Use Alternative Package (FASTEST)**

Use a simpler alternative that works on Windows without compilation:

```bash
# Install everything except insightface first
pip install fastapi uvicorn python-multipart opencv-python mediapipe numpy scikit-learn Pillow pydantic python-dotenv

# Then install a compatible version
pip install insightface-unofficial
```

## Recommended Approach

**For Development**: Use Docker (Solution 3)
**For Production**: Always use Docker

Docker ensures:

- ✅ Consistent environment across all platforms
- ✅ No compilation issues
- ✅ Pre-downloaded models
- ✅ Production-ready setup

## Quick Start with Docker

```bash
cd facial-recognition-saas

# Start the service
docker-compose up

# Access API docs at:
# http://localhost:8000/docs
```

That's it! No Python environment setup needed.
