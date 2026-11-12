<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SkillRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'skill_category_id' => ['required', 'integer', 'exists:skill_categories,id'],
            'name' => ['required', 'string', 'max:191'],
            'icon' => ['nullable', 'string', 'max:191'],
            'sort_order' => ['nullable', 'integer'],
            'visible' => ['nullable', 'boolean'],
        ];
    }
}
