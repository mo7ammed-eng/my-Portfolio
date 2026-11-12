<?php

namespace App\Http\Controllers;

use App\Http\Requests\BlogPostRequest;
use App\Http\Resources\BlogPostResource;
use App\Models\BlogPost;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Str;

class BlogPostController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = BlogPost::orderByDesc('published_at')->orderByDesc('created_at');

        if (! $request->boolean('all')) {
            $query->where('status', 'published');
        }

        return BlogPostResource::collection($query->get());
    }

    public function store(BlogPostRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['slug'] = $data['slug'] ?? Str::slug($data['title']);

        $post = BlogPost::create($data);

        return (new BlogPostResource($post))->response()->setStatusCode(201);
    }

    public function show(Request $request, string $idOrSlug): BlogPostResource
    {
        $post = BlogPost::where('id', $idOrSlug)->orWhere('slug', $idOrSlug)->firstOrFail();

        if (! $request->boolean('all') && $post->status !== 'published') {
            abort(404);
        }

        return new BlogPostResource($post);
    }

    public function update(BlogPostRequest $request, BlogPost $blogPost): BlogPostResource
    {
        $data = $request->validated();
        if (empty($data['slug']) || $data['slug'] === $blogPost->slug) {
            unset($data['slug']);
        }

        $blogPost->update($data);

        return new BlogPostResource($blogPost);
    }

    public function destroy(BlogPost $blogPost): JsonResponse
    {
        $blogPost->delete();

        return response()->json(['success' => true]);
    }
}
