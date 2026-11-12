<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class HeroSectionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'label' => ['required', 'string', 'max:191'],
            'ghost_line' => ['required', 'string', 'max:191'],
            'name_line' => ['required', 'string', 'max:191'],
            'paragraph1' => ['nullable', 'string'],
            'paragraph2' => ['nullable', 'string'],
            'paragraph3' => ['nullable', 'string'],
            'cta_text' => ['nullable', 'string', 'max:191'],
            'visible' => ['nullable', 'boolean'],
            'sort_order' => ['nullable', 'integer'],
        ];
    }
}
