"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Camera, ShieldAlert } from "lucide-react";
import Link from "next/link";

interface CameraPermissionModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onPermissionGranted: () => void;
}

export function CameraPermissionModal({
  isOpen,
  onOpenChange,
  onPermissionGranted,
}: CameraPermissionModalProps) {
  const [hasConsented, setHasConsented] = useState(false);

  const handleAllowCamera = () => {
    if (hasConsented) {
      onPermissionGranted();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="border-border bg-white sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-signal/20 bg-signal/[0.07]">
              <Camera className="h-5 w-5 text-signal" />
            </div>
            <DialogTitle className="text-xl">
              Biometric Scan Consent
            </DialogTitle>
          </div>
          <DialogDescription className="text-base text-muted-foreground/90 leading-relaxed">
            We use your camera to securely identify and log you in through
            facial recognition.
            <br />
            <br />
            <span className="font-medium text-foreground">
              Important Privacy Notice:
            </span>{" "}
            Your facial data is securely processed, never sold, and stored only
            temporarily according to our strict retention policy to verify your
            identity.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border border-border/50 p-4 bg-muted/20">
            <Checkbox
              id="consent"
              checked={hasConsented}
              onCheckedChange={(checked) => setHasConsented(checked as boolean)}
              className="mt-1"
            />
            <div className="space-y-1 leading-none">
              <label
                htmlFor="consent"
                className="text-sm font-medium leading-relaxed peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                I explicitly consent to the collection and processing of my
                biometric facial data for authentication purposes.
              </label>
              <p className="text-xs text-muted-foreground pt-1">
                By ticking this box, you agree to our{" "}
                <Link
                  href="/privacy"
                  className="text-signal underline underline-offset-2 transition-colors hover:text-signal/80"
                >
                  Privacy Policy
                </Link>{" "}
                and{" "}
                <Link
                  href="/terms"
                  className="text-signal underline underline-offset-2 transition-colors hover:text-signal/80"
                >
                  Terms of Service
                </Link>
                .
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="sm:justify-between gap-3 flex-col sm:flex-row pt-2">
          <Button
            type="button"
            variant="outline"
            className="w-full sm:w-auto border-border/60 hover:bg-muted/50"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="w-full bg-signal text-white hover:bg-signal/90 sm:w-auto"
            disabled={!hasConsented}
            onClick={handleAllowCamera}
          >
            <ShieldAlert className="mr-2 h-4 w-4" />
            Allow Camera Access
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
