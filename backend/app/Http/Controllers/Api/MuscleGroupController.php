<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Concerns\AuthorizesFitAccess;
use App\Http\Controllers\Controller;
use App\Models\FitMuscleGroup;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class MuscleGroupController extends Controller
{
    use AuthorizesFitAccess;

    public function index(): JsonResponse
    {
        $this->trainerUser();

        $muscleGroups = FitMuscleGroup::query()
            ->withCount('muscles')
            ->orderBy('name')
            ->get();

        return response()->json(['data' => ['muscle_groups' => $muscleGroups]]);
    }

    public function show(int $muscleGroup): JsonResponse
    {
        $this->trainerUser();
        $model = FitMuscleGroup::query()->withCount('muscles')->find($muscleGroup);

        abort_unless($model, 404);

        return response()->json(['data' => ['muscle_group' => $model]]);
    }

    public function update(Request $request, int $muscleGroup): JsonResponse
    {
        $this->trainerUser();
        $model = FitMuscleGroup::query()->find($muscleGroup);
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
            $model->image_path = $request->file('image')->store('muscle-groups', 'public');
        } elseif ($request->boolean('remove_image') && $model->image_path) {
            Storage::disk('public')->delete($model->image_path);
            $model->image_path = null;
        }

        if (array_key_exists('description', $validated)) {
            $model->description = $validated['description'];
        }

        $model->save();

        return response()->json([
            'message' => 'Grupo muscular actualizado.',
            'data' => ['muscle_group' => $model->fresh()],
        ]);
    }
}
