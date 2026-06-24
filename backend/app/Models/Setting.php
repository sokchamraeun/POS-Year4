<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    use HasFactory;

    protected $fillable = [
        'site_name',
        'tagline',
        'logo',
        'footer_location',
        'footer_phone',
        'footer_email',
        'hours_weekday',
        'hours_saturday',
        'hours_sunday',
        'receipt_shop_name',
        'receipt_location',
        'receipt_phone',
        'receipt_wifi_name',
        'receipt_wifi_password',
        'receipt_exchange_rate',
    ];

    /**
     * Get the single settings row, creating it with defaults if missing.
     */
    public static function current(): self
    {
        return static::firstOrCreate([], [
            'site_name' => 'The Bird Nest',
        ]);
    }
}
