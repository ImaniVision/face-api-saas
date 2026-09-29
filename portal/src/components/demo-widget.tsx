"use client";

import { useState, useRef, useCallback } from "react";
import Webcam from "react-webcam";
import { useSession } from "next-auth/react";
import {
  Camera,
  RotateCcw,
  Loader2,
  CheckCircle2,
  XCircle,
  Aperture,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CameraPermissionModal } from "./camera-permission-modal";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { apiWithToken } from "@/lib/api";

interface VerifyResponse {
  match: boolean;
  confidence: number;
  message: string;
  [key: string]: unknown;
}

export function DemoWidget() {
  const { data: session } = useSession();
  const webcamRef = useRef<Webcam>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState<VerifyResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCameraAllowed, setIsCameraAllowed] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setCapturedImage(imageSrc);
      setResult(null);
      setError(null);
    }
  }, []);

  const reset = () => {
    setCapturedImage(null);
    setResult(null);
    setError(null);
  };

  const verify = async () => {
    if (!capturedImage) return;

    setIsVerifying(true);
    setError(null);

    try {
      // Use the session user ID as a simple token for the proxy
      const token = (session?.user as { id?: string })?.id || null;
      const response = await apiWithToken(token).post("/verify", {
        image: capturedImage,
      });
      setResult(response.data);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ?
          err.message
        : "Verification failed. Ensure the backend is running.";
      setError(errorMessage);
      setResult(null);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <Card className="overflow-hidden border-border/40 bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Aperture className="h-5 w-5 text-fuchsia-400" />
              Live Verification Demo
            </CardTitle>
            <CardDescription className="mt-1">
              Take a selfie and test face verification in real-time
            </CardDescription>
          </div>
          <Badge
            variant="outline"
            className="border-fuchsia-500/30 bg-fuchsia-500/10 text-fuchsia-400"
          >
            Interactive
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Camera / Captured Image */}
        <div className="relative overflow-hidden rounded-lg border border-border/40 bg-black/50">
          {!capturedImage ?
            isCameraAllowed ?
              <Webcam
                ref={webcamRef}
                audio={false}
                screenshotFormat="image/jpeg"
                videoConstraints={{
                  width: 640,
                  height: 480,
                  facingMode: "user",
                }}
                className="w-full"
                mirrored
              />
            : <div className="flex flex-col items-center justify-center p-8 text-center min-h-[300px] h-full bg-black/40">
                <div className="h-16 w-16 rounded-full bg-muted/20 flex items-center justify-center mb-4 border border-border/50">
                  <ShieldAlert className="h-8 w-8 text-fuchsia-400/80" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">
                  Camera Access Required
                </h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-xs">
                  We need your permission to use the camera for secure facial
                  verification.
                </p>
                <Button
                  onClick={() => setIsModalOpen(true)}
                  variant="secondary"
                  className="bg-muted hover:bg-muted/80 text-foreground"
                >
                  <Camera className="mr-2 h-4 w-4" />
                  Grant Permission
                </Button>
              </div>

          : <img src={capturedImage} alt="Captured selfie" className="w-full" />
          }

          {/* Scanning overlay animation */}
          {isVerifying && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
              <div className="flex flex-col items-center gap-3">
                <div className="h-32 w-32 animate-pulse rounded-full border-2 border-dashed border-violet-400/60" />
                <p className="text-sm font-medium text-violet-300">
                  Analyzing face...
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          {!capturedImage ?
            <Button
              onClick={isCameraAllowed ? capture : () => setIsModalOpen(true)}
              className="flex-1 gap-2 bg-linear-to-r from-fuchsia-600 to-pink-600 text-white shadow-lg shadow-fuchsia-500/25 hover:shadow-fuchsia-500/40 transition-all hover:brightness-110"
            >
              <Camera className="h-4 w-4" />
              {isCameraAllowed ? "Capture Selfie" : "Enable Camera"}
            </Button>
          : <>
              <Button
                onClick={verify}
                disabled={isVerifying}
                className="flex-1 gap-2 bg-linear-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all hover:brightness-110"
              >
                {isVerifying ?
                  <Loader2 className="h-4 w-4 animate-spin" />
                : <Camera className="h-4 w-4" />}
                {isVerifying ? "Verifying..." : "Verify Face"}
              </Button>
              <Button
                onClick={reset}
                variant="outline"
                className="gap-2 border-border/60"
              >
                <RotateCcw className="h-4 w-4" />
                Retake
              </Button>
            </>
          }
        </div>

        {/* Result Display */}
        {result && (
          <div
            className={`rounded-lg border p-4 ${
              result.match ?
                "border-green-500/30 bg-green-500/10"
              : "border-red-500/30 bg-red-500/10"
            }`}
          >
            <div className="flex items-center gap-2 mb-3">
              {result.match ?
                <CheckCircle2 className="h-5 w-5 text-green-400" />
              : <XCircle className="h-5 w-5 text-red-400" />}
              <span
                className={`font-semibold ${
                  result.match ? "text-green-400" : "text-red-400"
                }`}
              >
                {result.match ? "Match Found!" : "No Match"}
              </span>
              {result.confidence && (
                <Badge
                  variant="outline"
                  className={`ml-auto ${
                    result.match ?
                      "border-green-500/30 text-green-400"
                    : "border-red-500/30 text-red-400"
                  }`}
                >
                  {(result.confidence * 100).toFixed(1)}% confidence
                </Badge>
              )}
            </div>
            <pre className="overflow-auto rounded-md bg-black/30 p-3 text-xs text-muted-foreground font-mono">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4">
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-400" />
              <span className="text-sm text-red-400">{error}</span>
            </div>
          </div>
        )}
      </CardContent>

      <CameraPermissionModal
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        onPermissionGranted={() => setIsCameraAllowed(true)}
      />
    </Card>
  );
}
