<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class AuthController extends Controller
{
    public function form()
    {
        return Inertia::render('Auth');
    }

    public function login(Request $r)
    {
        $d = $r->validate(['email' => 'required|email', 'password' => 'required|string']);
        if (! Auth::attempt($d)) {
            throw ValidationException::withMessages(['email' => 'Email atau kata sandi tidak sesuai.']);
        }$r->session()->regenerate();

        return redirect()->intended('/beranda');
    }

    public function register(Request $r)
    {
        $d = $r->validate(['name' => 'required|string|max:80', 'email' => 'required|email|max:150|unique:users', 'password' => 'required|string|min:12|confirmed']);
        $u = User::create($d);
        Auth::login($u);
        $r->session()->regenerate();

        return redirect('/beranda');
    }

    public function logout(Request $r)
    {
        Auth::logout();
        $r->session()->invalidate();
        $r->session()->regenerateToken();

        return redirect('/');
    }
}
