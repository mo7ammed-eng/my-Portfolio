'use client';
import { useEffect } from 'react';

const MAX_REPORTS = 10;
const DEDUPE_WINDOW = 30000;

function report(payload, sent, recent) {
  const key = `${payload.message}|${payload.source}`;
  const now = Date.now();
  if (recent.has(key) && now - recent.get(key) < DEDUPE_WINDOW) return;
  if (sent.count >= MAX_REPORTS) return;
  recent.set(key, now);
  sent.count += 1;

  fetch('/api/logs/client', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    keepalive: true,
  }).catch(() => {});
}

export default function ClientErrorReporter() {
  useEffect(() => {
    const sent = { count: 0 };
    const recent = new Map();

    const onError = (event) => {
      const message = event?.message || 'Unknown client error';
      if (message.includes('ResizeObserver loop')) return;
      report(
        {
          level: 'error',
          message: String(message).slice(0, 2000),
          stack_trace: event?.error?.stack ? String(event.error.stack).slice(0, 15000) : '',
          source: 'window.onerror',
          url: window.location.href.slice(0, 2000),
          context: {
            filename: event?.filename || '',
            lineno: event?.lineno || null,
            colno: event?.colno || null,
          },
        },
        sent,
        recent
      );
    };

    const onRejection = (event) => {
      const reason = event?.reason;
      const message =
        reason instanceof Error ? reason.message : typeof reason === 'string' ? reason : 'Unhandled promise rejection';
      report(
        {
          level: 'error',
          message: String(message).slice(0, 2000),
          stack_trace: reason instanceof Error && reason.stack ? String(reason.stack).slice(0, 15000) : '',
          source: 'unhandledrejection',
          url: window.location.href.slice(0, 2000),
        },
        sent,
        recent
      );
    };

    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onRejection);
    return () => {
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onRejection);
    };
  }, []);

  return null;
}
