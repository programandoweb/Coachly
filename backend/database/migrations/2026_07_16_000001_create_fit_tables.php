<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('fit_clients', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('trainer_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->unique()->constrained('users')->nullOnDelete();
            $table->string('name');
            $table->string('whatsapp', 40);
            $table->string('email')->nullable();
            $table->date('birth_date')->nullable();
            $table->string('gender', 50)->nullable();
            $table->string('goal')->nullable();
            $table->decimal('weight_kg', 8, 2)->nullable();
            $table->decimal('height_cm', 8, 2)->nullable();
            $table->text('health_survey')->nullable();
            $table->text('injuries')->nullable();
            $table->text('medical_conditions')->nullable();
            $table->text('medications')->nullable();
            $table->text('training_experience')->nullable();
            $table->text('available_days')->nullable();
            $table->text('notes')->nullable();
            $table->boolean('access_enabled')->default(false);
            $table->timestamps();
            $table->index(['trainer_id', 'name']);
            $table->index('whatsapp');
        });

        Schema::create('fit_measurements', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('client_id')->constrained('fit_clients')->cascadeOnDelete();
            $table->decimal('weight_kg', 8, 2)->nullable();
            $table->decimal('height_cm', 8, 2)->nullable();
            $table->decimal('waist_cm', 8, 2)->nullable();
            $table->decimal('chest_cm', 8, 2)->nullable();
            $table->decimal('hip_cm', 8, 2)->nullable();
            $table->decimal('body_fat', 6, 2)->nullable();
            $table->text('notes')->nullable();
            $table->timestamp('measured_at')->useCurrent();
            $table->timestamps();
            $table->index(['client_id', 'measured_at']);
        });

        Schema::create('fit_routines', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('trainer_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('client_id')->nullable()->constrained('fit_clients')->nullOnDelete();
            $table->string('title');
            $table->text('objective')->nullable();
            $table->string('level', 80)->nullable();
            $table->text('notes')->nullable();
            $table->string('share_token', 100)->unique();
            $table->boolean('is_published')->default(true);
            $table->timestamps();
            $table->index(['trainer_id', 'created_at']);
            $table->index(['client_id', 'created_at']);
        });

        Schema::create('fit_routine_exercises', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('routine_id')->constrained('fit_routines')->cascadeOnDelete();
            $table->string('name');
            $table->string('muscle_group')->nullable();
            $table->unsignedSmallInteger('sets')->default(3);
            $table->string('reps', 60)->default('10');
            $table->unsignedInteger('rest_seconds')->nullable();
            $table->decimal('target_weight_kg', 8, 2)->nullable();
            $table->string('tempo', 80)->nullable();
            $table->string('method', 120)->nullable();
            $table->text('notes')->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
            $table->index(['routine_id', 'sort_order']);
        });

        Schema::create('fit_workout_sets', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('routine_id')->constrained('fit_routines')->cascadeOnDelete();
            $table->foreignId('client_id')->constrained('fit_clients')->cascadeOnDelete();
            $table->foreignId('exercise_id')->constrained('fit_routine_exercises')->cascadeOnDelete();
            $table->unsignedSmallInteger('set_number');
            $table->decimal('weight_kg', 8, 2)->nullable();
            $table->unsignedInteger('reps_done')->nullable();
            $table->timestamp('completed_at')->useCurrent();
            $table->timestamps();
            $table->unique(['routine_id', 'client_id', 'exercise_id', 'set_number'], 'fit_workout_set_unique');
            $table->index(['routine_id', 'client_id', 'completed_at'], 'fit_workout_report_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('fit_workout_sets');
        Schema::dropIfExists('fit_routine_exercises');
        Schema::dropIfExists('fit_routines');
        Schema::dropIfExists('fit_measurements');
        Schema::dropIfExists('fit_clients');
    }
};
