<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['name', 'price'])]
class Addon extends Model
{
    use HasFactory;

    public const UPDATED_AT = null;

    public function products(): BelongsToMany
    {
        return $this->belongsToMany(Product::class, 'product_addons');
    }

    public function orderItemAddons(): HasMany
    {
        return $this->hasMany(OrderItemAddon::class);
    }
}
