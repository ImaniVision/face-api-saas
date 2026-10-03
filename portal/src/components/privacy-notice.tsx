"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { ShieldCheck, X } from "lucide-react";

// Bump when the policy changes in a way people should see again.
const DISMISSED_KEY = "privacy-notice-dismissed-v1";

function wasDismissed(): boolean {
  try {
    return window.localStorage.getItem(DISMISSED_KEY) === "1";
  } catch {
    return false; // storage blocked: show the notice
  }
}

// Another tab dismissing the notice hides it here too.
function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
}

/** One-time notice: what happens to face data, with a link to the policy. */
export function PrivacyNotice() {
  // Server render treats it as dismissed, so nothing flashes before storage is read.
  const isDismissed = useSyncExternalStore(subscribe, wasDismissed, () => true);
  const [isClosed, setIsClosed] = useState(false);

  if (isDismissed || isClosed) return null;

  const dismiss = () => {
    try {
      window.localStorage.setItem(DISMISSED_KEY, "1");
    } catch {
      // can't remember the choice; closing for this visit is still fine
    }
    setIsClosed(true);
  };

  return (
    <div
      role="region"
      aria-label="Privacy notice"
      className="fixed inset-x-0 bottom-0 z-50 p-4 sm:bottom-4 sm:left-4 sm:right-auto sm:max-w-md"
    >
      <div className="flex gap-3 rounded-xl border border-border/60 bg-card/95 p-4 shadow-2xl backdrop-blur">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-fuchsia-400" />
        <p className="text-sm text-muted-foreground">
          Imani Vision verifies faces. We never store your photos, only a protected template that
          can&apos;t be turned back into a face, and we use only sign-in cookies.{" "}
          <Link href="/privacy" className="text-foreground underline underline-offset-2">
            Privacy policy
          </Link>
        </p>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss privacy notice"
          className="h-6 w-6 shrink-0 rounded text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
