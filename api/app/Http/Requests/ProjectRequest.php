<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ProjectRequest extends FormRequest
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
            'description' => ['nullable', 'string'],
            'category' => ['nullable', 'string', 'max:64'],
            'tech' => ['nullable', 'string', 'max:512'],
            'image_url' => ['nullable', 'string', 'max:2048'],
            'link' => ['nullable', 'string', 'max:2048'],
            'github_url' => ['nullable', 'string', 'max:2048'],
            'demo_url' => ['nullable', 'string', 'max:2048'],
            'client' => ['nullable', 'string', 'max:191'],
            'month' => ['nullable', 'string', 'max:32'],
            'year' => ['nullable', 'string', 'max:8'],
            'services' => ['nullable', 'string', 'max:512'],
            'review' => ['nullable', 'string'],
            'logo_full_view_url' => ['nullable', 'string', 'max:2048'],
            'desktop_view_url' => ['nullable', 'string', 'max:2048'],
            'phone_view_url' => ['nullable', 'string', 'max:2048'],
            'mobile_image_url' => ['nullable', 'string', 'max:2048'],
            'gallery' => ['nullable'],
            'project_date' => ['nullable', 'date'],
            'featured' => ['nullable', 'boolean'],
            'visible' => ['nullable', 'boolean'],
            'sort_order' => ['nullable', 'integer'],
            'images' => ['nullable', 'array', 'max:30'],
        ];
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('sort_order') && is_string($this->input('sort_order'))) {
            $this->merge(['sort_order' => (int) $this->input('sort_order')]);
        }
    }
}
