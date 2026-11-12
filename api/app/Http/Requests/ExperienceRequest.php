<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ExperienceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'role' => ['required', 'string', 'max:191'],
            'company' => ['nullable', 'string', 'max:191'],
            'location' => ['nullable', 'string', 'max:191'],
            'description' => ['nullable', 'string'],
            'start_date' => ['nullable', 'string', 'max:32'],
            'end_date' => ['nullable', 'string', 'max:32'],
            'is_current' => ['nullable', 'boolean'],
            'sort_order' => ['nullable', 'integer'],
            'visible' => ['nullable', 'boolean'],
        ];
    }
}
