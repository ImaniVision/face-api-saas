import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of service: Imani Vision",
  description: "The rules for using the Imani Vision beta API.",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-[760px] px-4 sm:px-6 pt-24 pb-24">
      <p className="text-base font-medium text-muted-foreground mb-4">Legal</p>
      <h1 className="text-5xl font-bold tracking-tight text-foreground mb-6">Terms of service</h1>

      <div
        role="note"
        className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200"
      >
        <strong>Draft, not in force.</strong> Nobody has agreed to these terms and they don&apos;t bind
        anyone yet. Before launch they need the operator&apos;s legal name, a contact address, a
        governing law, and review by a lawyer in each country we serve.
      </div>

      <div className="prose">
        <h3>What the service is</h3>
        <p>
          Imani Vision is a beta API that checks whether a photo shows a person you enrolled earlier
          (1:1 verification). It is free during the beta. It has no uptime commitment, may change
          without notice while in beta, and may be wrong: our own tests reject about 2 in 100
          genuine attempts. It does not detect spoofing, so a good printed photo of an enrolled
          person could pass.
        </p>

        <h3>Your account and keys</h3>
        <p>
          You need a verified email address to create API keys. Keep keys on your server, never in a
          browser or app; anyone holding a key can enroll, verify and delete people on your account.
          Revoke a key as soon as you think it leaked. You are responsible for calls made with your
          keys. Each key is rate limited (60 calls a minute, bursts of 20).
        </p>

        <h3>Consent from the people you enroll</h3>
        <p>
          Before you enroll anyone, you must tell them what you are doing and get their explicit
          consent, as the laws that apply to you require for biometric data. Sending{" "}
          <code>consent=true</code> is your statement that you have that consent. Keep your own
          record of it; the optional <code>consent_reference</code> field lets you point to it. When
          someone withdraws consent or asks to be deleted, delete them with{" "}
          <code>DELETE /v1/subjects/&#123;id&#125;</code> without delay.
        </p>

        <h3>What you must not do</h3>
        <p>
          Don&apos;t enroll anyone without their consent, or anyone you can&apos;t lawfully enroll.
          Don&apos;t use the service to identify unknown people, to search crowds or photo
          collections, or for surveillance; it is built for checking a person against their own
          enrollment only. Don&apos;t use a &quot;no match&quot; as the only reason to refuse someone
          something that matters to them: give them another way to prove who they are. Don&apos;t try
          to reverse protected templates, get around rate limits, or access other developers&apos;
          data.
        </p>

        <h3>Your data and theirs</h3>
        <p>
          You decide whose face is enrolled and why; we process those faces on your instructions.
          We store only protected templates, never photos. The{" "}
          <Link href="/privacy">privacy policy</Link> describes exactly what we keep and for how long.
          We don&apos;t sell data or use it to train models.
        </p>

        <h3>Ending</h3>
        <p>
          You can delete your account at any time; that deletes your keys, everyone you enrolled and
          your usage history. We may suspend keys or accounts that break these terms or put other
          people at risk, and we&apos;ll tell you why when we can.
        </p>

        <h3>No warranty</h3>
        <p>
          During the beta the service is provided as it is, without promises about availability or
          accuracy beyond what this page states. The limits of our liability will be set out here
          after legal review.
        </p>

        <h3>Changes</h3>
        <p>We&apos;ll date each version of these terms and say what changed.</p>
      </div>
    </div>
  );
}
