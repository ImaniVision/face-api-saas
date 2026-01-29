/**
 * React Frontend Integration Example
 * Shows how to build registration and login pages with camera integration
 */

// ============================================
// 1. INSTALL DEPENDENCIES
// ============================================

/*
npm install react-webcam axios
npm install --save-dev @types/react-webcam
*/

// ============================================
// 2. CAMERA COMPONENT (FaceCapture.tsx)
// ============================================

import React, { useRef, useState, useCallback } from "react";
import Webcam from "react-webcam";

interface FaceCaptureProps {
  onCapture: (imageBlob: Blob) => void;
  buttonText?: string;
}

export const FaceCapture: React.FC<FaceCaptureProps> = ({
  onCapture,
  buttonText = "Capture Photo",
}) => {
  const webcamRef = useRef<Webcam>(null);
  const [imgSrc, setImgSrc] = useState<string | null>(null);

  const videoConstraints = {
    width: 640,
    height: 480,
    facingMode: "user", // Front camera
  };

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setImgSrc(imageSrc);

      // Convert base64 to Blob
      fetch(imageSrc)
        .then((res) => res.blob())
        .then((blob) => onCapture(blob));
    }
  }, [webcamRef, onCapture]);

  const retake = () => {
    setImgSrc(null);
  };

  return (
    <div className="face-capture">
      {!imgSrc ?
        <>
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            videoConstraints={videoConstraints}
            className="webcam-preview"
          />
          <button onClick={capture} className="btn-capture">
            {buttonText}
          </button>
        </>
      : <>
          <img src={imgSrc} alt="Captured face" className="captured-image" />
          <button onClick={retake} className="btn-retake">
            Retake Photo
          </button>
        </>
      }
    </div>
  );
};

// ============================================
// 3. REGISTRATION PAGE (RegisterPage.tsx)
// ============================================

import React, { useState } from "react";
import axios from "axios";
import { FaceCapture } from "./FaceCapture";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";

export const RegisterPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [faceImage, setFaceImage] = useState<Blob | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleFaceCapture = (imageBlob: Blob) => {
    setFaceImage(imageBlob);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !name || !faceImage) {
      setError("Please fill all fields and capture your photo");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("name", name);
      formData.append("face_image", faceImage, "face.jpg");

      const response = await axios.post(`${API_URL}/auth/register`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Save token to localStorage
      localStorage.setItem("token", response.data.token);

      setSuccess(true);

      // Redirect to dashboard or home
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1500);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || "Registration failed";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <h1>Create Account</h1>

      {success ?
        <div className="success-message">
          ✅ Registration successful! Redirecting...
        </div>
      : <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
            />
          </div>

          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your Name"
              required
            />
          </div>

          <div className="form-group">
            <label>Face Photo</label>
            <FaceCapture
              onCapture={handleFaceCapture}
              buttonText="Capture Your Face"
            />
          </div>

          {error && <div className="error-message">❌ {error}</div>}

          <button
            type="submit"
            disabled={loading || !faceImage}
            className="btn-submit"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>
      }
    </div>
  );
};

// ============================================
// 4. LOGIN PAGE (LoginPage.tsx)
// ============================================

import React, { useState } from "react";
import axios from "axios";
import { FaceCapture } from "./FaceCapture";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [faceImage, setFaceImage] = useState<Blob | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFaceCapture = (imageBlob: Blob) => {
    setFaceImage(imageBlob);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !faceImage) {
      setError("Please enter email and capture your photo");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("face_image", faceImage, "face.jpg");

      const response = await axios.post(`${API_URL}/auth/login`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Save token to localStorage
      localStorage.setItem("token", response.data.token);

      // Redirect to dashboard
      window.location.href = "/dashboard";
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || "Login failed";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <h1>Login with Face</h1>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
          />
        </div>

        <div className="form-group">
          <label>Face Verification</label>
          <FaceCapture
            onCapture={handleFaceCapture}
            buttonText="Capture Face to Login"
          />
        </div>

        {error && <div className="error-message">❌ {error}</div>}

        <button
          type="submit"
          disabled={loading || !faceImage}
          className="btn-submit"
        >
          {loading ? "Verifying..." : "Login"}
        </button>
      </form>

      <div className="alternative-login">
        <p>
          Don't have an account? <a href="/register">Create one</a>
        </p>
      </div>
    </div>
  );
};

// ============================================
// 5. STYLES (styles.css)
// ============================================

/*
.face-capture {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 2px dashed #ccc;
  border-radius: 8px;
}

.webcam-preview,
.captured-image {
  width: 100%;
  max-width: 640px;
  border-radius: 8px;
}

.btn-capture,
.btn-retake,
.btn-submit {
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-capture,
.btn-submit {
  background: #007bff;
  color: white;
}

.btn-capture:hover,
.btn-submit:hover {
  background: #0056b3;
}

.btn-retake {
  background: #6c757d;
  color: white;
}

.btn-submit:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.error-message {
  padding: 1rem;
  background: #f8d7da;
  color: #721c24;
  border-radius: 6px;
  margin: 1rem 0;
}

.success-message {
  padding: 1rem;
  background: #d4edda;
  color: #155724;
  border-radius: 6px;
  margin: 1rem 0;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 1rem;
}
*/
