'use client';

import { LaravelApiError } from './api/errors';
import { currentUser } from './api/fit';
import { clearSession as clearBrowserSession, getSessionUser } from './session';
import type { UserRow } from './api/types';

export { setSession, clearSession, getSessionUser, getAccessToken } from './session';

/** Usuario guardado localmente (sin golpear la red). Útil para render inmediato. */
export function getLocalUser(): UserRow | null {
  const session = getSessionUser();
  if (!session) return null;
  const { token: _token, ...user } = session;
  return user;
}

/** Confirma con Laravel que el token sigue siendo válido y trae el usuario actualizado. */
export async function getCurrentUser(): Promise<UserRow | null> {
  const local = getSessionUser();
  if (!local) return null;

  try {
    return (await currentUser()).user;
  } catch (error) {
    if (error instanceof LaravelApiError && error.status === 401) {
      clearBrowserSession();
      return null;
    }
    throw error;
  }
}
