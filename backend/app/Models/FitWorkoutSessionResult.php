<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FitWorkoutSessionResult extends Model
{
    protected $fillable = [
        'workout_session_id', 'routine_id', 'client_id', 'exercise_id', 'exercise_key',
        'exercise_name', 'muscle_group', 'set_number', 'weight_kg', 'reps_done', 'volume_score', 'completed_at',
    ];

    protected function casts(): array
    {
        return [
            'set_number' => 'integer',
            'weight_kg' => 'float',
            'reps_done' => 'integer',
            'volume_score' => 'float',
            'completed_at' => 'datetime',
        ];
    }
}
