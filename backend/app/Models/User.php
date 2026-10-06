<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use App\Notifications\FitResetPasswordNotification;
use Illuminate\Notifications\Notifiable;
use Tymon\JWTAuth\Contracts\JWTSubject;

class User extends Authenticatable implements JWTSubject
{
    use HasFactory, Notifiable;

    public const ROLE_TRAINER = 'TRAINER';
    public const ROLE_CLIENT = 'CLIENT';

    protected $fillable = [
        'name',
        'username',
        'email',
        'whatsapp',
        'password',
        'role',
        'is_active',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'password' => 'hashed',
            'is_active' => 'boolean',
        ];
    }

    public function sendPasswordResetNotification($token): void
    {
        $this->notify(new FitResetPasswordNotification((string) $token));
    }

    public function clientProfile()
    {
        return $this->hasOne(FitClient::class, 'user_id');
    }

    public function clients()
    {
        return $this->hasMany(FitClient::class, 'trainer_id');
    }

    public function routines()
    {
        return $this->hasMany(FitRoutine::class, 'trainer_id');
    }

    public function getJWTIdentifier(): mixed
    {
        return $this->getKey();
    }

    public function getJWTCustomClaims(): array
    {
        return ['role' => $this->role];
    }
}
