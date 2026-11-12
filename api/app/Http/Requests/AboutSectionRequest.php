<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AboutSectionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'label' => ['required', 'string', 'max:191'],
            'heading_line1' => ['required', 'string', 'max:191'],
            'heading_line2' => ['required', 'string', 'max:191'],
            'heading_line3' => ['required', 'string', 'max:191'],
            'bio' => ['nullable', 'array'],
            'bio.*' => ['string'],
            'resume_url' => ['nullable', 'string', 'max:2048'],
            'image_url' => ['nullable', 'string', 'max:2048'],
            'visible' => ['nullable', 'boolean'],
        ];
    }
}
