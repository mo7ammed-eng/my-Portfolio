import { NextResponse } from "next/server";
import { laravel } from "@/lib/laravel";

export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    const { email } = await req.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    const res = await laravel("/subscribe", { method: "POST", body: { email } });

    if (res.status === 0) {
      return NextResponse.json({ error: "Subscription service unavailable" }, { status: 503 });
    }
    if (!res.ok) {
      return NextResponse.json(
        { error: res.data?.message || "Failed to subscribe" },
        { status: res.status }
      );
    }

    return NextResponse.json(res.data, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
