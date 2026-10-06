<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FitRoutine extends Model
{
    protected $fillable = [
        'trainer_id', 'client_id', 'muscle_group_id', 'title', 'objective', 'level', 'notes', 'share_token', 'is_published',
    ];

    protected function casts(): array
    {
        return ['is_published' => 'boolean'];
    }

    public function trainer()
    {
        return $this->belongsTo(User::class, 'trainer_id');
    }

    public function client()
    {
        return $this->belongsTo(FitClient::class, 'client_id');
    }

    public function muscleGroup()
    {
        return $this->belongsTo(FitMuscleGroup::class, 'muscle_group_id');
    }

    public function exercises()
    {
        return $this->hasMany(FitRoutineExercise::class, 'routine_id')->orderBy('sort_order')->orderBy('id');
    }

    public function workoutSets()
    {
        return $this->hasMany(FitWorkoutSet::class, 'routine_id');
    }

    public function workoutSessions()
    {
        return $this->hasMany(FitWorkoutSession::class, 'routine_id')->latest('started_at');
    }
}
