import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { isAdmin, laravelAdmin } from "@/lib/laravel";

export const dynamic = "force-dynamic";

function redirectTo(request, params) {
  const url = new URL("/admin/github", request.url);
  for (const [key, value] of Object.entries(params)) {
    if (value) url.searchParams.set(key, value);
  }
  return NextResponse.redirect(url);
}

export async function GET(request) {
  if (!(await isAdmin())) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const oauthError = searchParams.get("error_description") || searchParams.get("error");

  const store = await cookies();
  const expectedState = store.get("github_oauth_state")?.value;

  const clearState = (res) => {
    res.cookies.set("github_oauth_state", "", { maxAge: 0, path: "/" });
    return res;
  };

  if (oauthError) {
    return clearState(redirectTo(request, { error: oauthError }));
  }

  if (!code || !state || !expectedState || state !== expectedState) {
    return clearState(redirectTo(request, { error: "Invalid or expired OAuth state. Try connecting again." }));
  }

  const result = await laravelAdmin("/admin/github/oauth/exchange", {
    method: "POST",
    body: { code },
  });

  if (!result.ok) {
    const message = result.data?.message || "GitHub account could not be connected.";
    return clearState(redirectTo(request, { error: message }));
  }

  return clearState(
    redirectTo(request, {
      connected: "1",
      username: result.data?.account?.username || "",
      synced: String(result.data?.sync?.synced ?? 0),
      sync_error: result.data?.sync_error || "",
    })
  );
}
