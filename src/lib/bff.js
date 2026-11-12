import { NextResponse } from "next/server";
import { LARAVEL_API_URL } from "@/lib/laravel";

const SERVICE_TOKEN = process.env.LARAVEL_SERVICE_TOKEN || "";
const VISITOR_RE = /^[A-Za-z0-9_-]{8,64}$/;

function forwardHeader(request, target, name) {
  const value = request.headers.get(name);
  if (value) target.set(name, value);
}

/**
 * Proxy a Next route to the Laravel API. Preserves status, content type and
 * content disposition so binary/CSV responses pass through unchanged.
 */
export async function proxyToLaravel(request, laravelPath, { auth = true } = {}) {
  const incoming = new URL(request.url);
  const target = `${LARAVEL_API_URL}${laravelPath}${incoming.search}`;

  const method = request.method.toUpperCase();
  const headers = new Headers({ Accept: request.headers.get("accept") || "application/json" });

  const contentType = request.headers.get("content-type");
  if (contentType) headers.set("Content-Type", contentType);

  if (auth && SERVICE_TOKEN) headers.set("Authorization", `Bearer ${SERVICE_TOKEN}`);

  const cookieVisitor = request.cookies.get("visitor_id")?.value;
  const visitorId =
    cookieVisitor && VISITOR_RE.test(cookieVisitor)
      ? cookieVisitor
      : crypto.randomUUID();
  const isNewVisitor = visitorId !== cookieVisitor;
  headers.set("X-Visitor-Id", visitorId);

  forwardHeader(request, headers, "origin");
  forwardHeader(request, headers, "referer");
  forwardHeader(request, headers, "user-agent");
  forwardHeader(request, headers, "accept-language");
  forwardHeader(request, headers, "x-real-ip");
  forwardHeader(request, headers, "x-vercel-ip-country");
  forwardHeader(request, headers, "x-vercel-ip-city");
  forwardHeader(request, headers, "cf-ipcountry");

  const forwardedFor =
    request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip");
  if (forwardedFor) headers.set("X-Forwarded-For", forwardedFor);

  let body;
  if (!["GET", "HEAD"].includes(method)) {
    const buffer = await request.arrayBuffer().catch(() => null);
    if (buffer && buffer.byteLength > 0) body = buffer;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch(target, {
      method,
      headers,
      body,
      cache: "no-store",
      signal: controller.signal,
    });

    const responseHeaders = new Headers();
    const responseType = response.headers.get("content-type");
    if (responseType) responseHeaders.set("Content-Type", responseType);
    const disposition = response.headers.get("content-disposition");
    if (disposition) responseHeaders.set("Content-Disposition", disposition);

    const status = response.status;
    const buffer = status === 204 || status === 304 ? null : await response.arrayBuffer();

    const out = new NextResponse(buffer, { status, headers: responseHeaders });

    if (isNewVisitor) {
      out.cookies.set("visitor_id", visitorId, {
        httpOnly: false,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 365,
        path: "/",
      });
    }

    return out;
  } catch {
    return NextResponse.json({ error: "Backend unavailable" }, { status: 503 });
  } finally {
    clearTimeout(timer);
  }
}
