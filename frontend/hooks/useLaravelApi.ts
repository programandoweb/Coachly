'use client';

import { useCallback, useMemo } from 'react';
import { browserLaravelApi, type LaravelClientRequestOptions, type LaravelHttpMethod } from '@/lib/api/client';

export function useLaravelApi() {
  const request = useCallback(
    <T,>(method: LaravelHttpMethod, path: string, options?: LaravelClientRequestOptions) =>
      browserLaravelApi<T>(method, path, options),
    []
  );

  return useMemo(() => ({
    request,
    get: <T,>(path: string, options?: LaravelClientRequestOptions) => request<T>('GET', path, options),
    post: <T,>(path: string, body?: unknown, options?: LaravelClientRequestOptions) => request<T>('POST', path, { ...options, body }),
    put: <T,>(path: string, body?: unknown, options?: LaravelClientRequestOptions) => request<T>('PUT', path, { ...options, body }),
    delete: <T,>(path: string, options?: LaravelClientRequestOptions) => request<T>('DELETE', path, options)
  }), [request]);
}
