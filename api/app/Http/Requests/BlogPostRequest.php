<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class BlogPostRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'alpha_dash'],
            'excerpt' => ['nullable', 'string'],
            'content' => ['nullable', 'string'],
            'cover_image' => ['nullable', 'string', 'max:2048'],
            'status' => ['nullable', 'in:draft,published'],
            'published_at' => ['nullable', 'date'],
            'sort_order' => ['nullable', 'integer'],
        ];
    }
}
