import { isAdmin, unauthorized } from "@/lib/laravel";
import { proxyToLaravel } from "@/lib/bff";

export const dynamic = "force-dynamic";

async function handler(request, { params }) {
  if (!(await isAdmin())) return unauthorized();

  const { path } = await params;
  const suffix = Array.isArray(path) ? path.join("/") : stripTrailing(String(path || ""));
  return proxyToLaravel(request, `/admin/${suffix}`);
}

function stripTrailing(value) {
  return value.replace(/\/+$/, "");
}

export const GET = handler;
export const POST = handler;
export const PATCH = handler;
export const PUT = handler;
export const DELETE = handler;
