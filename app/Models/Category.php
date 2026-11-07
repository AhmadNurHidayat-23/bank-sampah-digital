<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    protected $fillable = ['name', 'description', 'price', 'active'];

    protected function casts(): array
    {
        return ['active' => 'boolean', 'price' => 'integer'];
    }

    public function deposits()
    {
        return $this->hasMany(Deposit::class);
    }

    public function scopeActive($query)
    {
        return $query->where('active', true);
    }
}
