<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            FitAchievementSeeder::class,
            FitMuscleGroupSeeder::class,
            FitMuscleSeeder::class,
            BrianMvpSeeder::class,
        ]);
    }
}
