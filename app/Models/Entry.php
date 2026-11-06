<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Entry extends Model
{
    protected $fillable = ['user_id', 'source', 'kind', 'amount', 'balance_after', 'description'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    protected function casts(): array
    {
        return ['amount' => 'integer', 'balance_after' => 'integer'];
    }
}
