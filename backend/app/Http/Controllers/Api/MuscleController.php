<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Concerns\AuthorizesFitAccess;
use App\Http\Controllers\Controller;
use App\Models\FitMuscle;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class MuscleController extends Controller
{
    use AuthorizesFitAccess;

    public function index(int $muscleGroup): JsonResponse
    {
        $this->trainerUser();

        $muscles = FitMuscle::query()
            ->where('muscle_group_id', $muscleGroup)
            ->orderBy('name')
            ->get();

        return response()->json(['data' => ['muscles' => $muscles]]);
    }

    public function update(Request $request, int $muscle): JsonResponse
    {
        $this->trainerUser();
        $model = FitMuscle::query()->find($muscle);
        abort_unless($model, 404);

        $validated = $request->validate([
            'description' => ['nullable', 'string', 'max:2000'],
            'image' => ['nullable', 'image', 'max:4096'],
            'remove_image' => ['sometimes', 'boolean'],
        ]);

        if ($request->hasFile('image')) {
            if ($model->image_path) {
                Storage::disk('public')->delete($model->image_path);
            }
            $model->image_path = $request->file('image')->store('muscles', 'public');
        } elseif ($request->boolean('remove_image') && $model->image_path) {
            Storage::disk('public')->delete($model->image_path);
            $model->image_path = null;
        }

        if (array_key_exists('description', $validated)) {
            $model->description = $validated['description'];
        }

        $model->save();

        return response()->json([
            'message' => 'Músculo actualizado.',
            'data' => ['muscle' => $model->fresh()],
        ]);
    }
}
