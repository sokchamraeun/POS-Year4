<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Table extends Model
{
    use HasFactory;

    const STATUS_AVAILABLE = 'available';

    const STATUS_OCCUPIED = 'occupied';

    const STATUS_RESERVED = 'reserved';

    const STATUS_CLEANING = 'cleaning';

    protected $fillable = ['name', 'capacity', 'status', 'qr_code', 'qr_token'];

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function currentOrder(): ?Order
    {
        return $this->orders()
            ->whereIn('payment_status', [null, 'unpaid', 'pending'])
            ->latest('id')
            ->first();
    }

    protected static function boot(): void
    {
        parent::boot();

        static::creating(function (Table $table) {
            if (! $table->qr_token) {
                $table->qr_token = Str::random(32);
            }
        });
    }
}
