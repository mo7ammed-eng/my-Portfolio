import { NextResponse } from "next/server";
import { laravel, collection } from "@/lib/laravel";

export const dynamic = "force-dynamic";

export async function GET() {
  const res = await laravel("/skills");
  if (!res.ok) return NextResponse.json([], { status: res.status || 503 });
  return NextResponse.json(collection(res.data));
}
