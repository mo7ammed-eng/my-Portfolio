import { proxyToLaravel } from "@/lib/bff";

export const dynamic = "force-dynamic";

async function handler(request, { params }) {
  const { path } = await params;
  const suffix = Array.isArray(path) ? path.join("/") : "";
  return proxyToLaravel(request, `/github/${suffix}`, { auth: false });
}

export const GET = handler;
export const POST = handler;
