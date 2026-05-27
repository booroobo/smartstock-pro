<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'product_category_id',
        'sku',
        'name',
        'description',
        'current_stock',
        'minimum_stock',
        'unit',
        'image',
    ];

    protected $appends = ['image_url'];

    public function getImageUrlAttribute()
    {
        if (!$this->image) {
            return null;
        }

        $baseUrl = request()?->getSchemeAndHttpHost() ?: config('app.url');

        return rtrim($baseUrl, '/') . '/storage/' . ltrim($this->image, '/');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function category()
    {
        return $this->belongsTo(ProductCategory::class, 'product_category_id');
    }

    public function stockTransactions()
    {
        return $this->hasMany(StockTransaction::class);
    }
}
