<?php

use App\Http\Controllers\AdminController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    Route::get('/users', [AdminController::class, 'getUsers']);
    Route::get('/pending-users', [AdminController::class, 'getPendingUsers']);
    Route::put('/users/{user}/approve', [AdminController::class, 'approveUser']);
    Route::put('/users/{user}/reject', [AdminController::class, 'rejectUser']);
});
