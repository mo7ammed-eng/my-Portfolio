import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

export const LARAVEL_API_URL =
  process.env.LARAVEL_API_URL || "http://127.0.0.1:8000/api";

const SERVICE_TOKEN = process.env.LARAVEL_SERVICE_TOKEN || "";
const TIMEOUT = 15000;

/**
 * Server-side fetch helper for the Laravel API.
 * Returns { ok, status, data } and never throws.
 */
export async function laravel(path, options = {}) {
  const {
    method = "GET",
    body,
    headers = {},
    token,
    cache = "no-store",
    timeout = TIMEOUT,
    rawBody,
  } = options;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  const finalHeaders = { Accept: "application/json", ...headers };
  const bearer = token ?? SERVICE_TOKEN;
  if (bearer) finalHeaders.Authorization = `Bearer ${bearer}`;

  let payload;
  if (rawBody !== undefined) {
    payload = rawBody;
  } else if (body !== undefined && body !== null) {
    if (body instanceof FormData) {
      payload = body;
    } else {
      finalHeaders["Content-Type"] = "application/json";
      payload = JSON.stringify(body);
    }
  }

  try {
    const res = await fetch(`${LARAVEL_API_URL}${path}`, {
      method,
      headers: finalHeaders,
      body: payload,
      cache,
      signal: controller.signal,
    });

    const text = await res.text();
    let data = null;
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = text;
      }
    }

    return { ok: res.ok, status: res.status, data };
  } catch {
    return { ok: false, status: 0, data: null };
  } finally {
    clearTimeout(timer);
  }
}

/** Admin mutations always go through the Sanctum service token. */
export function laravelAdmin(path, options = {}) {
  return laravel(path, options);
}

/** Verify the Next-side admin JWT cookie (issued at login). */
export async function isAdmin() {
  try {
    const store = await cookies();
    const token = store.get("admin_token")?.value;
    if (!token) return false;
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    await jwtVerify(token, secret);
    return true;
  } catch {
    return false;
  }
}

/** Standard 401 response for admin-only routes. */
export function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

/** Unwrap Laravel ResourceCollection ({ data: [...] }) or plain arrays. */
export function collection(payload) {
  if (Array.isArray(payload)) return payload;
  if (payload && Array.isArray(payload.data)) return payload.data;
  return [];
}

/** Mirror a Laravel response through the BFF, preserving status. */
export function mirror(result, fallbackStatus = 200) {
  if (result.status === 0) {
    return NextResponse.json({ error: "Backend unavailable" }, { status: 503 });
  }
  return NextResponse.json(result.data, { status: result.status || fallbackStatus });
}
