<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SkillCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:191'],
            'label' => ['nullable', 'string', 'max:191'],
            'sort_order' => ['nullable', 'integer'],
        ];
    }
}
