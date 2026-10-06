<?php

namespace Database\Seeders;

use App\Models\FitMuscleGroup;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class FitMuscleGroupSeeder extends Seeder
{
    public function run(): void
    {
        $zones = [
            ['name' => 'Parte Superior del Cuerpo', 'description' => 'Pecho, espalda, hombros y brazos.'],
            ['name' => 'Zona Media', 'description' => 'Abdomen y zona lumbar.'],
            ['name' => 'Parte Inferior', 'description' => 'Piernas y glúteos.'],
        ];

        foreach ($zones as $zone) {
            FitMuscleGroup::query()->updateOrCreate(
                ['slug' => Str::slug($zone['name'])],
                [
                    'name' => $zone['name'],
                    'description' => $zone['description'],
                    'is_active' => true,
                ]
            );
        }
    }
}
