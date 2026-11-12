'use client';
import { useEffect } from 'react';

const VARS = {
  background: '--background',
  surface: '--surface',
  surface_light: '--surface-light',
  primary: '--primary',
  secondary: '--secondary',
  accent: '--accent',
  text: '--text',
  muted: '--muted',
};

export default function ThemeLoader() {
  useEffect(() => {
    let cancelled = false;
    fetch('/api/settings?scope=theme', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : []))
      .then((rows) => {
        if (cancelled || !Array.isArray(rows)) return;
        const palette = rows.find((row) => row.key === 'palette')?.value;
        if (!palette || typeof palette !== 'object') return;
        const root = document.documentElement;
        Object.entries(VARS).forEach(([key, cssVar]) => {
          const value = palette[key];
          if (typeof value === 'string' && /^#[0-9a-f]{3,8}$/i.test(value.trim())) {
            root.style.setProperty(cssVar, value.trim());
          }
        });
        if (palette.primary) root.style.setProperty('--orange', palette.primary);
      })
      .catch(() => null);
    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
