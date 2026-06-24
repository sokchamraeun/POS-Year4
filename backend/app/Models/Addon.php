<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['name', 'image', 'price'])]
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

    public function addonIngredients(): HasMany
    {
        return $this->hasMany(AddonIngredient::class);
    }

    public function ingredients(): BelongsToMany
    {
        return $this->belongsToMany(Ingredient::class, 'addon_ingredients')
            ->withPivot(['id', 'quantity']);
    }

    public function sizePrices(): HasMany
    {
        return $this->hasMany(AddonSizePrice::class, 'addon_id');
    }
}
