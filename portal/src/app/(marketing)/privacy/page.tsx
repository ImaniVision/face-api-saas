import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy policy: Imani Vision",
  description: "What Imani Vision collects, why, how long we keep it, and how to delete it.",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-[760px] px-4 sm:px-6 pt-24 pb-24">
      <p className="text-base font-medium text-muted-foreground mb-4">Privacy</p>
      <h1 className="text-5xl font-bold tracking-tight text-foreground mb-6">Privacy policy</h1>

      <div
        role="note"
        className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200"
      >
        <strong>Draft.</strong> This describes how the beta handles data today. It has not been
        reviewed by a lawyer. Before public launch it needs the operator&apos;s legal name, a contact
        address, the hosting and email providers, and legal review for each country we serve.
      </div>

      <div className="prose">
        <h3>Two kinds of people</h3>
        <p>
          <strong>Developers</strong> sign up for an account and call our API. <strong>Enrolled
          people</strong> are the people a developer enrolls, such as their customers. A developer
          trying the Live Test enrolls their own face, so they are both.
        </p>
        <p>
          When a developer enrolls their customers, the developer decides whose face is enrolled and
          why, and must get each person&apos;s consent first. We process those faces on the
          developer&apos;s instructions. The API refuses to enroll anyone unless the developer sends{" "}
          <code>consent=true</code>, and we store when that consent was recorded.
        </p>

        <h3>What we collect about developers</h3>
        <p>
          Your email address and your password, which we store only as a bcrypt hash. Whether and
          when you verified your email. Your API keys, stored as hashes: we keep only the first
          characters and the last four in readable form so you can tell keys apart. For every API
          call that passes authentication: the endpoint, the result code, the time and which key
          made it. We use this to apply rate limits and show your usage page.
        </p>
        <p>
          If you sign in with GitHub or Google, they send us your name, email address and profile
          picture. These are kept in your sign-in cookie, not in our database.
        </p>

        <h3>What we collect about enrolled people</h3>
        <p>
          <strong>Photos are not stored.</strong> Each photo is sent to our face service, turned into
          a face embedding (a list of 512 numbers), used once and discarded. The embedding is never
          stored either.
        </p>
        <p>
          What we store for each enrolled person is a <strong>protected template</strong>: a 32-byte
          SHA-256 hash and a random 512x512 matrix (the IronMask scheme). It can confirm that a new
          photo shows the same person, but it can&apos;t be turned back into a face or an embedding
          without about 2^91 guesses. Re-enrolling someone creates a new template that can&apos;t be
          linked to the old one.
        </p>
        <p>
          With the template we keep the ID the developer chose for the person (for example{" "}
          <code>customer-42</code>), the consent record (when it was given, how it was collected,
          and an optional reference the developer supplies) and when the person was enrolled.
        </p>
        <p>
          If the developer uses the risk-checked payments API, we also keep each approved payment:
          the amount, the time, whether a face was checked, and SHA-256 hashes of the payee and
          device IDs the developer sent. It is used only to tell whether a later payment is to a
          new payee or from a new device, and it is deleted with the person.
        </p>

        <h3>What we don&apos;t do</h3>
        <p>
          We don&apos;t sell data, show ads, or use analytics or tracking scripts. We don&apos;t
          search one face against everyone enrolled: every check compares one photo with one
          person the developer names. We don&apos;t use faces to train models.
        </p>

        <h3>Cookies and browser storage</h3>
        <p>
          We set only the cookies needed to keep you signed in to the portal. The portal also stores
          one item in your browser to remember that you closed the privacy notice.
        </p>

        <h3>Why we use it</h3>
        <p>
          To run the verification service you or a developer asked for, to prove that consent was
          given, to send you account emails such as email verification, and to keep the service
          working through rate limits. Face data is sensitive personal data, and we process it
          only with the enrolled person&apos;s consent.
        </p>

        <h3>How long we keep it</h3>
        <p>
          Photos and embeddings: not kept. A protected template and its consent record: until the
          person is deleted, either by the developer (<code>DELETE /v1/subjects/&#123;id&#125;</code>)
          or with the developer&apos;s account. Accounts, API keys and usage records: until the
          account is deleted. There is no automatic expiry yet.
        </p>

        <h3>How it&apos;s protected</h3>
        <p>
          Templates are stored only in protected form. Passwords and API keys are stored as
          hashes. The face service can&apos;t be reached from the internet: only our gateway can call
          it, and only with a secret key. Every API key is rate limited. The beta runs locally;
          HTTPS will be required before public launch.
        </p>

        <h3>Deleting your data</h3>
        <p>
          <strong>Developers:</strong> delete your account from the menu under your avatar in the
          dashboard. This removes your keys, every person you enrolled, their templates and
          consent records, and your usage history. <strong>Live Test:</strong> use &quot;Delete my
          enrolled demo face&quot;. <strong>Enrolled people:</strong> ask the developer who enrolled
          you; they can delete you with one call. Withdrawing consent means deleting the template.
        </p>
        <p>
          A contact address for access and deletion requests will be published here before launch.
          Until then, use the self-service options above.
        </p>

        <h3>Changes</h3>
        <p>
          We&apos;ll date each version of this policy and list what changed. Read how we handle
          face data in more detail in the <Link href="/docs/enrollment">enrollment docs</Link>.
        </p>
      </div>
    </div>
  );
}
