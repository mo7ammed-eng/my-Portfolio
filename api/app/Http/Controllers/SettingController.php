<?php

namespace App\Http\Controllers;

use App\Models\SeoSetting;
use App\Models\SiteSetting;
use App\Models\ThemeSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class SettingController extends Controller
{
    private const MODELS = [
        'site' => SiteSetting::class,
        'seo' => SeoSetting::class,
        'theme' => ThemeSetting::class,
    ];

    public function index(Request $request, string $scope = 'site'): JsonResponse
    {
        $model = $this->modelFor($scope);

        if ($request->query('key')) {
            $row = $model::where('key', $request->query('key'))->first();

            return response()->json($row ?? ['key' => $request->query('key'), 'value' => null]);
        }

        return response()->json($model::all(['key', 'value']));
    }

    public function show(string $scope, string $key): JsonResponse
    {
        $model = $this->modelFor($scope);
        $row = $model::where('key', $key)->first();

        return response()->json($row ?? ['key' => $key, 'value' => null]);
    }

    public function upsert(Request $request, string $scope): JsonResponse
    {
        $model = $this->modelFor($scope);

        $validated = Validator::make($request->all(), [
            'key' => ['required', 'string', 'max:191'],
            'value' => ['present'],
        ])->validate();

        $row = $model::updateOrCreate(
            ['key' => $validated['key']],
            ['value' => $validated['value']],
        );

        return response()->json(['key' => $row->key, 'value' => $row->value]);
    }

    public function bulkUpsert(Request $request, string $scope): JsonResponse
    {
        $model = $this->modelFor($scope);

        $validated = Validator::make($request->all(), [
            'settings' => ['required', 'array'],
            'settings.*.key' => ['required', 'string', 'max:191'],
            'settings.*.value' => ['present'],
        ])->validate();

        foreach ($validated['settings'] as $setting) {
            $model::updateOrCreate(
                ['key' => $setting['key']],
                ['value' => $setting['value']],
            );
        }

        return response()->json(['success' => true]);
    }

    private function modelFor(string $scope): string
    {
        if (! isset(self::MODELS[$scope])) {
            abort(404, 'Unknown settings scope.');
        }

        return self::MODELS[$scope];
    }
}
