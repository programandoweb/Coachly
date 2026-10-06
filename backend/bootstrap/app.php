<?php

if (! function_exists('mb_split')) {
    function mb_split(string $pattern, string $string, int $limit = -1): array|false
    {
        return preg_split('/'.$pattern.'/u', $string, $limit);
    }
}

use App\Http\Middleware\UseFitAccessTokenCookie;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

$fitAuthCookieName = (string) env('FIT_AUTH_COOKIE_NAME', 'migo_fit_access_token');

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withSchedule(function (Schedule $schedule): void {
        $schedule->command('workouts:auto-close')->dailyAt('23:00')->timezone('America/Bogota');
    })
    ->withMiddleware(function (Middleware $middleware) use ($fitAuthCookieName): void {
        // Esta cookie es emitida por Next.js, no por Laravel. Si Laravel intenta
        // desencriptarla, la invalida antes de que el guard JWT pueda leerla.
        $middleware->encryptCookies(except: [$fitAuthCookieName]);

        $middleware->alias([
            'fit.cookie' => UseFitAccessTokenCookie::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->render(function (AuthenticationException $exception, Request $request) {
            if ($request->is('api/*')) {
                return response()->json(['message' => 'No autenticado.'], 401);
            }

            return null;
        });
    })
    ->create();
