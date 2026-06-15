<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['user_id', 'full_name', 'phone', 'position', 'salary', 'hire_date', 'status'])]
class Employee extends Model
{
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    protected function casts(): array
    {
        return [
            'salary'    => 'decimal:2',
            'hire_date' => 'date',
            'status'    => 'boolean',
        ];
    }
}
