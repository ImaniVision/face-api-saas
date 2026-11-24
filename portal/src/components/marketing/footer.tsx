import Link from "next/link";
import Image from "next/image";

const columns = [
  {
    title: "Products",
    links: [
      { label: "Platform", href: "/platform" },
      { label: "Security", href: "/security" },
      { label: "Pricing", href: "/pricing" },
      { label: "Compliance", href: "/compliance" },
    ],
  },
  {
    title: "Developers",
    links: [
      { label: "Docs", href: "/docs" },
      { label: "Quickstart", href: "/docs" },
      { label: "Changelog", href: "/changelog" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-white">
      <div className="mx-auto max-w-[1200px] px-4 py-16 sm:px-6">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-5">
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2.5">
              <Image src="/logo.svg" alt="Imani Vision" width={28} height={28} className="h-7 w-7" />
              <span className="font-display text-base font-semibold text-ink">
                Imani Vision
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink/60">
              Facial verification for login, transactions, and routine liveness
              checks. Verify continuously, store nothing recoverable.
            </p>
          </div>
          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="mb-4 text-sm font-semibold text-ink">{col.title}</h4>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-ink/60 transition-colors hover:text-ink"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-4 border-t border-border pt-8 sm:flex-row sm:items-center">
          <p className="text-sm text-ink/50">
            © {new Date().getFullYear()} Imani Vision. All rights reserved.
          </p>
          <p className="text-sm text-ink/50">
            Imani means trust. We build the layer that keeps it.
          </p>
        </div>
      </div>
    </footer>
  );
}
