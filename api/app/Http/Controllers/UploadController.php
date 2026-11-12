<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class UploadController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'max:51200'],
        ]);

        $file = $request->file('file');

        $allowed = array_merge(
            ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml', 'image/avif'],
            ['video/mp4', 'video/webm', 'video/quicktime'],
        );

        if (! in_array($file->getMimeType(), $allowed, true)) {
            return response()->json([
                'success' => false,
                'message' => 'Only image and video files are allowed.',
            ], 422);
        }

        $dir = $file->getMimeType() === 'video/mp4' || str_starts_with($file->getMimeType(), 'video/')
            ? 'uploads/videos'
            : 'uploads/images';

        $name = Str::uuid()->toString().'.'.$file->getClientOriginalExtension();
        $path = $file->storeAs($dir, $name, 'public');

        return response()->json([
            'success' => true,
            'url' => Storage::disk('public')->url($path),
            'path' => $path,
        ], 201);
    }
}
