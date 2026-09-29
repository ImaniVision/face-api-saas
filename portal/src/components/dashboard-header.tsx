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
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border/40 bg-background/80 backdrop-blur-xl px-4 sm:px-6">
      {/* Left: Mobile menu button */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMobileMenuToggle}
          className="lg:hidden flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Right: API Docs + Start Building + Avatar */}
      <div className="flex items-center gap-3">
        <Link
          href="/docs"
          className="hidden sm:flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          API Docs
          <ExternalLink className="h-3 w-3" />
        </Link>

        <Link href="/dashboard/chat">
          <Button
            variant="outline"
            size="sm"
            className="text-xs font-medium border-border/60 hover:bg-accent/60"
          >
            Start building
          </Button>
        </Link>

        <UserAvatar />
      </div>
    </header>
  );
}
