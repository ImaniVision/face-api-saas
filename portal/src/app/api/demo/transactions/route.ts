import { forwardToGateway } from "@/lib/gateway";

export async function POST(req: Request) {
  return forwardToGateway("/v1/subjects/dashboard-demo/transactions", {
    method: "POST",
    body: await req.formData(),
  });
}
