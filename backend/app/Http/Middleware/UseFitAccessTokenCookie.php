<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class UseFitAccessTokenCookie
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->bearerToken()) {
            $cookieName = (string) env('FIT_AUTH_COOKIE_NAME', 'migo_fit_access_token');
            $token = $request->cookie($cookieName);

            // Respaldo defensivo: permite recuperar la cookie original del header
            // incluso si otro middleware alteró el CookieBag antes de este punto.
            if (! is_string($token) || $token === '') {
                $token = $this->readRawCookie($request, $cookieName);
            }

            if (is_string($token) && $token !== '') {
                $request->headers->set('Authorization', 'Bearer '.$token);
            }
        }

        return $next($request);
    }

    private function readRawCookie(Request $request, string $cookieName): ?string
    {
        $rawCookieHeader = (string) $request->headers->get('Cookie', '');

        foreach (explode(';', $rawCookieHeader) as $cookiePair) {
            [$name, $value] = array_pad(explode('=', trim($cookiePair), 2), 2, null);

            if ($name === $cookieName && is_string($value) && $value !== '') {
                return rawurldecode($value);
            }
        }

        return null;
    }
}
