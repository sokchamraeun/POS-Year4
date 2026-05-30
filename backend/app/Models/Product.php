<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['category_id', 'name', 'image', 'description', 'status'])]
class Product extends Model
{
    use HasFactory;

    protected $appends = ['promotion'];

    protected $hidden = ['promotions'];

    protected function casts(): array
    {
        return [
            'status' => 'boolean',
        ];
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function sugarLevels(): BelongsToMany
    {
        return $this->belongsToMany(SugarLevel::class, 'product_sugar_levels');
    }

    public function iceLevels(): BelongsToMany
    {
        return $this->belongsToMany(IceLevel::class, 'product_ice_levels');
    }

    public function sizes(): BelongsToMany
    {
        return $this->belongsToMany(Size::class, 'product_sizes')
            ->withPivot('price');
    }

    public function addons(): BelongsToMany
    {
        return $this->belongsToMany(Addon::class, 'product_addons');
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function ingredients(): BelongsToMany
    {
        return $this->belongsToMany(Ingredient::class, 'recipes')->withPivot(['id', 'size_id', 'quantity']);
    }

    public function promotions(): BelongsToMany
    {
        return $this->belongsToMany(Promotion::class, 'promotion_product');
    }

    public function getPromotionAttribute(): ?array
    {
        $now = now();
        $active = $this->promotions
            ->filter(fn ($p) => $p->active && $p->start_date <= $now && $p->end_date >= $now)
            ->first();

        return $active?->only(['id', 'name', 'type', 'value', 'buy_qty', 'free_qty']);
    }
}
