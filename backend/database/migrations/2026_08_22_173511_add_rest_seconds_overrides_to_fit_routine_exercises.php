<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('fit_routine_exercises', function (Blueprint $table) {
            $table->json('rest_seconds_overrides')->nullable()->after('rest_seconds');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('fit_routine_exercises', function (Blueprint $table) {
            $table->dropColumn('rest_seconds_overrides');
        });
    }
};
