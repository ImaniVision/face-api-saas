"use client";

import { useState } from "react";
import { Check, Copy, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Team: change this when the domain lands (§8 open decision).
const CONTACT_EMAIL = "contact@imanivision.com";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);

  const subject = `First integration — ${company || name || "new inquiry"}`;
  const body = `Name: ${name}\nWork email: ${email}\nCompany: ${company}\n\nWhat we want to verify:\n${message}`;
  const mailto = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  const copyMessage = async () => {
    try {
      await navigator.clipboard.writeText(`To: ${CONTACT_EMAIL}\nSubject: ${subject}\n\n${body}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable — mailto link remains */
    }
  };

  const valid = name.trim() && email.trim() && message.trim();

  return (
    <div className="bg-white">
      <section className="bg-navy text-white">
        <div className="mx-auto max-w-[1200px] px-4 py-16 sm:px-6 md:py-24">
          <p className="max-w-3xl font-display text-display font-semibold leading-[1.05] tracking-tight">
            Let&apos;s talk about your first integration.{" "}
            <span className="text-white/55">
              Four fields. We reply within two business days.
            </span>
          </p>
        </div>
      </section>

      <div className="mx-auto grid max-w-[1200px] gap-10 px-4 py-16 sm:px-6 lg:grid-cols-5">
        <form
          className="space-y-5 lg:col-span-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (valid) window.location.href = mailto;
          }}
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" placeholder="Ama Serwaa" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Work email</Label>
              <Input id="email" type="email" placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="company">Company</Label>
            <Input id="company" placeholder="Company Ltd" value={company} onChange={(e) => setCompany(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">What do you want to verify?</Label>
            <textarea
              id="message"
              required
              rows={5}
              placeholder="Logins for our savings app, about 50,000 users…"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-colors placeholder:text-ink/35 focus:border-signal"
            />
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button type="submit" disabled={!valid} className="h-12 bg-signal px-8 text-white hover:bg-signal/90">
              <Mail className="mr-2 h-4 w-4" /> Send message
            </Button>
            <Button type="button" variant="outline" onClick={copyMessage} className="h-12">
              {copied ? <Check className="mr-2 h-4 w-4 text-verified" /> : <Copy className="mr-2 h-4 w-4" />}
              {copied ? "Copied" : "Copy instead"}
            </Button>
          </div>
          <p className="text-xs text-ink/50">
            This opens your email client — nothing is sent until you press send there.
          </p>
        </form>

        <aside className="lg:col-span-2">
          <div className="rounded-xl bg-mist p-6">
            <h2 className="font-display text-h3 font-semibold text-ink">Prefer email?</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink/65">
              Write to us directly with the same four details.
            </p>
            <a href={`mailto:${CONTACT_EMAIL}`} className="mt-3 inline-block font-mono text-sm font-semibold text-signal">
              {CONTACT_EMAIL}
            </a>
          </div>
        </aside>
      </div>
    </div>
  );
}
