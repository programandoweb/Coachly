<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('fit_workout_sessions', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('routine_id')->constrained('fit_routines')->cascadeOnDelete();
            $table->foreignId('client_id')->nullable()->constrained('fit_clients')->nullOnDelete();
            $table->foreignId('trainer_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('started_by')->constrained('users')->cascadeOnDelete();
            $table->timestamp('started_at');
            $table->timestamp('ended_at')->nullable();
            $table->unsignedInteger('duration_seconds')->nullable();
            $table->timestamps();
            $table->index(['routine_id', 'ended_at', 'started_at'], 'fit_workout_sessions_status_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('fit_workout_sessions');
    }
};
