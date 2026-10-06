<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ClientController;
use App\Http\Controllers\Api\RoutineController;
use App\Http\Controllers\Api\WorkoutController;
use App\Http\Controllers\Api\PlatformController;
use App\Http\Controllers\Api\MuscleGroupController;
use App\Http\Controllers\Api\MuscleController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function (): void {
    Route::get('/health', fn () => response()->json([
        'status' => 'ok',
        'service' => 'migo-fit-laravel',
        'time' => now()->toIso8601String(),
    ]));

    Route::prefix('fit')->group(function (): void {
        Route::post('/auth/login', [AuthController::class, 'login'])->middleware('throttle:10,1');
        Route::post('/auth/forgot-password', [AuthController::class, 'forgotPassword'])->middleware('throttle:5,1');
        Route::post('/auth/reset-password', [AuthController::class, 'resetPassword'])->middleware('throttle:5,1');
        Route::get('/public/routines/{token}', [RoutineController::class, 'publicShow']);
        Route::put('/workout-sets', [WorkoutController::class, 'upsert'])->middleware(['fit.cookie', 'throttle:120,1']);

        Route::middleware(['fit.cookie', 'auth:api'])->group(function (): void {
            Route::get('/auth/me', [AuthController::class, 'me']);
            Route::post('/auth/logout', [AuthController::class, 'logout']);
            Route::post('/auth/refresh', [AuthController::class, 'refresh']);
            Route::put('/auth/password', [AuthController::class, 'changePassword'])->middleware('throttle:5,1');

            Route::get('/dashboard', [RoutineController::class, 'dashboard']);

            Route::get('/clients/basic', [ClientController::class, 'basic']);
            Route::get('/clients', [ClientController::class, 'index']);
            Route::post('/clients', [ClientController::class, 'store']);
            Route::get('/clients/{client}', [ClientController::class, 'show']);
            Route::put('/clients/{client}', [ClientController::class, 'update']);
            Route::delete('/clients/{client}', [ClientController::class, 'destroy']);
            Route::post('/clients/{client}/share-access', [ClientController::class, 'shareAccess']);
            Route::put('/clients/{client}/active', [ClientController::class, 'setActive']);
            Route::post('/clients/{client}/measurements', [ClientController::class, 'storeMeasurement']);
            Route::get('/clients/{client}/exercise-history', [ClientController::class, 'exerciseHistory']);
            Route::post('/clients/{client}/routines', [RoutineController::class, 'storeForClient']);

            Route::get('/muscle-groups', [MuscleGroupController::class, 'index']);
            Route::get('/muscle-groups/{muscleGroup}', [MuscleGroupController::class, 'show']);
            Route::put('/muscle-groups/{muscleGroup}', [MuscleGroupController::class, 'update']);
            Route::get('/muscle-groups/{muscleGroup}/muscles', [MuscleController::class, 'index']);
            Route::put('/muscles/{muscle}', [MuscleController::class, 'update']);

            Route::get('/routines', [RoutineController::class, 'index']);
            Route::post('/routines', [RoutineController::class, 'store']);
            Route::get('/routines/{routine}', [RoutineController::class, 'show']);
            Route::delete('/routines/{routine}', [RoutineController::class, 'destroy']);
            Route::post('/routines/{routine}/exercises', [RoutineController::class, 'storeExercise']);
            Route::put('/routines/{routine}/exercises/{exercise}', [RoutineController::class, 'updateExercise']);
            Route::delete('/routines/{routine}/exercises/{exercise}', [RoutineController::class, 'destroyExercise']);
            Route::put('/routines/{routine}/exercises/{exercise}/move', [RoutineController::class, 'moveExercise']);
            Route::get('/routines/{routine}/workout-report', [RoutineController::class, 'workoutReport']);
            Route::put('/routines/{routine}/workout-session', [WorkoutController::class, 'session']);
            Route::get('/client/portal', [RoutineController::class, 'clientPortal']);

            Route::get('/platform/overview', [PlatformController::class, 'overview']);
            Route::get('/exercises', [PlatformController::class, 'exercises']);
            Route::post('/exercises', [PlatformController::class, 'storeExercise']);
            Route::delete('/exercises/{exercise}', [PlatformController::class, 'destroyExercise']);
            Route::match(['get','post'], '/plans', [PlatformController::class, 'plans']);
            Route::post('/plans/{plan}/days', [PlatformController::class, 'scheduleDay']);
            Route::match(['get','post'], '/checkins', [PlatformController::class, 'checkins']);
            Route::match(['get','post'], '/clients/{client}/messages', [PlatformController::class, 'messages']);
            Route::get('/achievements', [PlatformController::class, 'achievements']);
        });
    });
});
