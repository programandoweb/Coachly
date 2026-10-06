<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('fit_muscle_groups', function (Blueprint $table): void {
            $table->dropForeign(['trainer_id']);
            $table->dropUnique(['trainer_id', 'slug']);
            $table->dropColumn('trainer_id');
            $table->unique('slug');
        });

        // Los grupos musculares ahora son 3 zonas fijas y globales; se descarta
        // la data previa (músculos individuales sembrados por error como si fueran zonas).
        DB::table('fit_muscle_groups')->truncate();

        Schema::create('fit_muscles', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('muscle_group_id')->constrained('fit_muscle_groups')->cascadeOnDelete();
            $table->string('name', 120);
            $table->string('slug', 140);
            $table->text('description')->nullable();
            $table->string('image_path')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['muscle_group_id', 'slug']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('fit_muscles');

        Schema::table('fit_muscle_groups', function (Blueprint $table): void {
            $table->dropUnique(['slug']);
            $table->foreignId('trainer_id')->nullable()->constrained('users')->nullOnDelete();
            $table->unique(['trainer_id', 'slug']);
        });
    }
};
