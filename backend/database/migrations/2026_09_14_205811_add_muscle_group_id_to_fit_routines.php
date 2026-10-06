<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('fit_routines', function (Blueprint $table): void {
            $table->foreignId('muscle_group_id')->nullable()->after('client_id')
                ->constrained('fit_muscle_groups')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('fit_routines', function (Blueprint $table): void {
            $table->dropConstrainedForeignId('muscle_group_id');
        });
    }
};
