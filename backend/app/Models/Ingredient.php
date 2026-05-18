<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

#[Fillable(['name', 'unit', 'stock_quantity', 'reorder_level'])]
class Ingredient extends Model
{
    use HasFactory;

    public const UPDATED_AT = null;

    public function recipes(): HasMany
    {
        return $this->hasMany(Recipe::class);
    }

    public function products(): BelongsToMany
    {
        return $this->belongsToMany(Product::class, 'recipes')->withPivot('quantity');
    }

    public function inventoryTransactions(): HasMany
    {
        return $this->hasMany(InventoryTransaction::class);
    }
}
