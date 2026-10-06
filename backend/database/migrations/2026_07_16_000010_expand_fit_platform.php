<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('fit_exercises', function (Blueprint $table): void {
            $table->id(); $table->foreignId('trainer_id')->nullable()->constrained('users')->cascadeOnDelete();
            $table->string('name'); $table->string('slug'); $table->string('muscle_group')->nullable();
            $table->string('equipment')->nullable(); $table->string('movement_pattern')->nullable();
            $table->string('difficulty', 40)->nullable(); $table->text('instructions')->nullable();
            $table->string('video_url')->nullable(); $table->string('image_url')->nullable();
            $table->boolean('is_unilateral')->default(false); $table->boolean('is_active')->default(true); $table->timestamps();
            $table->unique(['trainer_id', 'slug']); $table->index(['muscle_group', 'equipment']);
        });

        Schema::table('fit_routine_exercises', function (Blueprint $table): void {
            $table->foreignId('exercise_id')->nullable()->after('routine_id')->constrained('fit_exercises')->nullOnDelete();
            $table->string('progression_type', 40)->nullable(); $table->decimal('weight_increment', 8, 2)->nullable();
            $table->unsignedSmallInteger('minimum_reps')->nullable(); $table->unsignedSmallInteger('maximum_reps')->nullable();
            $table->decimal('target_rir', 4, 1)->nullable(); $table->decimal('target_rpe', 4, 1)->nullable();
        });

        Schema::create('fit_training_plans', function (Blueprint $table): void {
            $table->id(); $table->foreignId('trainer_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('client_id')->constrained('fit_clients')->cascadeOnDelete();
            $table->string('name'); $table->text('objective')->nullable(); $table->date('starts_at'); $table->date('ends_at')->nullable();
            $table->string('status', 30)->default('ACTIVE'); $table->unsignedSmallInteger('weeks')->default(4); $table->timestamps();
        });
        Schema::create('fit_training_days', function (Blueprint $table): void {
            $table->id(); $table->foreignId('plan_id')->constrained('fit_training_plans')->cascadeOnDelete();
            $table->foreignId('routine_id')->nullable()->constrained('fit_routines')->nullOnDelete();
            $table->unsignedSmallInteger('week_number'); $table->unsignedTinyInteger('weekday'); $table->date('scheduled_for')->nullable();
            $table->string('title')->nullable(); $table->boolean('is_deload')->default(false); $table->string('status', 30)->default('SCHEDULED'); $table->timestamps();
            $table->index(['plan_id', 'week_number', 'weekday']);
        });

        Schema::create('fit_checkins', function (Blueprint $table): void {
            $table->id(); $table->foreignId('client_id')->constrained('fit_clients')->cascadeOnDelete();
            $table->foreignId('trainer_id')->constrained('users')->cascadeOnDelete(); $table->date('week_of');
            $table->decimal('weight_kg', 8, 2)->nullable(); $table->unsignedTinyInteger('sleep_quality')->nullable();
            $table->unsignedTinyInteger('energy_level')->nullable(); $table->unsignedTinyInteger('stress_level')->nullable();
            $table->unsignedTinyInteger('hunger_level')->nullable(); $table->unsignedTinyInteger('soreness_level')->nullable();
            $table->unsignedTinyInteger('pain_level')->nullable(); $table->unsignedTinyInteger('adherence_percent')->nullable();
            $table->text('comments')->nullable(); $table->text('trainer_feedback')->nullable(); $table->timestamps();
            $table->unique(['client_id', 'week_of']);
        });

        Schema::create('fit_personal_records', function (Blueprint $table): void {
            $table->id(); $table->foreignId('client_id')->constrained('fit_clients')->cascadeOnDelete();
            $table->foreignId('exercise_id')->nullable()->constrained('fit_exercises')->nullOnDelete();
            $table->string('exercise_name'); $table->string('record_type', 30)->default('ESTIMATED_1RM');
            $table->decimal('value', 10, 2); $table->string('unit', 20)->default('kg'); $table->dateTime('achieved_at'); $table->timestamps();
        });
        Schema::create('fit_achievements', function (Blueprint $table): void {
            $table->id(); $table->string('code')->unique(); $table->string('name'); $table->text('description')->nullable();
            $table->string('icon')->nullable(); $table->unsignedInteger('threshold')->nullable(); $table->boolean('is_active')->default(true); $table->timestamps();
        });
        Schema::create('fit_client_achievements', function (Blueprint $table): void {
            $table->id(); $table->foreignId('client_id')->constrained('fit_clients')->cascadeOnDelete();
            $table->foreignId('achievement_id')->constrained('fit_achievements')->cascadeOnDelete();
            $table->dateTime('earned_at'); $table->json('meta')->nullable(); $table->timestamps(); $table->unique(['client_id','achievement_id']);
        });

        Schema::create('fit_messages', function (Blueprint $table): void {
            $table->id(); $table->foreignId('trainer_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('client_id')->constrained('fit_clients')->cascadeOnDelete();
            $table->foreignId('sender_user_id')->constrained('users')->cascadeOnDelete(); $table->text('message');
            $table->dateTime('read_at')->nullable(); $table->timestamps(); $table->index(['client_id','created_at']);
        });
        Schema::create('fit_notifications', function (Blueprint $table): void {
            $table->id(); $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('type', 60); $table->string('title'); $table->text('body')->nullable(); $table->json('data')->nullable();
            $table->dateTime('read_at')->nullable(); $table->timestamps();
        });

        Schema::create('fit_progress_photos', function (Blueprint $table): void {
            $table->id(); $table->foreignId('client_id')->constrained('fit_clients')->cascadeOnDelete();
            $table->string('disk')->default('local'); $table->string('path'); $table->string('pose', 30)->nullable();
            $table->date('taken_at'); $table->text('notes')->nullable(); $table->boolean('is_public')->default(false); $table->timestamps();
        });
        Schema::create('fit_exercise_alternatives', function (Blueprint $table): void {
            $table->id(); $table->foreignId('exercise_id')->constrained('fit_exercises')->cascadeOnDelete();
            $table->foreignId('alternative_exercise_id')->constrained('fit_exercises')->cascadeOnDelete(); $table->string('reason')->nullable();
            $table->timestamps(); $table->unique(['exercise_id', 'alternative_exercise_id'], 'fit_exercise_alt_unique');
        });

        Schema::table('fit_workout_session_results', function (Blueprint $table): void {
            $table->decimal('rir', 4, 1)->nullable(); $table->decimal('rpe', 4, 1)->nullable();
            $table->unsignedTinyInteger('pain_level')->nullable(); $table->boolean('to_failure')->default(false); $table->text('notes')->nullable();
        });
        Schema::table('fit_workout_sessions', function (Blueprint $table): void {
            $table->string('status', 30)->default('ACTIVE'); $table->unsignedTinyInteger('energy_level')->nullable();
            $table->unsignedTinyInteger('difficulty')->nullable(); $table->unsignedTinyInteger('sleep_quality')->nullable();
            $table->unsignedTinyInteger('mood')->nullable(); $table->unsignedTinyInteger('soreness')->nullable(); $table->text('session_notes')->nullable();
            $table->date('scheduled_for')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('fit_workout_sessions', fn (Blueprint $t) => $t->dropColumn(['status','energy_level','difficulty','sleep_quality','mood','soreness','session_notes','scheduled_for']));
        Schema::table('fit_workout_session_results', fn (Blueprint $t) => $t->dropColumn(['rir','rpe','pain_level','to_failure','notes']));
        Schema::dropIfExists('fit_exercise_alternatives'); Schema::dropIfExists('fit_progress_photos'); Schema::dropIfExists('fit_notifications');
        Schema::dropIfExists('fit_messages'); Schema::dropIfExists('fit_client_achievements'); Schema::dropIfExists('fit_achievements');
        Schema::dropIfExists('fit_personal_records'); Schema::dropIfExists('fit_checkins'); Schema::dropIfExists('fit_training_days'); Schema::dropIfExists('fit_training_plans');
        Schema::table('fit_routine_exercises', fn (Blueprint $t) => $t->dropConstrainedForeignId('exercise_id'));
        Schema::table('fit_routine_exercises', fn (Blueprint $t) => $t->dropColumn(['progression_type','weight_increment','minimum_reps','maximum_reps','target_rir','target_rpe']));
        Schema::dropIfExists('fit_exercises');
    }
};
