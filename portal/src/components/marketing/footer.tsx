"use client";

import Link from "next/link";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const footerLinks = {
  product: [
    { label: "Features", href: "/#features" },
    { label: "Pricing", href: "/pricing" },
    { label: "Changelog", href: "/changelog" },
    { label: "Documentation", href: "#" },
  ],
  company: [
    { label: "About", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Careers", href: "#" },
    { label: "Contact", href: "#" },
  ],
  legal: [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
    { label: "Cookie Policy", href: "#" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-border/40">
      {/* Newsletter Section */}
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 py-16">
        <div className="flex flex-col items-center text-center gap-6 mb-16">
          <h3 className="text-2xl font-semibold text-foreground">
            Stay Ahead with FaceAuth
          </h3>
          <p className="text-base text-muted-foreground max-w-md">
            Join our newsletter for exclusive insights and updates on the latest
            in facial recognition technology.
          </p>
          <div className="flex w-full max-w-sm gap-2">
            <Input
              type="email"
              placeholder="Enter your email"
              className="h-11 bg-muted/50 border-border/60"
            />
            <Button size="lg" className="h-11 px-8 shrink-0 font-medium">
              Subscribe
            </Button>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-3 mb-6">
              <Image
                src="/logo.svg"
                alt="FaceAuth Logo"
                width={32}
                height={32}
                className="h-8 w-8"
              />
              <span className="text-base font-bold text-foreground">
                FaceAuth
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed pr-8">
              Enterprise-grade facial recognition infrastructure for modern
              applications.
            </p>
          </div>
          {/* Product */}
          <div>
            <h4 className="text-base font-semibold text-foreground mb-6">
              Product
            </h4>
            <ul className="space-y-4">
              {footerLinks.product.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          {/* Company */}
          <div>
            <h4 className="text-base font-semibold text-foreground mb-6">
              Company
            </h4>
            <ul className="space-y-4">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          {/* Legal */}
          <div>
            <h4 className="text-base font-semibold text-foreground mb-6">
              Legal
            </h4>
            <ul className="space-y-4">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 flex flex-col sm:flex-row items-center justify-between gap-6 pt-8 border-t border-border/40">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} FaceAuth Corp. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="#" className="hover:text-foreground transition-colors">
              Privacy
            </Link>
            <Link href="#" className="hover:text-foreground transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
