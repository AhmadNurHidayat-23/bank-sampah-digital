<?php

use App\Models\User;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Validator;

Artisan::command('staff:create', function () {
    $name = $this->ask('Nama petugas');
    $email = $this->ask('Email');
    $password = $this->secret('Kata sandi minimal 12 karakter');
    $v = Validator::make(compact('name', 'email', 'password'), ['name' => 'required|string|max:80', 'email' => 'required|email|unique:users', 'password' => 'required|string|min:12']);
    if ($v->fails()) {
        $this->error($v->errors()->first());

        return 1;
    }$u = User::create(compact('name', 'email', 'password'));
    $u->role = 'staff';
    $u->save();
    $this->info('Petugas dibuat.');
});
