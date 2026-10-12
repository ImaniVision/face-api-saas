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
  ChevronDown,
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
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCameraAllowed, setIsCameraAllowed] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setCapturedImage(imageSrc);
      setResult(null);
      setLatencyMs(null);
      setError(null);
    }
  }, []);

  const reset = () => {
    setCapturedImage(null);
    setResult(null);
    setLatencyMs(null);
    setError(null);
  };

  const verify = async () => {
    if (!capturedImage) return;

    setIsVerifying(true);
    setError(null);

    const started = performance.now();
    try {
      const token = (session?.user as { id?: string })?.id || null;
      const response = await apiWithToken(token).post("/verify", {
        image: capturedImage,
      });
      setLatencyMs(Math.round(performance.now() - started));
      setResult(response.data);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Verification failed. Ensure the backend is running.";
      setError(errorMessage);
      setResult(null);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <Card className="overflow-hidden border-border bg-white">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg text-ink">
              <Aperture className="h-5 w-5 text-signal" />
              Live Verification Demo
            </CardTitle>
            <CardDescription className="mt-1">
              Capture a face and run a real verification against the API
            </CardDescription>
          </div>
          <Badge variant="outline" className="border-signal/30 bg-signal/[0.07] text-signal">
            Interactive
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative overflow-hidden rounded-xl border border-border bg-navy">
          {!capturedImage ? (
            isCameraAllowed ? (
              <Webcam
                ref={webcamRef}
                audio={false}
                screenshotFormat="image/jpeg"
                videoConstraints={{ width: 640, height: 480, facingMode: "user" }}
                className="w-full"
                mirrored
              />
            ) : (
              <div className="flex min-h-[300px] h-full flex-col items-center justify-center bg-navy p-8 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-white/15 bg-white/[0.06]">
                  <ShieldAlert className="h-8 w-8 text-amber" />
                </div>
                <h3 className="mb-2 text-lg font-medium text-white">
                  Camera Access Required
                </h3>
                <p className="mb-6 max-w-xs text-sm text-white/60">
                  We need your permission to use the camera for facial
                  verification.
                </p>
                <Button
                  onClick={() => setIsModalOpen(true)}
                  className="bg-signal text-white hover:bg-signal/90"
                >
                  <Camera className="mr-2 h-4 w-4" />
                  Grant Permission
                </Button>
              </div>
            )
          ) : (
            <img src={capturedImage} alt="Captured selfie" className="w-full" />
          )}

          {isVerifying && (
            <div className="absolute inset-0 flex items-center justify-center bg-navy/50 backdrop-blur-[2px]">
              <div className="flex flex-col items-center gap-3">
                <div className="h-28 w-28 animate-pulse rounded-full border-2 border-dashed border-white/50" />
                <p className="text-sm font-medium text-white">Analyzing face…</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          {!capturedImage ? (
            <Button
              onClick={isCameraAllowed ? capture : () => setIsModalOpen(true)}
              className="flex-1 bg-signal text-white hover:bg-signal/90"
            >
              <Camera className="mr-2 h-4 w-4" />
              {isCameraAllowed ? "Capture Selfie" : "Enable Camera"}
            </Button>
          ) : (
            <>
              <Button
                onClick={verify}
                disabled={isVerifying}
                className="flex-1 bg-signal text-white hover:bg-signal/90"
              >
                {isVerifying ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Camera className="mr-2 h-4 w-4" />
                )}
                {isVerifying ? "Verifying…" : "Verify Face"}
              </Button>
              <Button onClick={reset} variant="outline" className="gap-2">
                <RotateCcw className="h-4 w-4" />
                Retake
              </Button>
            </>
          )}
        </div>

        {result && (
          <div
            className={`rounded-xl border p-4 ${
              result.match
                ? "border-verified/30 bg-verified/[0.07]"
                : "border-destructive/30 bg-destructive/[0.05]"
            }`}
          >
            <div className="flex items-center gap-2">
              {result.match ? (
                <CheckCircle2 className="h-5 w-5 text-verified" />
              ) : (
                <XCircle className="h-5 w-5 text-destructive" />
              )}
              <span
                className={`font-semibold ${result.match ? "text-verified" : "text-destructive"}`}
              >
                {result.match ? "Match found" : "No match"}
              </span>
              {latencyMs !== null && (
                <span className="ml-auto font-mono text-xs text-ink/50">{latencyMs}ms</span>
              )}
            </div>

            {typeof result.confidence === "number" && (
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-ink/60">Confidence</span>
                  <span className="font-mono font-semibold text-ink">
                    {(result.confidence * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-ink/10">
                  <div
                    className={`h-full rounded-full ${result.match ? "bg-verified" : "bg-destructive"}`}
                    style={{ width: `${Math.min(100, result.confidence * 100)}%` }}
                  />
                </div>
              </div>
            )}

            <details className="mt-3">
              <summary className="flex cursor-pointer items-center gap-1 text-xs font-medium text-ink/50 hover:text-ink">
                <ChevronDown className="h-3.5 w-3.5" /> Raw response
              </summary>
              <pre className="mt-2 overflow-auto rounded-lg bg-navy p-3 font-mono text-xs text-white">
                {JSON.stringify(result, null, 2)}
              </pre>
            </details>
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/[0.05] p-4">
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-destructive" />
              <span className="text-sm text-destructive">{error}</span>
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
