<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Concerns\AuthorizesFitAccess;
use App\Http\Controllers\Controller;
use App\Models\FitClient;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PlatformController extends Controller
{
    use AuthorizesFitAccess;

    public function overview(): JsonResponse
    {
        $trainer = $this->trainerUser();
        $clientIds = FitClient::where('trainer_id', $trainer->id)->pluck('id');
        $week = now()->startOfWeek();
        return response()->json(['data' => [
            'plans' => DB::table('fit_training_plans')->where('trainer_id',$trainer->id)->count(),
            'scheduled_this_week' => DB::table('fit_training_days')->whereIn('plan_id', DB::table('fit_training_plans')->where('trainer_id',$trainer->id)->select('id'))->whereBetween('scheduled_for',[$week,$week->copy()->endOfWeek()])->count(),
            'checkins_pending' => max(0, $clientIds->count() - DB::table('fit_checkins')->whereIn('client_id',$clientIds)->whereDate('week_of',$week)->count()),
            'unread_messages' => DB::table('fit_messages')->where('trainer_id',$trainer->id)->whereNull('read_at')->where('sender_user_id','!=',$trainer->id)->count(),
            'recent_records' => DB::table('fit_personal_records')->whereIn('client_id',$clientIds)->orderByDesc('achieved_at')->limit(8)->get(),
            'alerts' => DB::table('fit_checkins')->whereIn('client_id',$clientIds)->where(function($q){$q->where('pain_level','>=',7)->orWhere('energy_level','<=',3)->orWhere('adherence_percent','<',60);})->orderByDesc('week_of')->limit(10)->get(),
        ]]);
    }

    public function exercises(Request $request): JsonResponse
    {
        $trainer = $this->trainerUser();
        $q = DB::table('fit_exercises')->where(fn($x)=>$x->whereNull('trainer_id')->orWhere('trainer_id',$trainer->id));
        if ($request->filled('search')) $q->where('name','like','%'.$request->string('search').'%');
        return response()->json(['data'=>['exercises'=>$q->orderBy('name')->get()]]);
    }

    public function storeExercise(Request $request): JsonResponse
    {
        $trainer = $this->trainerUser();
        $v=$request->validate(['name'=>'required|string|max:160','muscle_group'=>'nullable|string|max:100','equipment'=>'nullable|string|max:100','movement_pattern'=>'nullable|string|max:100','difficulty'=>'nullable|string|max:40','instructions'=>'nullable|string','video_url'=>'nullable|url','image_url'=>'nullable|url','is_unilateral'=>'boolean']);
        $id=DB::table('fit_exercises')->insertGetId([...$v,'trainer_id'=>$trainer->id,'slug'=>Str::slug($v['name']),'is_active'=>true,'created_at'=>now(),'updated_at'=>now()]);
        return response()->json(['data'=>['exercise'=>DB::table('fit_exercises')->find($id)]],201);
    }

    public function destroyExercise(int $exercise): JsonResponse
    {
        $trainer = $this->trainerUser();
        $deleted = DB::table('fit_exercises')
            ->where('id', $exercise)
            ->where('trainer_id', $trainer->id)
            ->delete();

        abort_unless($deleted > 0, 404);

        return response()->json(['message' => 'Ejercicio eliminado.']);
    }

    public function plans(Request $request): JsonResponse
    {
        $trainer=$this->trainerUser();
        if ($request->isMethod('post')) {
            $v=$request->validate(['client_id'=>'required|integer','name'=>'required|string|max:180','objective'=>'nullable|string','starts_at'=>'required|date','weeks'=>'required|integer|min:1|max:52']);
            $this->ownedClient((int)$v['client_id']); $start=now()->parse($v['starts_at']);
            $id=DB::table('fit_training_plans')->insertGetId([...$v,'trainer_id'=>$trainer->id,'ends_at'=>$start->copy()->addWeeks((int)$v['weeks'])->subDay()->toDateString(),'status'=>'ACTIVE','created_at'=>now(),'updated_at'=>now()]);
            return response()->json(['data'=>['plan'=>DB::table('fit_training_plans')->find($id)]],201);
        }
        $plans=DB::table('fit_training_plans as p')->join('fit_clients as c','c.id','=','p.client_id')->where('p.trainer_id',$trainer->id)->select('p.*','c.name as client_name')->orderByDesc('p.created_at')->get();
        return response()->json(['data'=>['plans'=>$plans]]);
    }

    public function scheduleDay(Request $request, int $plan): JsonResponse
    {
        $trainer=$this->trainerUser();
        abort_unless(DB::table('fit_training_plans')->where('id',$plan)->where('trainer_id',$trainer->id)->exists(),404);
        $v=$request->validate(['routine_id'=>'nullable|integer|exists:fit_routines,id','week_number'=>'required|integer|min:1|max:52','weekday'=>'required|integer|min:1|max:7','scheduled_for'=>'nullable|date','title'=>'nullable|string|max:180','is_deload'=>'boolean']);
        $id=DB::table('fit_training_days')->insertGetId([...$v,'plan_id'=>$plan,'status'=>'SCHEDULED','created_at'=>now(),'updated_at'=>now()]);
        return response()->json(['data'=>['day'=>DB::table('fit_training_days')->find($id)]],201);
    }

    public function checkins(Request $request): JsonResponse
    {
        $trainer=$this->trainerUser();
        if ($request->isMethod('post')) {
            $v=$request->validate(['client_id'=>'required|integer','week_of'=>'required|date','weight_kg'=>'nullable|numeric','sleep_quality'=>'nullable|integer|min:1|max:10','energy_level'=>'nullable|integer|min:1|max:10','stress_level'=>'nullable|integer|min:1|max:10','hunger_level'=>'nullable|integer|min:1|max:10','soreness_level'=>'nullable|integer|min:1|max:10','pain_level'=>'nullable|integer|min:0|max:10','adherence_percent'=>'nullable|integer|min:0|max:100','comments'=>'nullable|string']);
            $this->ownedClient((int)$v['client_id']);
            DB::table('fit_checkins')->updateOrInsert(['client_id'=>$v['client_id'],'week_of'=>$v['week_of']],[...$v,'trainer_id'=>$trainer->id,'created_at'=>now(),'updated_at'=>now()]);
        }
        $rows=DB::table('fit_checkins as x')->join('fit_clients as c','c.id','=','x.client_id')->where('x.trainer_id',$trainer->id)->select('x.*','c.name as client_name')->orderByDesc('week_of')->limit(100)->get();
        return response()->json(['data'=>['checkins'=>$rows]]);
    }

    public function messages(Request $request, int $client): JsonResponse
    {
        $trainer=$this->trainerUser(); $owned=$this->ownedClient($client);
        if ($request->isMethod('post')) { $v=$request->validate(['message'=>'required|string|max:5000']); DB::table('fit_messages')->insert(['trainer_id'=>$trainer->id,'client_id'=>$owned->id,'sender_user_id'=>auth('api')->id(),'message'=>$v['message'],'created_at'=>now(),'updated_at'=>now()]); }
        $rows=DB::table('fit_messages')->where('client_id',$owned->id)->orderBy('created_at')->limit(200)->get();
        return response()->json(['data'=>['messages'=>$rows]]);
    }

    public function achievements(): JsonResponse
    {
        $trainer=$this->trainerUser(); $clientIds=FitClient::where('trainer_id',$trainer->id)->pluck('id');
        $rows=DB::table('fit_client_achievements as ca')->join('fit_achievements as a','a.id','=','ca.achievement_id')->join('fit_clients as c','c.id','=','ca.client_id')->whereIn('ca.client_id',$clientIds)->select('ca.*','a.code','a.name','a.description','a.icon','c.name as client_name')->orderByDesc('earned_at')->get();
        return response()->json(['data'=>['achievements'=>$rows]]);
    }
}
