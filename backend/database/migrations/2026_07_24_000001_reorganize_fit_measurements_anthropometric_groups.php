<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('fit_measurements', function (Blueprint $table): void {
            $table->decimal('muscle_mass_percentage', 5, 2)->nullable()->after('body_fat');

            $table->decimal('triceps_skinfold_mm', 8, 2)->nullable()->after('muscle_mass_percentage');
            $table->decimal('subscapular_skinfold_mm', 8, 2)->nullable()->after('triceps_skinfold_mm');
            $table->decimal('suprailiac_skinfold_mm', 8, 2)->nullable()->after('subscapular_skinfold_mm');
            $table->decimal('abdominal_skinfold_mm', 8, 2)->nullable()->after('suprailiac_skinfold_mm');
            $table->decimal('thigh_skinfold_mm', 8, 2)->nullable()->after('abdominal_skinfold_mm');
            $table->decimal('calf_skinfold_mm', 8, 2)->nullable()->after('thigh_skinfold_mm');

            $table->decimal('relaxed_arm_cm', 8, 2)->nullable()->after('calf_skinfold_mm');
            $table->decimal('contracted_arm_cm', 8, 2)->nullable()->after('relaxed_arm_cm');
            $table->decimal('thorax_cm', 8, 2)->nullable()->after('contracted_arm_cm');
            $table->decimal('thigh_cm', 8, 2)->nullable()->after('hip_cm');
            $table->decimal('calf_cm', 8, 2)->nullable()->after('thigh_cm');
        });
    }

    public function down(): void
    {
        Schema::table('fit_measurements', function (Blueprint $table): void {
            $table->dropColumn([
                'muscle_mass_percentage',
                'triceps_skinfold_mm',
                'subscapular_skinfold_mm',
                'suprailiac_skinfold_mm',
                'abdominal_skinfold_mm',
                'thigh_skinfold_mm',
                'calf_skinfold_mm',
                'relaxed_arm_cm',
                'contracted_arm_cm',
                'thorax_cm',
                'thigh_cm',
                'calf_cm',
            ]);
        });
    }
};
