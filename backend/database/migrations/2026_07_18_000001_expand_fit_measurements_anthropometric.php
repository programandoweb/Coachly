<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('fit_measurements', function (Blueprint $table): void {
            $table->decimal('neck_cm', 8, 2)->nullable()->after('height_cm');
            $table->decimal('shoulders_cm', 8, 2)->nullable()->after('neck_cm');
            $table->decimal('left_arm_cm', 8, 2)->nullable()->after('chest_cm');
            $table->decimal('right_arm_cm', 8, 2)->nullable()->after('left_arm_cm');
            $table->decimal('left_forearm_cm', 8, 2)->nullable()->after('right_arm_cm');
            $table->decimal('right_forearm_cm', 8, 2)->nullable()->after('left_forearm_cm');
            $table->decimal('left_thigh_cm', 8, 2)->nullable()->after('hip_cm');
            $table->decimal('right_thigh_cm', 8, 2)->nullable()->after('left_thigh_cm');
            $table->decimal('left_calf_cm', 8, 2)->nullable()->after('right_thigh_cm');
            $table->decimal('right_calf_cm', 8, 2)->nullable()->after('left_calf_cm');
        });
    }

    public function down(): void
    {
        Schema::table('fit_measurements', function (Blueprint $table): void {
            $table->dropColumn([
                'neck_cm',
                'shoulders_cm',
                'left_arm_cm',
                'right_arm_cm',
                'left_forearm_cm',
                'right_forearm_cm',
                'left_thigh_cm',
                'right_thigh_cm',
                'left_calf_cm',
                'right_calf_cm',
            ]);
        });
    }
};
