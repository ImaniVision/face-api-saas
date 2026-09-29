import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const GATEWAY_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

/**
 * Forward a request to the gateway as the signed-in developer and relay the
 * gateway's status and body unchanged (so its error messages reach the UI).
 */
export async function forwardToGateway(
  path: string,
  init: RequestInit = {},
): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  const token = (session?.user as { accessToken?: string } | undefined)
    ?.accessToken;
  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  let res: Response;
  try {
    res = await fetch(`${GATEWAY_URL}${path}`, {
      ...init,
      headers: { ...init.headers, Authorization: `Bearer ${token}` },
    });
  } catch {
    return NextResponse.json(
      { message: "The API is unreachable. Is the gateway running?" },
      { status: 502 },
    );
  }

  if (res.status === 204) return new NextResponse(null, { status: 204 });
  return new NextResponse(await res.text(), {
    status: res.status,
    headers: {
      "Content-Type": res.headers.get("Content-Type") ?? "application/json",
    },
  });
}

/** Gateway errors carry `message` as a string or a list of validation messages. */
export function errorMessage(body: unknown, fallback: string): string {
  const message = (body as { message?: unknown } | null)?.message;
  if (Array.isArray(message)) return message.join("; ");
  return typeof message === "string" ? message : fallback;
}
