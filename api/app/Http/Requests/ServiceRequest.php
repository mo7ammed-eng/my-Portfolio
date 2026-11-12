<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ServiceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'num' => ['required', 'string', 'max:8'],
            'label' => ['required', 'string', 'max:191'],
            'title' => ['required', 'string', 'max:191'],
            'description' => ['nullable', 'string'],
            'icon' => ['nullable', 'string', 'max:64'],
            'href' => ['nullable', 'string', 'max:2048'],
            'sort_order' => ['nullable', 'integer'],
            'visible' => ['nullable', 'boolean'],
        ];
    }
}
