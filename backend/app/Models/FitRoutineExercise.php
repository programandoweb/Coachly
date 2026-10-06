<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FitRoutineExercise extends Model
{
    protected $fillable = [
        'routine_id', 'name', 'muscle_group', 'sets', 'reps', 'rest_seconds', 'rest_seconds_overrides',
        'target_weight_kg', 'tempo', 'method', 'notes', 'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'sets' => 'integer',
            'rest_seconds' => 'integer',
            'rest_seconds_overrides' => 'array',
            'target_weight_kg' => 'float',
            'sort_order' => 'integer',
        ];
    }

    public function routine()
    {
        return $this->belongsTo(FitRoutine::class, 'routine_id');
    }
}
