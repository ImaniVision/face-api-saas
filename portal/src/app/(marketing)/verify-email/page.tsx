import Link from "next/link";
import { CheckCircle2, XCircle } from "lucide-react";
import { GATEWAY_URL, errorMessage } from "@/lib/gateway";

async function verify(token: string | undefined): Promise<string | null> {
  if (!token) return "This verification link is missing its token.";
  try {
    const res = await fetch(`${GATEWAY_URL}/auth/verify-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
      cache: "no-store",
    });
    if (res.ok) return null;
    return errorMessage(await res.json(), "Verification failed.");
  } catch {
    return "The API is unreachable right now. Please try the link again shortly.";
  }
}

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const error = await verify((await searchParams).token);

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
      <div className="w-full max-w-md space-y-4 text-center">
        {error ?
          <XCircle className="mx-auto h-10 w-10 text-destructive" />
        : <CheckCircle2 className="mx-auto h-10 w-10 text-green-500" />}
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {error ? "Couldn't verify your email" : "Email verified"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {error ?? "You can now sign in and create API keys."}
        </p>
        <Link
          href="/sign-in"
          className="inline-block text-sm font-medium text-primary hover:underline"
        >
          Go to sign in
        </Link>
      </div>
    </div>
  );
}
