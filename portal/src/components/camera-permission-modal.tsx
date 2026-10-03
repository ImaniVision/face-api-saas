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
import Link from "next/link";
import { Camera, ShieldAlert } from "lucide-react";

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
      <DialogContent className="sm:max-w-md border-border/40 bg-card/95 backdrop-blur-xl supports-backdrop-filter:bg-card/75">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-fuchsia-500/10 border border-fuchsia-500/20">
              <Camera className="h-5 w-5 text-fuchsia-400" />
            </div>
            <DialogTitle className="text-xl">
              Turn on your camera
            </DialogTitle>
          </div>
          <DialogDescription className="text-base text-muted-foreground/90 leading-relaxed">
            The Live Test takes photos with your camera. Nothing leaves your
            browser until you press Enroll or Verify.
            <br />
            <br />
            <span className="font-medium text-foreground">
              What we keep:
            </span>{" "}
            photos are used once to compute a face embedding and are never
            saved. Enrolling stores only a protected template that can&apos;t
            be turned back into your face, and you can delete it at any time.{" "}
            <Link href="/privacy" className="text-foreground underline underline-offset-2">
              Privacy policy
            </Link>
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
                I understand my photos are sent to Imani Vision when I press
                Enroll or Verify.
              </label>
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
            className="w-full sm:w-auto bg-linear-to-r from-fuchsia-600 to-violet-600 text-white shadow-lg shadow-fuchsia-500/25 hover:shadow-fuchsia-500/40 transition-all hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
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
