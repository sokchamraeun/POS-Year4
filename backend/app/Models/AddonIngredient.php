<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['addon_id', 'ingredient_id', 'quantity'])]
class AddonIngredient extends Model
{
    use HasFactory;

    public function addon(): BelongsTo
    {
        return $this->belongsTo(Addon::class);
    }

    public function ingredient(): BelongsTo
    {
        return $this->belongsTo(Ingredient::class);
    }
}
