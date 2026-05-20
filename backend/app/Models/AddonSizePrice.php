<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AddonSizePrice extends Model
{
    protected $table = 'product_addon_size_prices';

    public $timestamps = false;

    protected $fillable = ['product_id', 'addon_id', 'size_id', 'price'];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function addon(): BelongsTo
    {
        return $this->belongsTo(Addon::class);
    }

    public function size(): BelongsTo
    {
        return $this->belongsTo(Size::class);
    }
}
