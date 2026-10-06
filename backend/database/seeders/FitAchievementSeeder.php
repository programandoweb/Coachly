<?php
namespace Database\Seeders;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
class FitAchievementSeeder extends Seeder {
 public function run(): void { foreach ([
 ['FIRST_WORKOUT','Primer entrenamiento','Completó su primera sesión','🏁',1],['TEN_WORKOUTS','10 entrenamientos','Completó diez sesiones','🔥',10],['WEEK_STREAK','Racha semanal','Entrenó durante siete días de planificación','⚡',7],['FIRST_PR','Primer récord','Consiguió su primer récord personal','🏆',1],['MONTH_COMPLETE','Mes consistente','Completó un mes de seguimiento','📅',30]
 ] as [$code,$name,$description,$icon,$threshold]) DB::table('fit_achievements')->updateOrInsert(['code'=>$code],compact('name','description','icon','threshold')+['is_active'=>true,'created_at'=>now(),'updated_at'=>now()]); }
}
