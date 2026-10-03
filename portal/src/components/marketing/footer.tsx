import Link from "next/link";
import Image from "next/image";

const productLinks = [
  { label: "Documentation", href: "/docs" },
  { label: "Pricing", href: "/pricing" },
  { label: "Changelog", href: "/changelog" },
  { label: "Dashboard", href: "/dashboard" },
  { label: "Privacy policy", href: "/privacy" },
  { label: "Terms (draft)", href: "/terms" },
];

export function Footer() {
  return (
    <footer className="border-t border-border/40">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-6">
              <Image
                src="/logo.svg"
                alt="Imani Vision Logo"
                width={32}
                height={32}
              />
              <span className="text-base font-bold text-foreground">
                Imani Vision
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed pr-8 max-w-sm">
              1:1 face verification for developers. We store a protected
              template per person, never a face or a face embedding.
            </p>
          </div>
          {/* Product */}
          <div>
            <h4 className="text-base font-semibold text-foreground mb-6">
              Product
            </h4>
            <ul className="space-y-4">
              {productLinks.map((link) => (
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
        <div className="mt-16 pt-8 border-t border-border/40">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Imani Vision. Beta software.
          </p>
        </div>
      </div>
    </footer>
  );
}
