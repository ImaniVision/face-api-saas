import { forwardToGateway } from "@/lib/gateway";

export function GET() {
  return forwardToGateway("/api-keys");
}

export async function POST(req: Request) {
  return forwardToGateway("/api-keys", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: await req.text(),
  });
}
