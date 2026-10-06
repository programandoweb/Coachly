<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FitWorkoutSession extends Model
{
    protected $fillable = [
        'routine_id', 'client_id', 'trainer_id', 'started_by', 'started_at', 'ended_at', 'duration_seconds',
    ];

    protected function casts(): array
    {
        return [
            'started_at' => 'datetime',
            'ended_at' => 'datetime',
            'duration_seconds' => 'integer',
        ];
    }

    public function routine()
    {
        return $this->belongsTo(FitRoutine::class, 'routine_id');
    }
}
