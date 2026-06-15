<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['ingredient_id', 'type', 'quantity', 'reference_type', 'reference_id', 'note', 'created_by'])]
class StockMovement extends Model
{
    public $timestamps = false;
    const CREATED_AT = 'created_at';

    public function ingredient(): BelongsTo
    {
        return $this->belongsTo(Ingredient::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    protected function casts(): array
    {
        return [
            'quantity'   => 'decimal:2',
            'created_at' => 'datetime',
        ];
    }
}
