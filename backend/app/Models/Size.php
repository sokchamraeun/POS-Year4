<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

#[Fillable(['name'])]
class Size extends Model
{
    use HasFactory;

    public $timestamps = false;

    public function products(): BelongsToMany
    {
        return $this->belongsToMany(Product::class, 'product_sizes')
            ->withPivot('price');
    }
}
