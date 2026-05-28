<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Laravel\Sanctum\HasApiTokens;

#[Fillable(['name', 'phone', 'password', 'points'])]
class Customer extends Model
{
    use HasApiTokens, HasFactory;

    public const CREATED_AT = 'created_at';

    public const UPDATED_AT = null;

    protected $hidden = [
        'password',
        'remember_token',
    ];

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }
}
