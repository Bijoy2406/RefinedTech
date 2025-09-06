<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;

// Authentication Routes
Route::post('/signup', [AuthController::class, 'signup']);
Route::post('/login', [AuthController::class, 'login']);

// Test endpoint to debug auth
Route::middleware(['auth:sanctum'])->get('/test-auth', function (Request $request) {
    return response()->json([
        'message' => 'Authentication works!',
        'user' => $request->user(),
        'token_id' => optional($request->user()->currentAccessToken())->id
    ]);
});

// Protected user routes (supports Admin, Buyer, Seller tokens)
Route::middleware(['multi.auth'])->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'getUserInfo']);
    Route::get('/profile', [AuthController::class, 'getUserInfo']); // Alias for profile page
    Route::put('/profile/password', [AuthController::class, 'updatePassword']);
    Route::post('/profile/image', [AuthController::class, 'uploadProfileImage']);
    Route::put('/profile/picture', [AuthController::class, 'updateProfilePicture']); // For frontend compatibility
    Route::delete('/profile/picture', [AuthController::class, 'removeProfilePicture']); // For frontend compatibility
    
    // Admin access code management (only for admins)
    Route::post('/admin/access-codes', [AuthController::class, 'generateAdminAccessCode']);
    Route::get('/admin/access-codes', [AuthController::class, 'getMyAccessCodes']);
    Route::get('/admin/access-code', [AuthController::class, 'getAdminAccessCode']);
    Route::get('/admin/referred-users', [AuthController::class, 'getReferredUsers']);
    Route::post('/admin/generate-codes', [AuthController::class, 'generateNewCodes']);
});

// Public route to serve stored profile images
Route::get('/profile/image/{type}/{id}', [AuthController::class, 'getProfileImage'])->name('profile.image');

Route::middleware(['multi.auth', 'admin'])->prefix('admin')->group(function () {
    Route::get('/users', [App\Http\Controllers\AdminController::class, 'getUsers']);
    Route::get('/pending-users', [App\Http\Controllers\AdminController::class, 'getPendingUsers']);
    Route::get('/pending-sellers', [App\Http\Controllers\AdminController::class, 'getPendingSellers']);
    Route::get('/pending-admins', [App\Http\Controllers\AdminController::class, 'getPendingAdmins']);
    Route::get('/is-super-admin', [App\Http\Controllers\AdminController::class, 'isSuperAdmin']);
    Route::get('/users/{role}/{id}', [App\Http\Controllers\AdminController::class, 'getUserDetails']);
    Route::put('/users/{role}/{id}/approve', [App\Http\Controllers\AdminController::class, 'approveUser']);
    Route::put('/users/{role}/{id}/reject', [App\Http\Controllers\AdminController::class, 'rejectUser']);
    Route::get('/access-codes/available', [App\Http\Controllers\AdminController::class, 'getAvailableAccessCodes']);
});

// Seller protected routes
Route::middleware(['multi.auth', 'seller'])->prefix('seller')->group(function () {
    Route::get('/products', [App\Http\Controllers\ProductController::class, 'getSellerProducts']);
    Route::get('/stats', [App\Http\Controllers\ProductController::class, 'getSellerStats']);
    Route::post('/products', [App\Http\Controllers\ProductController::class, 'createProduct']);
    Route::put('/products/{id}', [App\Http\Controllers\ProductController::class, 'updateProduct']);
    Route::delete('/products/{id}', [App\Http\Controllers\ProductController::class, 'deleteProduct']);
});

// Public product routes
Route::get('/products', [App\Http\Controllers\ProductController::class, 'getAllProducts']);
Route::get('/products/{id}', [App\Http\Controllers\ProductController::class, 'getProduct']);
