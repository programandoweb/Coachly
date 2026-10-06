import { LaravelApiError } from './errors';
import { getAccessToken } from '../session';

export type LaravelHttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';
export type LaravelClientRequestOptions = Omit<RequestInit, 'body' | 'method'> & {
  body?: unknown;
  skipToken?: boolean;
};

type LaravelEnvelope<T> = {
  message?: string;
  data?: T;
  errors?: Record<string, string[]>;
};

const BROWSER_TOKEN_COOKIE =
  process.env.NEXT_PUBLIC_FIT_BROWSER_TOKEN_COOKIE_NAME?.trim() || 'migo_fit_bearer_token';

// Activa/desactiva los logs sin tocar el código (poner NEXT_PUBLIC_FIT_DEBUG_API=true en .env)
const DEBUG = process.env.NEXT_PUBLIC_FIT_DEBUG_API === 'true';

function log(...args: unknown[]) {
  if (DEBUG) console.log('[LaravelAPI]', ...args);
}

function logError(...args: unknown[]) {
  // Los errores se muestran siempre, no solo en modo debug
  console.error('[LaravelAPI]', ...args);
}

/** Fallback: si por algún motivo no hay token en localStorage, se intenta leer la cookie. */
function readTokenFromCookie(): string | null {
  if (typeof document === 'undefined') return null;

  const prefix = `${BROWSER_TOKEN_COOKIE}=`;
  const cookie = document.cookie
    .split(';')
    .map((item) => item.trim())
    .find((item) => item.startsWith(prefix));

  if (!cookie) return null;

  try {
    return decodeURIComponent(cookie.slice(prefix.length));
  } catch {
    return cookie.slice(prefix.length);
  }
}

function readBrowserAccessToken(): string | null {
  if (typeof window === 'undefined') {
    log('readBrowserAccessToken: window no disponible (SSR)');
    return null;
  }

  const token = getAccessToken() || readTokenFromCookie();
  if (!token) {
    log('readBrowserAccessToken: no hay token en localStorage ni en cookie');
    return null;
  }

  log('readBrowserAccessToken: token encontrado', `${token.slice(0, 10)}...`);
  return token;
}

function browserApiBaseUrl() {
  const value = (process.env.NEXT_PUBLIC_LARAVEL_API_URL || 'http://localhost:8000/api/v1').trim();

  if (!/^https?:\/\//i.test(value)) {
    logError('browserApiBaseUrl: NEXT_PUBLIC_LARAVEL_API_URL inválida ->', value);
    throw new LaravelApiError('NEXT_PUBLIC_LARAVEL_API_URL debe apuntar directamente a Laravel.', 0);
  }

  return value.replace(/\/+$/, '');
}

/**
 * Cliente HTTP de bajo nivel: hace la petición directa a Laravel desde el
 * navegador, adjuntando el token (Bearer) leído de localStorage.
 */
export async function browserLaravelApi<T>(
  method: LaravelHttpMethod,
  path: string,
  options: LaravelClientRequestOptions = {}
): Promise<T> {
  const { skipToken, body, headers: rawHeaders, ...requestInit } = options;
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
  const headers = new Headers(rawHeaders);
  headers.set('Accept', 'application/json');
  // FormData: dejamos que el navegador fije Content-Type con el boundary correcto.
  if (body !== undefined && !isFormData) headers.set('Content-Type', 'application/json');

  if (!skipToken) {
    const accessToken = readBrowserAccessToken();
    if (accessToken && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${accessToken}`);
    }
  }

  const url = `${browserApiBaseUrl()}/${path.replace(/^\/+/, '')}`;

  log(`➡️  ${method} ${url}`);
  log('headers:', Object.fromEntries(headers.entries()));
  if (body !== undefined) log('body:', body);

  const startedAt = typeof performance !== 'undefined' ? performance.now() : Date.now();
  let response: Response;
  try {
    response = await fetch(url, {
      ...requestInit,
      method,
      headers,
      body: body === undefined ? undefined : isFormData ? (body as FormData) : JSON.stringify(body),
      credentials: 'include',
      cache: 'no-store'
    });
  } catch (error) {
    logError(`❌ ${method} ${url} -> fetch falló`, error);
    throw new LaravelApiError(
      error instanceof Error
        ? `No fue posible conectar con Laravel: ${error.message}`
        : 'No fue posible conectar con Laravel.',
      0
    );
  }

  const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
  log(`⬅️  ${method} ${url} -> HTTP ${response.status} (${Math.round(now - startedAt)}ms)`);

  if (response.status === 204) {
    log('respuesta 204 sin contenido');
    return undefined as T;
  }

  const payload = (await response.json().catch((error) => {
    logError('no se pudo parsear el JSON de la respuesta', error);
    return {};
  })) as LaravelEnvelope<T>;

  log('payload:', payload);

  if (!response.ok) {
    logError(`❌ ${method} ${url} -> HTTP ${response.status}`, payload.errors ?? payload.message);
    throw new LaravelApiError(
      payload.message || `Laravel respondió HTTP ${response.status}`,
      response.status,
      payload.errors || {}
    );
  }

  return (payload.data ?? payload) as T;
}
