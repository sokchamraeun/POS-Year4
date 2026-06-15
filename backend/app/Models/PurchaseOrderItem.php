<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['purchase_order_id', 'ingredient_id', 'quantity', 'unit_cost', 'subtotal'])]
class PurchaseOrderItem extends Model
{
    public $timestamps = false;

    public function purchaseOrder(): BelongsTo
    {
        return $this->belongsTo(PurchaseOrder::class);
    }

    public function ingredient(): BelongsTo
    {
        return $this->belongsTo(Ingredient::class);
    }

    protected function casts(): array
    {
        return [
            'quantity'  => 'decimal:2',
            'unit_cost' => 'decimal:4',
            'subtotal'  => 'decimal:2',
        ];
    }
}
