"use client";

import Link from "next/link";
import { Menu, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/user-avatar";

interface DashboardHeaderProps {
  onMobileMenuToggle: () => void;
}

export function DashboardHeader({ onMobileMenuToggle }: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-white/90 px-4 backdrop-blur-md sm:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMobileMenuToggle}
          aria-label="Open menu"
          className="flex h-8 w-8 items-center justify-center rounded-md text-ink/60 transition-colors hover:bg-mist hover:text-ink lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <span className="hidden font-mono text-xs text-ink/40 sm:block">Console</span>
      </div>

      <div className="flex items-center gap-3">
        <Link
          href="/docs"
          className="hidden items-center gap-1.5 text-sm text-ink/60 transition-colors hover:text-ink sm:flex"
        >
          API Docs
          <ExternalLink className="h-3 w-3" />
        </Link>

        <Link href="/dashboard/live-test">
          <Button size="sm" className="bg-signal text-xs font-semibold text-white hover:bg-signal/90">
            Live test
          </Button>
        </Link>

        <UserAvatar />
      </div>
    </header>
  );
}
