"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { LayoutDashboard, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { UserAvatar } from "@/components/user-avatar";

export function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group shrink-0">
          <Image
            src="/logo.svg"
            alt="Imani Vision Logo"
            width={32}
            height={32}
            className="h-8 w-8"
          />
          <span className="text-lg font-bold tracking-tight text-foreground">
            Imani Vision
          </span>
        </Link>

        {/* Navigation */}
        <div className="flex items-center gap-3">
          <ModeToggle />
          {!session ?
            <>
              <Link href="/sign-in">
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2 text-muted-foreground hover:text-foreground"
                >
                  <LogIn className="h-4 w-4" />
                  Login
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button
                  size="sm"
                  className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 transition-all font-medium"
                >
                  Get Started
                </Button>
              </Link>
            </>
          : <>
              <Link href="/dashboard">
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2 text-muted-foreground hover:text-foreground"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Button>
              </Link>
              <UserAvatar />
            </>
          }
        </div>
      </div>
    </nav>
  );
}
