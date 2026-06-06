<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ShopItem extends Model
{
    protected $table = 'shop_items';
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'id',
        'name',
        'category',
        'cost',
        'style_value',
        'description',
        'unlocked_by_default',
    ];

    protected $casts = [
        'unlocked_by_default' => 'boolean',
    ];
}
