import { NextResponse } from "next/server";
import { laravel, collection } from "@/lib/laravel";

export const dynamic = "force-dynamic";

export async function GET() {
  const res = await laravel("/about");
  if (!res.ok) return NextResponse.json(null, { status: res.status || 503 });
  const rows = collection(res.data);
  return NextResponse.json(rows[0] ?? null);
}
