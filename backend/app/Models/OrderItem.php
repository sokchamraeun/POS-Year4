<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['order_id', 'product_id', 'size_id', 'sugar_level_id', 'ice_level_id', 'qty', 'unit_price', 'subtotal'])]
class OrderItem extends Model
{
    use HasFactory;

    public $timestamps = false;

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
