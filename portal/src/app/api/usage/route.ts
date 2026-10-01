import { forwardToGateway } from "@/lib/gateway";

export function GET() {
  return forwardToGateway("/usage");
}
