import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

const groups = [
  {
    title: "Getting started",
    links: [
      { label: "Quickstart", href: "/docs" },
      { label: "Authentication", href: "/docs/authentication" },
      { label: "Errors", href: "/docs/errors" },
    ],
  },
  {
    title: "API reference",
    links: [
      { label: "Enroll", href: "/docs/faces" },
      { label: "Verify", href: "/docs/verification" },
    ],
  },
];

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-white md:flex-row">
      <aside className="w-full shrink-0 border-b border-border md:w-64 md:border-b-0 md:border-r">
        <div className="flex h-16 items-center gap-2.5 border-b border-border px-6">
          <Image src="/logo.svg" alt="Imani Vision" width={24} height={24} />
          <Link href="/" className="font-display text-base font-semibold text-ink">
            Imani Vision <span className="text-sm font-normal text-ink/50">Docs</span>
          </Link>
        </div>
        <div className="space-y-6 p-4">
          {groups.map((g) => (
            <div key={g.title}>
              <h4 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-ink/45">
                {g.title}
              </h4>
              <div className="space-y-1">
                {g.links.map((l) => (
                  <Link key={l.href} href={l.href}>
                    <Button variant="ghost" size="sm" className="w-full justify-start text-sm">
                      {l.label}
                    </Button>
                  </Link>
                ))}
              </div>
            </div>
          ))}
          <div className="px-2 pt-2">
            <Link href="/dashboard">
              <Button size="sm" className="w-full bg-signal text-white hover:bg-signal/90">
                Go to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </aside>
      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-8 md:px-12 md:py-12">
        {children}
      </main>
    </div>
  );
}
