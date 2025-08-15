<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;

// Authentication Routes
Route::post('/signup', [AuthController::class, 'signup']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    Route::get('/users', [App\Http\Controllers\AdminController::class, 'getUsers']);
    Route::get('/pending-users', [App\Http\Controllers\AdminController::class, 'getPendingUsers']);
    Route::put('/users/{user}/approve', [App\Http\Controllers\AdminController::class, 'approveUser']);
    Route::put('/users/{user}/reject', [App\Http\Controllers\AdminController::class, 'rejectUser']);
});
