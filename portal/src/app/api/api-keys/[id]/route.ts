import { forwardToGateway } from "@/lib/gateway";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Params) {
  const { id } = await params;
  return forwardToGateway(`/api-keys/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: await req.text(),
  });
}

export async function DELETE(_req: Request, { params }: Params) {
  const { id } = await params;
  return forwardToGateway(`/api-keys/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}
