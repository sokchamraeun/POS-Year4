<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['order_id', 'product_id', 'size_id', 'sugar_level_id', 'sugar_note', 'ice_level_id', 'ice_note', 'qty', 'unit_price', 'subtotal', 'promotion_snapshot'])]
class OrderItem extends Model
{
    use HasFactory;

    // Track only created_at (when the item was added); there is no updated_at column.
    public $timestamps = true;

    const UPDATED_AT = null;

    protected function casts(): array
    {
        return [
            'promotion_snapshot' => 'array',
            'created_at' => 'datetime',
        ];
    }

    protected $appends = ['promotion'];

    public function getPromotionAttribute(): ?array
    {
        return $this->promotion_snapshot;
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function size(): BelongsTo
    {
        return $this->belongsTo(Size::class);
    }

    public function sugarLevel(): BelongsTo
    {
        return $this->belongsTo(SugarLevel::class);
    }

    public function iceLevel(): BelongsTo
    {
        return $this->belongsTo(IceLevel::class);
    }

    public function addons(): HasMany
    {
        return $this->hasMany(OrderItemAddon::class);
    }
}
