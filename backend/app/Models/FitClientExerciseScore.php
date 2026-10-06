<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FitClientExerciseScore extends Model
{
    protected $fillable = [
        'client_id', 'exercise_key', 'exercise_name', 'last_workout_session_id', 'total_volume',
        'best_weight_kg', 'best_reps', 'estimated_one_rep_max', 'completed_sets', 'last_sets', 'performed_at',
    ];

    protected function casts(): array
    {
        return [
            'total_volume' => 'float',
            'best_weight_kg' => 'float',
            'best_reps' => 'integer',
            'estimated_one_rep_max' => 'float',
            'completed_sets' => 'integer',
            'last_sets' => 'array',
            'performed_at' => 'datetime',
        ];
    }
}
