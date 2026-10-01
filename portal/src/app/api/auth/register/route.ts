import { NextRequest, NextResponse } from "next/server";
import { GATEWAY_URL, errorMessage } from "@/lib/gateway";

/** Proxies sign-up to the gateway, which emails a verification link. */
export async function POST(request: NextRequest) {
  try {
    const res = await fetch(`${GATEWAY_URL}/auth/email-register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: await request.text(),
    });
    const data: unknown = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { error: errorMessage(data, "Registration failed") },
        { status: res.status },
      );
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
