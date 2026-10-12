"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { UserAvatar } from "@/components/user-avatar";

// §5.1 navigation
const navLinks = [
  { title: "Products", href: "/platform" },
  { title: "Developers", href: "/docs" },
  { title: "Security", href: "/security" },
  { title: "Pricing", href: "/pricing" },
  { title: "About", href: "/about" },
];

export function Header() {
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <Image src="/logo.svg" alt="Imani Vision" width={28} height={28} className="h-7 w-7" />
          <span className="font-display text-[17px] font-semibold tracking-tight text-ink">
            Imani Vision
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.title}
              href={link.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-ink/70 transition-colors hover:text-ink"
            >
              {link.title}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {!session ? (
            <>
              <Link href="/sign-in" className="hidden sm:block">
                <Button variant="ghost" size="sm" className="text-sm font-medium">
                  Sign in
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="sm" className="bg-signal text-sm font-medium text-white hover:bg-signal/90">
                  Talk to us
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="text-sm">
                  Dashboard
                </Button>
              </Link>
              <UserAvatar />
            </>
          )}

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="h-9 w-9" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <SheetTitle className="mb-6 flex items-center gap-2">
                <Image src="/logo.svg" alt="Imani Vision" width={24} height={24} />
                Imani Vision
              </SheetTitle>
              <nav className="flex flex-col gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.title}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="rounded-lg px-3 py-2.5 text-sm text-ink/70 hover:bg-mist hover:text-ink"
                  >
                    {link.title}
                  </Link>
                ))}
                <div className="my-2 h-px bg-border" />
                {!session ? (
                  <>
                    <Link
                      href="/sign-in"
                      onClick={() => setMobileOpen(false)}
                      className="rounded-lg px-3 py-2.5 text-sm text-ink/70 hover:bg-mist hover:text-ink"
                    >
                      Sign in
                    </Link>
                    <Link href="/contact" onClick={() => setMobileOpen(false)}>
                      <Button className="mt-2 w-full bg-signal text-white hover:bg-signal/90">
                        Talk to us
                      </Button>
                    </Link>
                  </>
                ) : (
                  <Link href="/dashboard" onClick={() => setMobileOpen(false)}>
                    <Button className="mt-2 w-full">Dashboard</Button>
                  </Link>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
