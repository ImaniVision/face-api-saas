# System Architecture: How "Face Scanning" Works

This document explains how the **NestJS Backend**, **Python ML Service**, and **PostgreSQL** work together to implement face scanning and authentication.

## The Core Concept: Vectorization

"Scanning a face" in this system means converting a face image into a list of **512 numbers** (a vector). These numbers represent the unique features of a face.

- **Same Face** = Similar numbers (Vectors point in the same direction).
- **Different Face** = Different numbers (Vectors point in different directions).

## Data Flow Diagrams

### 1. Registration (scanning for the first time)

User uploads a photo. We don't store the photo itself for security; we store the **numbers**.

```mermaid
sequenceDiagram
    participant User
    participant NestJS as NestJS (API Gateway)
    participant Python as Python ML Service
    participant DB as PostgreSQL (pgvector)

    User->>NestJS: Uploads Photo (POST /auth/register)

    rect rgb(200, 220, 240)
        Note right of NestJS: "The Scanning Step"
        NestJS->>Python: Send Image
        Python->>Python: Detect Face & Generate 512D Vector
        Python-->>NestJS: Return Vector [0.12, -0.05, ...]
    end

    NestJS->>DB: Save User + Vector (INSERT INTO biometrics)
    NestJS-->>User: Registration Complete
```

### 2. Login (Scanning to verify)

User uploads a new photo. We check if it matches the numbers we stored earlier.

```mermaid
sequenceDiagram
    participant User
    participant NestJS as NestJS (API Gateway)
    participant Python as Python ML Service
    participant DB as PostgreSQL (pgvector)

    User->>NestJS: Uploads Selfie (POST /auth/login)
    NestJS->>DB: Fetch stored User Vector

    rect rgb(200, 220, 240)
        Note right of NestJS: "Scan New Image"
        NestJS->>Python: Send New Image
        Python->>Python: Generate NEW 512D Vector
        Python-->>NestJS: Return New Vector
    end

    NestJS->>NestJS: Compare Stored vs New (Cosine Similarity)

    alt Match > 0.6
        NestJS-->>User: Success (JWT Token)
    else Match < 0.6
        NestJS-->>User: Access Denied
    end
```

## Component Roles

1.  **NestJS (API Gateway)**: The coordinator. It receives requests, talks to the "Brain" (ML Service), and saves results to the "Memory" (Database).
2.  **Python ML Service (The Brain)**: The only component that "sees" the face. It uses AI models (InsightFace) to turn pixels into numbers.
3.  **PostgreSQL + pgvector (The Memory)**: efficiently stores these high-dimensional vectors and can search them.
