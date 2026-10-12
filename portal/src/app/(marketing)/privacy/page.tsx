import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function PrivacyPage() {
  return (
    <div className="bg-white">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <h1 className="font-display text-h1 font-semibold tracking-tight text-ink">
          Privacy Policy
        </h1>
        <p className="mt-3 rounded-xl border border-amber/40 bg-amber/10 p-4 text-sm leading-relaxed text-ink">
          Short version while the full policy is in review with counsel: we
          store templates that can&apos;t become faces, we discard raw images,
          and we never sell your data.
        </p>

        <div className="mt-10 space-y-8 text-sm leading-relaxed text-ink/70">
          <section>
            <h2 className="font-display text-h3 font-semibold text-ink">What we store</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>Protected face templates — numeric representations that cannot be turned back into a face.</li>
              <li>Account details you give us: name, work email, company.</li>
              <li>API key records: names, prefixes, creation and last-use dates. Never the full key.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-h3 font-semibold text-ink">What we discard</h2>
            <p className="mt-3">
              Raw images and video frames are discarded once the template is
              made. They are never written to disk and never sold, shared, or
              used for anything but your verification.
            </p>
          </section>

          <section>
            <h2 className="font-display text-h3 font-semibold text-ink">Your rights</h2>
            <p className="mt-3">
              Ask for a copy of your data, or ask us to delete it, at{" "}
              <a href="mailto:contact@imanivision.com" className="font-medium text-signal underline">
                contact@imanivision.com
              </a>
              . Templates can also be revoked and reissued at any time. See how
              this maps to the law on our{" "}
              <Link href="/compliance" className="font-medium text-signal underline">
                compliance page
              </Link>
              .
            </p>
          </section>
        </div>

        <div className="mt-10">
          <Link href="/contact">
            <Button className="bg-signal text-white hover:bg-signal/90">
              Questions? Talk to us
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
