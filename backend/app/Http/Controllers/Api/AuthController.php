<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FitClient;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password as PasswordRule;

class AuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'whatsapp' => ['required', 'string', 'max:40'],
            'password' => ['required', 'string', 'max:255'],
        ]);

        $digits = preg_replace('/\D+/', '', (string) $validated['whatsapp']);
        $column = "REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(whatsapp, ' ', ''), '-', ''), '+', ''), '(', ''), ')', '')";
        $user = $digits === '' ? null : User::query()
            ->whereRaw("$column = ?", [$digits])
            ->first();

        if (! $user || ! Hash::check((string) $validated['password'], $user->password)) {
            return response()->json(['message' => 'Credenciales incorrectas.'], 401);
        }

        if (! $user->is_active) {
            return response()->json(['message' => 'Perfil desactivado, contacta con el administrador.'], 403);
        }

        if ($user->role === User::ROLE_CLIENT) {
            $enabled = FitClient::query()
                ->where('user_id', $user->id)
                ->where('access_enabled', true)
                ->exists();

            if (! $enabled) {
                return response()->json(['message' => 'El acceso de este cliente está deshabilitado.'], 403);
            }
        }

        $token = auth('api')->login($user);

        return response()->json([
            'message' => 'Inicio de sesión exitoso.',
            'data' => [
                'user' => $this->payload($user),
                'access_token' => $token,
                'token_type' => 'bearer',
                'expires_in' => auth('api')->factory()->getTTL() * 60,
            ],
        ]);
    }


    public function forgotPassword(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'identifier' => ['required', 'string', 'max:255'],
        ]);

        $identifier = trim((string) $validated['identifier']);
        $user = User::query()
            ->where('is_active', true)
            ->where(function ($query) use ($identifier): void {
                $query->whereRaw('LOWER(email) = ?', [mb_strtolower($identifier)])
                    ->orWhereRaw('LOWER(username) = ?', [mb_strtolower($identifier)]);
            })
            ->first();

        if ($user?->email) {
            Password::broker()->sendResetLink(['email' => $user->email]);
        }

        return response()->json([
            'message' => 'Si la cuenta existe y tiene correo asociado, recibirás instrucciones para cambiar la contraseña.',
        ]);
    }

    public function resetPassword(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'token' => ['required', 'string'],
            'email' => ['required', 'email', 'max:255'],
            'password' => ['required', 'confirmed', PasswordRule::min(8)],
        ]);

        $status = Password::broker()->reset(
            $validated,
            function (User $user, string $password): void {
                $user->forceFill([
                    'password' => Hash::make($password),
                    'remember_token' => Str::random(60),
                ])->save();

                event(new PasswordReset($user));
            }
        );

        if ($status !== Password::PASSWORD_RESET) {
            return response()->json(['message' => __($status)], 422);
        }

        return response()->json(['message' => 'Contraseña actualizada correctamente.']);
    }

    public function changePassword(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'current_password' => ['required', 'string'],
            'password' => ['required', 'confirmed', PasswordRule::min(8)],
        ]);

        /** @var User $user */
        $user = auth('api')->user();

        if (! Hash::check((string) $validated['current_password'], $user->password)) {
            return response()->json(['message' => 'La contraseña actual es incorrecta.'], 422);
        }

        $user->forceFill([
            'password' => Hash::make((string) $validated['password']),
            'remember_token' => Str::random(60),
        ])->save();

        return response()->json(['message' => 'Contraseña actualizada correctamente.']);
    }

    public function me(): JsonResponse
    {
        /** @var User $user */
        $user = auth('api')->user();

        return response()->json(['data' => ['user' => $this->payload($user)]]);
    }

    public function logout(): JsonResponse
    {
        auth('api')->logout();

        return response()->json(['message' => 'Sesión cerrada correctamente.']);
    }

    public function refresh(): JsonResponse
    {
        /** @var User $user */
        $user = auth('api')->user();
        $token = auth('api')->refresh();

        return response()->json([
            'message' => 'Token renovado.',
            'data' => [
                'user' => $this->payload($user),
                'access_token' => $token,
                'token_type' => 'bearer',
                'expires_in' => auth('api')->factory()->getTTL() * 60,
            ],
        ]);
    }

    private function payload(User $user): array
    {
        $clientId = null;
        if ($user->role === User::ROLE_CLIENT) {
            $clientId = FitClient::query()->where('user_id', $user->id)->value('id');
        }

        return [
            'id' => $user->id,
            'name' => $user->name,
            'username' => $user->username,
            'email' => $user->email,
            'whatsapp' => $user->whatsapp,
            'role' => $user->role,
            'is_active' => $user->is_active ? 1 : 0,
            'trainer_id' => $user->role === User::ROLE_TRAINER ? $user->id : null,
            'client_id' => $clientId ? (int) $clientId : null,
        ];
    }
}
