<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\BankController;
use App\Http\Controllers\ReportController;
use App\Http\Middleware\EnsureStaff;
use Illuminate\Support\Facades\Route;

Route::get('/', [AuthController::class, 'form']);
Route::get('/masuk', [AuthController::class, 'form'])->middleware('guest')->name('login');
Route::post('/masuk', [AuthController::class, 'login'])->middleware(['guest', 'throttle:5,1']);
Route::post('/daftar', [AuthController::class, 'register'])->middleware(['guest', 'throttle:5,1']);
Route::middleware('auth')->group(function () {
    Route::post('/keluar', [AuthController::class, 'logout']);
    Route::get('/beranda', [BankController::class, 'index']);
    Route::post('/penarikan', [BankController::class, 'withdraw'])->middleware('throttle:10,1');
    Route::middleware(EnsureStaff::class)->prefix('petugas')->group(function () {
        Route::post('/setoran', [BankController::class, 'deposit']);
        Route::patch('/setoran/{id}', [BankController::class, 'reviewDeposit']);
        Route::patch('/penarikan/{id}', [BankController::class, 'reviewWithdrawal']);
        Route::post('/kategori/{category?}', [BankController::class, 'category']);
        Route::get('/laporan', [ReportController::class, 'index']);
    });
});
