<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    protected $fillable = [
        'public_id',
        'status',
        'customer_name',
        'email',
        'address',
        'city',
        'phone',
        'total',
    ];

    protected function casts(): array
    {
        return [
            'total' => 'float',
        ];
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function toStoreArray(): array
    {
        return [
            'id' => $this->public_id,
            'status' => $this->status,
            'customerName' => $this->customer_name,
            'total' => $this->total,
            'createdAt' => $this->created_at?->toISOString(),
        ];
    }
}
