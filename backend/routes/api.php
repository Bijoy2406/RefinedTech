<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\CartController;

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

// Cart Management (Buyers only)
Route::middleware(['multi.auth'])->group(function () {
    Route::get('/cart', [CartController::class, 'getCart']);
    Route::post('/cart/add', [CartController::class, 'addToCart']);
    Route::put('/cart/{cartItemId}', [CartController::class, 'updateCartItem']);
    Route::delete('/cart/{cartItemId}', [CartController::class, 'removeFromCart']);
    Route::delete('/cart', [CartController::class, 'clearCart']);
    Route::get('/cart/summary', [CartController::class, 'getCartSummary']);
});

// Order Management
Route::middleware(['multi.auth'])->group(function () {
    // Buyer order routes
    Route::get('/orders/buyer', [OrderController::class, 'getBuyerOrders']);
    Route::post('/orders/create', [OrderController::class, 'createOrder']);
    Route::put('/orders/{orderId}/cancel', [OrderController::class, 'cancelOrder']);
    
    // Seller order routes  
    Route::get('/orders/seller', [OrderController::class, 'getSellerOrders']);
    Route::put('/orders/{orderId}/status', [OrderController::class, 'updateOrderStatus']);
    
    // Common order routes (accessible by buyers, sellers, and admins)
    Route::get('/orders/{orderId}', [OrderController::class, 'getOrderDetails']);
});

// Wishlist Management (Buyers only)
Route::middleware(['multi.auth'])->group(function () {
    Route::get('/wishlist', [App\Http\Controllers\WishlistController::class, 'getWishlist']);
    Route::post('/wishlist/add', [App\Http\Controllers\WishlistController::class, 'addToWishlist']);
    Route::delete('/wishlist/{productId}', [App\Http\Controllers\WishlistController::class, 'removeFromWishlist']);
    Route::get('/wishlist/check/{productId}', [App\Http\Controllers\WishlistController::class, 'checkWishlistStatus']);
    Route::delete('/wishlist', [App\Http\Controllers\WishlistController::class, 'clearWishlist']);
});

// Messaging System (Buyers and Sellers)
Route::middleware(['multi.auth'])->group(function () {
    Route::post('/conversations/start', [App\Http\Controllers\MessageController::class, 'startConversation']);
    Route::get('/conversations', [App\Http\Controllers\MessageController::class, 'getConversations']);
    Route::get('/conversations/{conversationId}/messages', [App\Http\Controllers\MessageController::class, 'getMessages']);
    Route::post('/conversations/{conversationId}/messages', [App\Http\Controllers\MessageController::class, 'sendMessage']);
    Route::put('/conversations/{conversationId}/read', [App\Http\Controllers\MessageController::class, 'markAsRead']);
});

Route::get('/categories', [App\Http\Controllers\ProductController::class, 'getCategoryStats']);
