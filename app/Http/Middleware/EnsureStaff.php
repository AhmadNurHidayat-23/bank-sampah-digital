<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class EnsureStaff
{
    public function handle(Request $r, Closure $next)
    {
        abort_unless($r->user()?->role === 'staff', 403);

        return $next($r);
    }
}
