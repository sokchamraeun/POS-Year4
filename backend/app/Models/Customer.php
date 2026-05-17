<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['name', 'phone', 'points'])]
class Customer extends Model
{
    use HasFactory;

    public const CREATED_AT = 'created_at';
    public const UPDATED_AT = null;

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }
}
