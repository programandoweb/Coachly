<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FitClient extends Model
{
    protected $fillable = [
        'trainer_id', 'user_id', 'name', 'whatsapp', 'email', 'birth_date', 'gender', 'goal',
        'weight_kg', 'height_cm', 'health_survey', 'injuries', 'medical_conditions', 'medications',
        'training_experience', 'available_days', 'notes', 'access_enabled',
    ];

    protected function casts(): array
    {
        return [
            'birth_date' => 'date:Y-m-d',
            'weight_kg' => 'float',
            'height_cm' => 'float',
            'access_enabled' => 'boolean',
        ];
    }

    public function trainer()
    {
        return $this->belongsTo(User::class, 'trainer_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function measurements()
    {
        return $this->hasMany(FitMeasurement::class, 'client_id');
    }

    public function routines()
    {
        return $this->hasMany(FitRoutine::class, 'client_id');
    }
}
