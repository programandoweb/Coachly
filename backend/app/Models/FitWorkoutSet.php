<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FitWorkoutSet extends Model
{
    protected $fillable = [
        'routine_id', 'client_id', 'exercise_id', 'set_number', 'weight_kg', 'reps_done', 'completed_at',
    ];

    protected function casts(): array
    {
        return [
            'set_number' => 'integer',
            'weight_kg' => 'float',
            'reps_done' => 'integer',
            'completed_at' => 'datetime',
        ];
    }

    public function exercise()
    {
        return $this->belongsTo(FitRoutineExercise::class, 'exercise_id');
    }
}
