<?php

namespace Database\Seeders;

use App\Models\FitMuscle;
use App\Models\FitMuscleGroup;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class FitMuscleSeeder extends Seeder
{
    public function run(): void
    {
        $muscles = [
            'parte-superior-del-cuerpo' => [
                ['name' => 'Pecho', 'description' => 'Pectoral mayor y menor.'],
                ['name' => 'Espalda', 'description' => 'Dorsal ancho y romboides.'],
                ['name' => 'Trapecio', 'description' => 'Trapecio superior, medio e inferior.'],
                ['name' => 'Hombros', 'description' => 'Deltoides anterior, lateral y posterior.'],
                ['name' => 'Bíceps', 'description' => 'Bíceps braquial y braquial anterior.'],
                ['name' => 'Tríceps', 'description' => 'Tríceps braquial, las tres cabezas.'],
                ['name' => 'Antebrazo', 'description' => 'Flexores y extensores del antebrazo.'],
            ],
            'zona-media' => [
                ['name' => 'Abdomen', 'description' => 'Recto abdominal y oblicuos.'],
                ['name' => 'Zona lumbar', 'description' => 'Erectores espinales y zona baja de la espalda.'],
            ],
            'parte-inferior' => [
                ['name' => 'Cuádriceps', 'description' => 'Parte frontal del muslo.'],
                ['name' => 'Isquiotibiales', 'description' => 'Parte posterior del muslo.'],
                ['name' => 'Glúteos', 'description' => 'Glúteo mayor, medio y menor.'],
                ['name' => 'Pantorrillas', 'description' => 'Gemelos y sóleo.'],
            ],
        ];

        foreach ($muscles as $zoneSlug => $items) {
            $zone = FitMuscleGroup::query()->where('slug', $zoneSlug)->first();
            if (! $zone) {
                continue;
            }

            foreach ($items as $item) {
                FitMuscle::query()->updateOrCreate(
                    ['muscle_group_id' => $zone->id, 'slug' => Str::slug($item['name'])],
                    [
                        'name' => $item['name'],
                        'description' => $item['description'],
                        'is_active' => true,
                    ]
                );
            }
        }
    }
}
