<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FitMeasurement extends Model
{
    protected $fillable = [
        'client_id', 'weight_kg', 'height_cm', 'neck_cm', 'shoulders_cm', 'waist_cm', 'chest_cm',
        'left_arm_cm', 'right_arm_cm', 'left_forearm_cm', 'right_forearm_cm', 'hip_cm',
        'left_thigh_cm', 'right_thigh_cm', 'left_calf_cm', 'right_calf_cm', 'body_fat',
        'muscle_mass_percentage', 'triceps_skinfold_mm', 'subscapular_skinfold_mm',
        'suprailiac_skinfold_mm', 'abdominal_skinfold_mm', 'thigh_skinfold_mm', 'calf_skinfold_mm',
        'relaxed_arm_cm', 'contracted_arm_cm', 'thorax_cm', 'thigh_cm', 'calf_cm',
        'notes', 'measured_at',
    ];

    protected function casts(): array
    {
        return [
            'weight_kg' => 'float',
            'height_cm' => 'float',
            'neck_cm' => 'float',
            'shoulders_cm' => 'float',
            'waist_cm' => 'float',
            'chest_cm' => 'float',
            'left_arm_cm' => 'float',
            'right_arm_cm' => 'float',
            'left_forearm_cm' => 'float',
            'right_forearm_cm' => 'float',
            'hip_cm' => 'float',
            'left_thigh_cm' => 'float',
            'right_thigh_cm' => 'float',
            'left_calf_cm' => 'float',
            'right_calf_cm' => 'float',
            'body_fat' => 'float',
            'muscle_mass_percentage' => 'float',
            'triceps_skinfold_mm' => 'float',
            'subscapular_skinfold_mm' => 'float',
            'suprailiac_skinfold_mm' => 'float',
            'abdominal_skinfold_mm' => 'float',
            'thigh_skinfold_mm' => 'float',
            'calf_skinfold_mm' => 'float',
            'relaxed_arm_cm' => 'float',
            'contracted_arm_cm' => 'float',
            'thorax_cm' => 'float',
            'thigh_cm' => 'float',
            'calf_cm' => 'float',
            'measured_at' => 'datetime',
        ];
    }

    public function client()
    {
        return $this->belongsTo(FitClient::class, 'client_id');
    }
}
