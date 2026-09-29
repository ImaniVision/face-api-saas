import { forwardToGateway } from "@/lib/gateway";

export function DELETE() {
  return forwardToGateway("/auth/me", { method: "DELETE" });
}
