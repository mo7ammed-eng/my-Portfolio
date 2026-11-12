export async function adminFetch(path, options = {}) {
  const res = await fetch(`/api/admin${path}`, {
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers || {}),
    },
    cache: 'no-store',
  });

  if (res.status === 401 && typeof window !== 'undefined') {
    window.location.href = '/admin/login';
    return { ok: false, status: 401, data: null };
  }

  let data = null;
  const type = res.headers.get('content-type') || '';
  if (type.includes('application/json')) {
    data = await res.json().catch(() => null);
  } else {
    data = await res.text().catch(() => null);
  }

  return { ok: res.ok, status: res.status, data };
}

export function errorMessage(result, fallback = 'Something went wrong.') {
  if (!result) return fallback;
  return (
    result.data?.message ||
    result.data?.error ||
    (typeof result.data === 'string' ? result.data : null) ||
    fallback
  );
}
