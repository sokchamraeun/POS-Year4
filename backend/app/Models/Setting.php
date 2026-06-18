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
