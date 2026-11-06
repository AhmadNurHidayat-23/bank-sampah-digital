<?php

use App\Models\User;
use Illuminate\Contracts\Console\Kernel;

require __DIR__.'/../vendor/autoload.php';
$app = require __DIR__.'/../bootstrap/app.php';
$app->make(Kernel::class)->bootstrap();
if (! app()->environment('e2e') || ! getenv('E2E_PASSWORD')) {
    throw new RuntimeException('Jalankan npm run test:e2e.');
}$u = User::create(['name' => 'Petugas Browser', 'email' => 'petugas@example.test', 'password' => getenv('E2E_PASSWORD')]);
$u->forceFill(['role' => 'staff'])->save();
