<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class FitMuscle extends Model
{
    protected $fillable = [
        'muscle_group_id', 'name', 'slug', 'description', 'image_path', 'is_active',
    ];

    protected $appends = ['image_url'];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function muscleGroup()
    {
        return $this->belongsTo(FitMuscleGroup::class, 'muscle_group_id');
    }

    public function getImageUrlAttribute(): ?string
    {
        return $this->image_path ? Storage::disk('public')->url($this->image_path) : null;
    }
}
