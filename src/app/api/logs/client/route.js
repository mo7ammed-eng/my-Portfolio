import { NextResponse } from "next/server";
import { proxyToLaravel } from "@/lib/bff";

export const dynamic = "force-dynamic";

export async function POST(request) {
  const length = Number(request.headers.get("content-length") || 0);
  if (length > 32768) {
    return NextResponse.json({ error: "Payload too large" }, { status: 413 });
  }

  return proxyToLaravel(request, "/logs/client", { auth: false });
}
