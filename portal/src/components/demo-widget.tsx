"use client";

import { useState, useRef, useCallback } from "react";
import Webcam from "react-webcam";
import {
  Camera,
  RotateCcw,
  Loader2,
  CheckCircle2,
  XCircle,
  Aperture,
  ShieldAlert,
  Trash2,
  UserPlus,
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
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

type DemoResult =
  | { kind: "enrolled"; consentGrantedAt: string }
  | { kind: "verified"; match: boolean; confidence: number }
  | { kind: "deleted" };

type Action = "enroll" | "verify" | "delete";

const METHOD: Record<Action, string> = {
  enroll: "PUT",
  verify: "POST",
  delete: "DELETE",
};

function describeError(status: number, body: unknown): string {
  const message = (body as { message?: unknown } | null)?.message;
  if (Array.isArray(message)) return message.join("; ");
  if (status === 404) return "No face enrolled yet. Enroll first.";
  return typeof message === "string" ?
      message
    : "Request failed. Is the gateway running?";
}

export function DemoWidget() {
  const webcamRef = useRef<Webcam>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [pending, setPending] = useState<Action | null>(null);
  const [result, setResult] = useState<DemoResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasConsent, setHasConsent] = useState(false);
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

  const run = async (action: Action) => {
    setPending(action);
    setError(null);
    setResult(null);

    try {
      let body: FormData | undefined;
      if (action !== "delete" && capturedImage) {
        body = new FormData();
        const image = await (await fetch(capturedImage)).blob();
        body.append("image", image, "selfie.jpg");
        if (action === "enroll") body.append("consent", String(hasConsent));
      }

      const res = await fetch("/api/demo", { method: METHOD[action], body });
      const data = res.status === 204 ? null : await res.json();

      if (!res.ok) {
        setError(describeError(res.status, data));
        return;
      }

      setResult(
        action === "enroll" ?
          { kind: "enrolled", consentGrantedAt: data.consentGrantedAt }
        : action === "verify" ?
          { kind: "verified", match: data.match, confidence: data.confidence }
        : { kind: "deleted" },
      );
    } catch {
      setError("Request failed. Is the gateway running?");
    } finally {
      setPending(null);
    }
  };

  const isBusy = pending !== null;

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
              Enroll your own face, then verify a new selfie against it (1:1)
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
          {isBusy && pending !== "delete" && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
              <div className="flex flex-col items-center gap-3">
                <div className="h-32 w-32 animate-pulse rounded-full border-2 border-dashed border-violet-400/60" />
                <p className="text-sm font-medium text-violet-300">
                  {pending === "enroll" ? "Enrolling face..." : "Analyzing face..."}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Consent */}
        <div className="flex items-start gap-3 rounded-lg border border-border/40 p-3">
          <Checkbox
            id="demo-consent"
            checked={hasConsent}
            onCheckedChange={(checked) => setHasConsent(checked === true)}
            className="mt-0.5"
          />
          <Label
            htmlFor="demo-consent"
            className="text-xs font-normal leading-relaxed text-muted-foreground"
          >
            I consent to Imani Vision storing a biometric template of my face
            for this demo. I can delete it at any time. Required to enroll.
          </Label>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
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
                onClick={() => run("enroll")}
                disabled={isBusy || !hasConsent}
                variant="outline"
                className="flex-1 gap-2 border-border/60"
              >
                {pending === "enroll" ?
                  <Loader2 className="h-4 w-4 animate-spin" />
                : <UserPlus className="h-4 w-4" />}
                Enroll this face
              </Button>
              <Button
                onClick={() => run("verify")}
                disabled={isBusy}
                className="flex-1 gap-2 bg-linear-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all hover:brightness-110"
              >
                {pending === "verify" ?
                  <Loader2 className="h-4 w-4 animate-spin" />
                : <Camera className="h-4 w-4" />}
                Verify Face
              </Button>
              <Button
                onClick={reset}
                disabled={isBusy}
                variant="outline"
                className="gap-2 border-border/60"
              >
                <RotateCcw className="h-4 w-4" />
                Retake
              </Button>
            </>
          }
        </div>
        <button
          type="button"
          onClick={() => run("delete")}
          disabled={isBusy}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive disabled:opacity-50"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Delete my enrolled demo face
        </button>

        {/* Result Display */}
        {result?.kind === "verified" && (
          <div
            className={`rounded-lg border p-4 ${
              result.match ?
                "border-green-500/30 bg-green-500/10"
              : "border-red-500/30 bg-red-500/10"
            }`}
          >
            <div className="flex items-center gap-2">
              {result.match ?
                <CheckCircle2 className="h-5 w-5 text-green-400" />
              : <XCircle className="h-5 w-5 text-red-400" />}
              <span
                className={`font-semibold ${
                  result.match ? "text-green-400" : "text-red-400"
                }`}
              >
                {result.match ? "Match" : "No Match"}
              </span>
              <Badge
                variant="outline"
                className={`ml-auto ${
                  result.match ?
                    "border-green-500/30 text-green-400"
                  : "border-red-500/30 text-red-400"
                }`}
              >
                {(result.confidence * 100).toFixed(1)}% similarity
              </Badge>
            </div>
          </div>
        )}
        {result?.kind === "enrolled" && (
          <div className="flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/10 p-4 text-sm text-green-400">
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            Enrolled. Consent recorded at{" "}
            {new Date(result.consentGrantedAt).toLocaleString()}. Retake a
            selfie and verify it.
          </div>
        )}
        {result?.kind === "deleted" && (
          <div className="flex items-center gap-2 rounded-lg border border-border/40 p-4 text-sm text-muted-foreground">
            <Trash2 className="h-5 w-5 shrink-0" />
            Your demo face template and consent record were deleted.
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4">
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 shrink-0 text-red-400" />
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
