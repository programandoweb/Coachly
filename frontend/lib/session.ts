'use client';

import type { UserRow } from './api/types';

// Nombre de la cookie legible por el navegador (misma que ya usaba el proyecto).
const BROWSER_TOKEN_COOKIE =
  process.env.NEXT_PUBLIC_FIT_BROWSER_TOKEN_COOKIE_NAME?.trim() || 'migo_fit_bearer_token';

const USER_STORAGE_KEY = 'user';

export type SessionUser = UserRow & { token: string };

function setCookie(name: string, value: string, maxAgeSeconds: number) {
  if (typeof document === 'undefined') return;
  const secure = /^https:/i.test(typeof window !== 'undefined' ? window.location.protocol : '');
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeSeconds}; samesite=lax${secure ? '; secure' : ''}`;
}

function deleteCookie(name: string) {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; path=/; max-age=0`;
}

/**
 * Guarda la sesión tal cual la filosofía del ejemplo: el usuario (con su token)
 * queda en localStorage y el token también en una cookie legible.
 */
export function setSession(user: UserRow, token: string, expiresInSeconds?: number) {
  if (typeof window === 'undefined') return;
  const payload: SessionUser = { ...user, token };
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(payload));
  setCookie(BROWSER_TOKEN_COOKIE, token, Math.max(60, expiresInSeconds || 60 * 60 * 24 * 14));
}

export function clearSession() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(USER_STORAGE_KEY);
  deleteCookie(BROWSER_TOKEN_COOKIE);
}

export function getSessionUser(): SessionUser | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(USER_STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as SessionUser;
    return parsed?.token ? parsed : null;
  } catch {
    return null;
  }
}

/** Token de acceso para armar el header Authorization: Bearer. */
export function getAccessToken(): string | null {
  return getSessionUser()?.token ?? null;
}
