<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'category',
        'price',
        'compare_at_price',
        'image',
        'description',
        'rating',
        'reviews',
        'badge',
        'featured',
        'colors',
        'sizes',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'float',
            'compare_at_price' => 'float',
            'rating' => 'float',
            'reviews' => 'integer',
            'featured' => 'boolean',
            'colors' => 'array',
            'sizes' => 'array',
        ];
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function toStoreArray(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'category' => $this->category,
            'price' => $this->price,
            'compareAtPrice' => $this->compare_at_price,
            'image' => $this->image,
            'description' => $this->description,
            'rating' => $this->rating,
            'reviews' => $this->reviews,
            'badge' => $this->badge,
            'featured' => $this->featured,
            'colors' => $this->colors ?? [],
            'sizes' => $this->sizes ?? [],
        ];
    }
}
