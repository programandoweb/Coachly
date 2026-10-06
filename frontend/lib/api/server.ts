import 'server-only';

import { cookies } from 'next/headers';
import { LaravelApiError } from './errors';

export const ACCESS_TOKEN_COOKIE = process.env.FIT_AUTH_COOKIE_NAME?.trim() || 'migo_fit_access_token';

type AuthMode = 'required' | 'optional' | 'none';

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown;
  auth?: AuthMode;
};

type LaravelEnvelope<T> = {
  message?: string;
  data?: T;
  errors?: Record<string, string[]>;
};

function serverApiBaseUrl() {
  const value = (process.env.LARAVEL_API_URL || 'http://localhost:8000/api/v1').trim();

  if (!/^https?:\/\//i.test(value)) {
    throw new LaravelApiError('LARAVEL_API_URL debe ser una URL absoluta de Laravel.', 0);
  }

  return value.replace(/\/+$/, '');
}

export async function laravelApi<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, auth = 'required', headers, ...requestInit } = options;
  const requestHeaders = new Headers(headers);
  requestHeaders.set('Accept', 'application/json');

  if (body !== undefined) requestHeaders.set('Content-Type', 'application/json');

  if (auth !== 'none') {
    const token = (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;

    if (token) {
      requestHeaders.set('Authorization', `Bearer ${token}`);
    } else if (auth === 'required') {
      throw new LaravelApiError('No autenticado.', 401);
    }
  }

  let response: Response;
  try {
    response = await fetch(`${serverApiBaseUrl()}/${path.replace(/^\/+/, '')}`, {
      ...requestInit,
      headers: requestHeaders,
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: 'no-store'
    });
  } catch (error) {
    throw new LaravelApiError(
      error instanceof Error ? `No fue posible conectar con Laravel: ${error.message}` : 'No fue posible conectar con Laravel.',
      0
    );
  }

  if (response.status === 204) return undefined as T;

  const payload = (await response.json().catch(() => ({}))) as LaravelEnvelope<T>;

  if (!response.ok) {
    throw new LaravelApiError(
      payload.message || `Laravel respondió HTTP ${response.status}`,
      response.status,
      payload.errors || {}
    );
  }

  return (payload.data ?? payload) as T;
}
