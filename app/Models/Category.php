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
}
