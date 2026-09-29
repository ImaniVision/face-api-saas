import { forwardToGateway } from "@/lib/gateway";

// The dashboard demo enrolls the signed-in developer's own face under this id.
const DEMO_SUBJECT = "/v1/subjects/dashboard-demo";

async function forwardForm(path: string, method: string, req: Request) {
  return forwardToGateway(path, { method, body: await req.formData() });
}

export function PUT(req: Request) {
  return forwardForm(DEMO_SUBJECT, "PUT", req);
}

export function POST(req: Request) {
  return forwardForm(`${DEMO_SUBJECT}/verify`, "POST", req);
}

export function DELETE() {
  return forwardToGateway(DEMO_SUBJECT, { method: "DELETE" });
}
