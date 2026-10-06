<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('fit_workout_session_results', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('workout_session_id')->constrained('fit_workout_sessions')->cascadeOnDelete();
            $table->foreignId('routine_id')->constrained('fit_routines')->cascadeOnDelete();
            $table->foreignId('client_id')->constrained('fit_clients')->cascadeOnDelete();
            $table->foreignId('exercise_id')->nullable()->constrained('fit_routine_exercises')->nullOnDelete();
            $table->string('exercise_key', 191);
            $table->string('exercise_name');
            $table->unsignedInteger('set_number');
            $table->decimal('weight_kg', 8, 2)->nullable();
            $table->unsignedInteger('reps_done')->nullable();
            $table->decimal('volume_score', 12, 2)->default(0);
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
            $table->unique(['workout_session_id', 'exercise_id', 'set_number'], 'fit_session_result_unique');
            $table->index(['client_id', 'exercise_key']);
        });

        Schema::create('fit_client_exercise_scores', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('client_id')->constrained('fit_clients')->cascadeOnDelete();
            $table->string('exercise_key', 191);
            $table->string('exercise_name');
            $table->foreignId('last_workout_session_id')->nullable()->constrained('fit_workout_sessions')->nullOnDelete();
            $table->decimal('total_volume', 12, 2)->default(0);
            $table->decimal('best_weight_kg', 8, 2)->nullable();
            $table->unsignedInteger('best_reps')->nullable();
            $table->decimal('estimated_one_rep_max', 10, 2)->nullable();
            $table->unsignedInteger('completed_sets')->default(0);
            $table->json('last_sets')->nullable();
            $table->timestamp('performed_at')->nullable();
            $table->timestamps();
            $table->unique(['client_id', 'exercise_key']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('fit_client_exercise_scores');
        Schema::dropIfExists('fit_workout_session_results');
    }
};
