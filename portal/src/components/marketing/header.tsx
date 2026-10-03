"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  Scan,
  ChevronDown,
  Menu,
  ShieldCheck,
  ActivitySquare,
  BarChart3,
  Code2,
  Fingerprint,
  ScanFace,
  LineChart,
  Terminal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { UserAvatar } from "@/components/user-avatar";

const features = [
  {
    icon: ScanFace,
    title: "Face Verification",
    description: "Is this photo the person enrolled under this ID?",
    href: "/docs/verification",
  },
  {
    icon: ShieldCheck,
    title: "Protected Templates",
    description: "No stored record can be turned back into a face",
    href: "/docs/enrollment",
  },
  {
    icon: LineChart,
    title: "Usage Dashboard",
    description: "Calls per day and per API key, last 30 days",
    href: "/dashboard/usage",
  },
  {
    icon: Terminal,
    title: "REST API",
    description: "Enroll, verify and delete over plain HTTP",
    href: "/docs",
  },
];

const navLinks = [
  { title: "Pricing", href: "/pricing" },
  { title: "Developers", href: "/dashboard" },
  { title: "Changelog", href: "/changelog" },
];

import Image from "next/image";
import { ModeToggle } from "@/components/mode-toggle";

export function Header() {
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-20 max-w-[1400px] items-center justify-between px-6 lg:px-8">
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

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-2 md:flex">
          {/* Features Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="gap-1 text-base font-medium text-muted-foreground hover:text-foreground h-10 px-4"
              >
                Features
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[420px] p-4">
              <div className="grid grid-cols-2 gap-2">
                {features.map((feature) => (
                  <DropdownMenuItem key={feature.title} asChild>
                    <Link
                      href={feature.href}
                      className="flex cursor-pointer items-start gap-3 rounded-lg p-3 transition-colors hover:bg-accent"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border/60 bg-muted/50">
                        <feature.icon className="h-4 w-4 text-foreground" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-foreground">
                          {feature.title}
                        </div>
                        <div className="text-xs text-muted-foreground leading-relaxed">
                          {feature.description}
                        </div>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {navLinks.map((link) => (
            <Link key={link.title} href={link.href}>
              <Button
                variant="ghost"
                className="text-base font-medium text-muted-foreground hover:text-foreground h-10 px-4"
              >
                {link.title}
              </Button>
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <ModeToggle />
          {!session ?
            <>
              <Link href="/sign-in" className="hidden sm:block">
                <Button
                  variant="ghost"
                  className="text-base font-medium text-muted-foreground hover:text-foreground h-10 px-4"
                >
                  Log In
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button className="text-base h-10 px-5 bg-primary text-primary-foreground hover:bg-primary/90 font-medium rounded-lg">
                  Get Started Today
                </Button>
              </Link>
            </>
          : <>
              <Link href="/dashboard">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Dashboard
                </Button>
              </Link>
              <UserAvatar />
            </>
          }

          {/* Mobile menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <SheetTitle className="flex items-center gap-2 mb-6">
                <Scan className="h-5 w-5" />
                Imani Vision
              </SheetTitle>
              <nav className="flex flex-col gap-1">
                <p className="px-3 py-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Features
                </p>
                {features.map((feature) => (
                  <Link
                    key={feature.title}
                    href={feature.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  >
                    <feature.icon className="h-4 w-4" />
                    {feature.title}
                  </Link>
                ))}
                <div className="my-2 h-px bg-border/40" />
                {navLinks.map((link) => (
                  <Link
                    key={link.title}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  >
                    {link.title}
                  </Link>
                ))}
                <div className="my-2 h-px bg-border/40" />
                {!session && (
                  <>
                    <Link
                      href="/sign-in"
                      onClick={() => setMobileOpen(false)}
                      className="rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    >
                      Log In
                    </Link>
                    <Link href="/sign-up" onClick={() => setMobileOpen(false)}>
                      <Button className="mt-2 w-full bg-primary text-primary-foreground hover:bg-primary/90">
                        Get Started Today
                      </Button>
                    </Link>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
