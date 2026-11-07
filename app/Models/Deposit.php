<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Deposit extends Model
{
    protected $fillable = ['user_id', 'category_id', 'category_name', 'weight_g', 'price', 'amount', 'status', 'note'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function isVerified(): bool
    {
        return $this->status === 'verified';
    }

    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    protected function casts(): array
    {
        return ['amount' => 'integer', 'weight_g' => 'integer', 'price' => 'integer'];
    }
}
