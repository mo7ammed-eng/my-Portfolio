import { NextResponse } from "next/server";
import { isAdmin, unauthorized, laravelAdmin } from "@/lib/laravel";

export const dynamic = "force-dynamic";

function randomState() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export async function POST() {
  if (!(await isAdmin())) return unauthorized();

  const state = randomState();
  const result = await laravelAdmin("/admin/github/oauth/url", {
    method: "POST",
    body: { state },
  });

  if (!result.ok || !result.data?.url) {
    return NextResponse.json(
      { message: result.data?.message || "GitHub OAuth is not configured yet." },
      { status: result.status || 503 }
    );
  }

  const res = NextResponse.json({ url: result.data.url });
  res.cookies.set("github_oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 600,
    path: "/",
  });

  return res;
}
