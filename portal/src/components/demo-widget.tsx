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

// Mirrors ENROLMENT_PHOTOS in app/protection.py: templates average this many captures.
const ENROLMENT_PHOTOS = 5;

type Mode = "enroll" | "verify";

type DemoResult =
  | { kind: "enrolled"; consentGrantedAt: string }
  | { kind: "verified"; match: boolean }
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

async function toBlob(dataUrl: string): Promise<Blob> {
  return (await fetch(dataUrl)).blob();
}

export function DemoWidget() {
  const webcamRef = useRef<Webcam>(null);
  const [mode, setMode] = useState<Mode>("enroll");
  const [enrollShots, setEnrollShots] = useState<string[]>([]);
  const [verifyShot, setVerifyShot] = useState<string | null>(null);
  const [pending, setPending] = useState<Action | null>(null);
  const [result, setResult] = useState<DemoResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasConsent, setHasConsent] = useState(false);
  const [isCameraAllowed, setIsCameraAllowed] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const enrollReady = enrollShots.length === ENROLMENT_PHOTOS;
  const showLiveCamera =
    mode === "enroll" ? !enrollReady : verifyShot === null;
  const preview = mode === "enroll" ? enrollShots.at(-1) : verifyShot;

  const clearFeedback = () => {
    setResult(null);
    setError(null);
  };

  const capture = useCallback(() => {
    const shot = webcamRef.current?.getScreenshot();
    if (!shot) return;
    if (mode === "enroll") {
      setEnrollShots((shots) =>
        shots.length < ENROLMENT_PHOTOS ? [...shots, shot] : shots,
      );
    } else {
      setVerifyShot(shot);
    }
    setResult(null);
    setError(null);
  }, [mode]);

  const reset = () => {
    if (mode === "enroll") setEnrollShots([]);
    else setVerifyShot(null);
    clearFeedback();
  };

  const switchMode = (next: Mode) => {
    setMode(next);
    clearFeedback();
  };

  const run = async (action: Action) => {
    setPending(action);
    clearFeedback();

    try {
      let body: FormData | undefined;
      if (action === "enroll") {
        body = new FormData();
        const blobs = await Promise.all(enrollShots.map(toBlob));
        blobs.forEach((blob, i) =>
          body?.append("images", blob, `enroll-${i + 1}.jpg`),
        );
        body.append("consent", String(hasConsent));
      } else if (action === "verify" && verifyShot) {
        body = new FormData();
        body.append("image", await toBlob(verifyShot), "selfie.jpg");
      }

      const res = await fetch("/api/demo", { method: METHOD[action], body });
      const data = res.status === 204 ? null : await res.json();

      if (!res.ok) {
        setError(describeError(res.status, data));
        return;
      }

      if (action === "enroll") {
        setResult({ kind: "enrolled", consentGrantedAt: data.consentGrantedAt });
        setEnrollShots([]);
      } else if (action === "verify") {
        setResult({ kind: "verified", match: data.match });
      } else {
        setResult({ kind: "deleted" });
      }
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
              Enroll your face from {ENROLMENT_PHOTOS} photos, then verify a new
              selfie against it (1:1)
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
        {/* Mode */}
        <div
          role="tablist"
          aria-label="Demo step"
          className="grid grid-cols-2 gap-1 rounded-lg border border-border/40 p-1"
        >
          {(["enroll", "verify"] as const).map((m) => (
            <button
              key={m}
              type="button"
              role="tab"
              aria-selected={mode === m}
              onClick={() => switchMode(m)}
              disabled={isBusy}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-50 ${
                mode === m ?
                  "bg-muted text-foreground"
                : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {m === "enroll" ?
                `1. Enroll (${ENROLMENT_PHOTOS} photos)`
              : "2. Verify (1 photo)"}
            </button>
          ))}
        </div>

        {/* Camera / Captured Image */}
        <div className="relative overflow-hidden rounded-lg border border-border/40 bg-black/50">
          {!isCameraAllowed ?
            <div className="flex flex-col items-center justify-center p-8 text-center min-h-[300px] h-full bg-black/40">
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
          : showLiveCamera ?
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
          : preview && (
              <img src={preview} alt="Captured selfie" className="w-full" />
            )
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

        {mode === "enroll" && (
          <>
            {/* Enrolment captures */}
            <div>
              <div className="grid grid-cols-5 gap-2">
                {Array.from({ length: ENROLMENT_PHOTOS }, (_, i) => (
                  <div
                    key={i}
                    className="aspect-square overflow-hidden rounded-md border border-border/40 bg-black/40"
                  >
                    {enrollShots[i] ?
                      <img
                        src={enrollShots[i]}
                        alt={`Enrolment photo ${i + 1}`}
                        className="h-full w-full object-cover"
                      />
                    : <span className="flex h-full items-center justify-center text-xs text-muted-foreground">
                        {i + 1}
                      </span>
                    }
                  </div>
                ))}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Turn your head slightly between photos. Varied captures make a
                stronger template.
              </p>
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
                I consent to Imani Vision storing a protected biometric template
                of my face for this demo. I can delete it at any time. Required
                to enroll.
              </Label>
            </div>
          </>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          {!isCameraAllowed ?
            <Button
              onClick={() => setIsModalOpen(true)}
              className="flex-1 gap-2 bg-linear-to-r from-fuchsia-600 to-pink-600 text-white shadow-lg shadow-fuchsia-500/25 hover:shadow-fuchsia-500/40 transition-all hover:brightness-110"
            >
              <Camera className="h-4 w-4" />
              Enable Camera
            </Button>
          : mode === "enroll" ?
            <>
              {enrollReady ?
                <Button
                  onClick={() => run("enroll")}
                  disabled={isBusy || !hasConsent}
                  className="flex-1 gap-2 bg-linear-to-r from-fuchsia-600 to-pink-600 text-white shadow-lg shadow-fuchsia-500/25 hover:shadow-fuchsia-500/40 transition-all hover:brightness-110"
                >
                  {pending === "enroll" ?
                    <Loader2 className="h-4 w-4 animate-spin" />
                  : <UserPlus className="h-4 w-4" />}
                  Enroll these {ENROLMENT_PHOTOS} photos
                </Button>
              : <Button
                  onClick={capture}
                  disabled={isBusy}
                  className="flex-1 gap-2 bg-linear-to-r from-fuchsia-600 to-pink-600 text-white shadow-lg shadow-fuchsia-500/25 hover:shadow-fuchsia-500/40 transition-all hover:brightness-110"
                >
                  <Camera className="h-4 w-4" />
                  Capture photo {enrollShots.length + 1} of {ENROLMENT_PHOTOS}
                </Button>
              }
              <Button
                onClick={reset}
                disabled={isBusy || enrollShots.length === 0}
                variant="outline"
                className="gap-2 border-border/60"
              >
                <RotateCcw className="h-4 w-4" />
                Start over
              </Button>
            </>
          : verifyShot === null ?
            <Button
              onClick={capture}
              className="flex-1 gap-2 bg-linear-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all hover:brightness-110"
            >
              <Camera className="h-4 w-4" />
              Capture Selfie
            </Button>
          : <>
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
            className={`flex items-center gap-2 rounded-lg border p-4 ${
              result.match ?
                "border-green-500/30 bg-green-500/10"
              : "border-red-500/30 bg-red-500/10"
            }`}
          >
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
          </div>
        )}
        {result?.kind === "enrolled" && (
          <div className="flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/10 p-4 text-sm text-green-400">
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            Enrolled. Consent recorded at{" "}
            {new Date(result.consentGrantedAt).toLocaleString()}. Switch to
            Verify and take a new selfie.
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
