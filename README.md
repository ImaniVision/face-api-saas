# Facial Biometric ML Service

A production-ready, stateless ML service for facial biometric authentication using MediaPipe (face detection) and InsightFace (ArcFace embeddings).

## 🎯 Overview

This service powers a facial recognition login system with two main flows:

1. **Enrollment**: User takes selfie → Generate 512D embedding → Save to database
2. **Authentication**: User takes selfie → Generate embedding → Compare with saved embedding → Grant/Deny access

## 🏗️ Architecture

- **Framework**: FastAPI (Python 3.10+)
- **Face Detection**: MediaPipe
- **Embedding Generation**: InsightFace (ArcFace model - 512 dimensions)
- **Vector Math**: NumPy
- **Deployment**: Docker

## 📁 Project Structure

```
facial-recognition-saas/
├── app/
│   ├── __init__.py
│   ├── engine.py          # FaceEngine singleton class
│   └── main.py            # FastAPI endpoints
├── requirements.txt       # Python dependencies
├── Dockerfile            # Production-ready container
├── .dockerignore
├── .gitignore
└── README.md
```

## 🚀 Quick Start

### Local Development

1. **Create virtual environment**:

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. **Install dependencies**:

```bash
pip install -r requirements.txt
```

3. **Run the service**:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

4. **Access API docs**:

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### Docker Deployment

1. **Build the image**:

```bash
docker build -t facial-ml-service .
```

2. **Run the container**:

```bash
docker run -p 8000:8000 facial-ml-service
```

## 📡 API Endpoints

### POST `/vectorize`

Generate a 512-dimensional facial embedding from an image.

**Usage**: Called during user registration/enrollment.

**Request**:

```bash
curl -X POST "http://localhost:8000/vectorize" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@selfie.jpg"
```

**Response**:

```json
{
  "vector": [0.12, -0.4, 0.23, ...]  // 512 floats
}
```

**Error Cases**:

- `400`: No face detected
- `400`: Multiple faces detected (security risk)

---

### POST `/verify_user`

Verify if a live image matches a saved facial embedding.

**Usage**: Called during user login/authentication.

**Request**:

```bash
curl -X POST "http://localhost:8000/verify_user" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@login_selfie.jpg" \
  -F 'saved_vector=[0.12, -0.4, ...]'
```

**Response**:

```json
{
  "match": true,
  "confidence": 0.87
}
```

**Parameters**:

- `file`: Live image from login attempt
- `saved_vector`: JSON string of 512D vector from database

**Threshold**: 0.6 (strict for security)

---

### GET `/health`

Health check endpoint.

**Response**:

```json
{
  "status": "healthy",
  "engine_initialized": true
}
```

## 🔒 Security Features

1. **Single Face Validation**: Rejects images with 0 or multiple faces
2. **Strict Threshold**: Uses 0.6 similarity threshold to prevent false positives
3. **Normalized Vectors**: L2 normalization for consistent comparisons
4. **Stateless Design**: No data persistence in ML service
5. **Non-root Docker User**: Container runs as non-privileged user

## 🔗 Integration Guide

### Backend Integration (NestJS Example)

#### Registration Endpoint

```typescript
async registerUser(image: File, userData: UserDto) {
  // 1. Call ML service to vectorize
  const formData = new FormData();
  formData.append('file', image);

  const response = await fetch('http://ml-service:8000/vectorize', {
    method: 'POST',
    body: formData
  });

  const { vector } = await response.json();

  // 2. Save vector to database
  await this.userRepository.save({
    ...userData,
    biometric_vector: vector  // Store as float[] or use pgvector
  });
}
```

#### Login Endpoint

```typescript
async loginUser(image: File, email: string) {
  // 1. Retrieve saved vector from database
  const user = await this.userRepository.findOne({ email });

  // 2. Call ML service to verify
  const formData = new FormData();
  formData.append('file', image);
  formData.append('saved_vector', JSON.stringify(user.biometric_vector));

  const response = await fetch('http://ml-service:8000/verify_user', {
    method: 'POST',
    body: formData
  });

  const { match, confidence } = await response.json();

  // 3. Generate JWT if match
  if (match) {
    return this.jwtService.sign({ userId: user.id });
  } else {
    throw new UnauthorizedException('Face verification failed');
  }
}
```

### Database Schema (PostgreSQL)

```sql
-- Add to User table
ALTER TABLE users ADD COLUMN biometric_vector FLOAT[512];

-- Optional: Use pgvector extension for efficient similarity search
CREATE EXTENSION vector;
ALTER TABLE users ADD COLUMN biometric_vector vector(512);
```

## 🧪 Testing

### Test Vectorization

```bash
# Upload a test image
curl -X POST "http://localhost:8000/vectorize" \
  -F "file=@test_images/person1.jpg"
```

### Test Verification (Match)

```bash
# Same person
curl -X POST "http://localhost:8000/verify_user" \
  -F "file=@test_images/person1_photo2.jpg" \
  -F 'saved_vector=[...]'  # Vector from person1.jpg
```

### Test Verification (No Match)

```bash
# Different person
curl -X POST "http://localhost:8000/verify_user" \
  -F "file=@test_images/person2.jpg" \
  -F 'saved_vector=[...]'  # Vector from person1.jpg
```

## ⚙️ Configuration

### Threshold Tuning

Adjust the similarity threshold in `app/main.py`:

```python
is_match, confidence = face_engine.verify_match(
    current_image_bytes=image_bytes,
    saved_vector=saved_vector_list,
    threshold=0.6  # Adjust this value
)
```

**Recommendations**:

- `0.5-0.6`: Strict (recommended for login/security)
- `0.4-0.5`: Balanced
- `0.3-0.4`: Lenient (higher false positive risk)

### GPU Support

To enable GPU acceleration, modify `app/engine.py`:

```python
self.face_analyzer = FaceAnalysis(
    name='buffalo_l',
    providers=['CUDAExecutionProvider', 'CPUExecutionProvider']  # GPU first
)
```

And update Dockerfile to use CUDA base image.

## 📊 Performance

- **Vectorization**: ~200-500ms per image (CPU)
- **Verification**: ~200-500ms per image (CPU)
- **Model Size**: ~300MB (buffalo_l)
- **Memory**: ~1-2GB RAM

## 🐛 Troubleshooting

### "No face detected"

- Ensure good lighting
- Face should be clearly visible
- Try different angles

### "Multiple faces detected"

- Ensure only one person in frame
- Remove background people/photos

### Slow performance

- Consider GPU acceleration
- Use smaller model (buffalo_s)
- Implement caching for repeated requests

## 📝 License

MIT

## 🤝 Contributing

Contributions welcome! Please open an issue or PR.

## 📧 Support

For issues or questions, please open a GitHub issue.
