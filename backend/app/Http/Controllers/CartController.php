<?php

namespace App\Http\Controllers;

use App\Models\CartItem;
use App\Models\Product;
use App\Models\Buyer;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class CartController extends Controller
{
    /**
     * Get buyer's cart items
     */
    public function getCart(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            
            if (!$user || $user->role !== 'Buyer') {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized. Buyer access required.'
                ], 403);
            }

            $buyer = Buyer::where('email', $user->email)->first();
            
            if (!$buyer) {
                return response()->json([
                    'success' => false,
                    'message' => 'Buyer profile not found.'
                ], 404);
            }

            $cartItems = CartItem::getCartWithProducts($buyer->id);
            
            $totalAmount = $cartItems->sum('total_price');
            $totalItems = $cartItems->count();

            return response()->json([
                'success' => true,
                'cart' => [
                    'items' => $cartItems,
                    'total_amount' => $totalAmount,
                    'total_items' => $totalItems,
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving cart: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Add item to cart
     */
    public function addToCart(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            
            // Debug logging
            \Log::info('Cart add request', [
                'user' => $user ? $user->email : 'no user',
                'user_role' => $user ? $user->role : 'no role',
                'request_data' => $request->all()
            ]);
            
            if (!$user || $user->role !== 'Buyer') {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized. Buyer access required.'
                ], 403);
            }

            $buyer = Buyer::where('email', $user->email)->first();
            
            if (!$buyer) {
                return response()->json([
                    'success' => false,
                    'message' => 'Buyer profile not found.'
                ], 404);
            }

            $validator = Validator::make($request->all(), [
                'product_id' => 'required|exists:products,id',
                'quantity' => 'integer|min:1',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $product = Product::find($request->product_id);
            
            if (!$product || $product->status !== 'active') {
                return response()->json([
                    'success' => false,
                    'message' => 'Product is not available for purchase'
                ], 400);
            }

            $quantity = $request->quantity ?? 1;
            
            // Check if adding this quantity exceeds available stock
            $existingCartItem = CartItem::where('buyer_id', $buyer->id)
                ->where('product_id', $product->id)
                ->first();
            
            $totalRequestedQuantity = $quantity;
            if ($existingCartItem) {
                $totalRequestedQuantity += $existingCartItem->quantity;
            }

            if ($totalRequestedQuantity > $product->quantity_available) {
                return response()->json([
                    'success' => false,
                    'message' => 'Requested quantity exceeds available stock',
                    'available_quantity' => $product->quantity_available,
                    'current_cart_quantity' => $existingCartItem ? $existingCartItem->quantity : 0
                ], 400);
            }

            $cartItem = CartItem::addToCart($buyer->id, $product->id, $quantity);
            
            // Load the product relationship to calculate total price
            $cartItem->load('product');
            
            return response()->json([
                'success' => true,
                'message' => 'Product added to cart successfully',
                'cart_item' => [
                    'id' => $cartItem->id,
                    'product_id' => $cartItem->product_id,
                    'quantity' => $cartItem->quantity,
                    'total_price' => $cartItem->quantity * $product->price,
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error adding item to cart: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update cart item quantity
     */
    public function updateCartItem(Request $request, $cartItemId): JsonResponse
    {
        try {
            $user = $request->user();
            
            if (!$user || $user->role !== 'Buyer') {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized. Buyer access required.'
                ], 403);
            }

            $buyer = Buyer::where('email', $user->email)->first();
            
            if (!$buyer) {
                return response()->json([
                    'success' => false,
                    'message' => 'Buyer profile not found.'
                ], 404);
            }

            $validator = Validator::make($request->all(), [
                'quantity' => 'required|integer|min:0',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $cartItem = CartItem::with('product')->find($cartItemId);
            
            if (!$cartItem || $cartItem->buyer_id !== $buyer->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cart item not found'
                ], 404);
            }

            $quantity = $request->quantity;

            if ($quantity > 0) {
                // Check if requested quantity exceeds available stock
                if ($quantity > $cartItem->product->quantity_available) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Requested quantity exceeds available stock',
                        'available_quantity' => $cartItem->product->quantity_available
                    ], 400);
                }
            }

            $cartItem->updateQuantity($quantity);

            if ($quantity === 0) {
                return response()->json([
                    'success' => true,
                    'message' => 'Item removed from cart successfully'
                ]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Cart item updated successfully',
                'cart_item' => [
                    'id' => $cartItem->id,
                    'product_id' => $cartItem->product_id,
                    'quantity' => $cartItem->quantity,
                    'total_price' => $cartItem->total_price,
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error updating cart item: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove item from cart
     */
    public function removeFromCart(Request $request, $cartItemId): JsonResponse
    {
        try {
            $user = $request->user();
            
            if (!$user || $user->role !== 'Buyer') {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized. Buyer access required.'
                ], 403);
            }

            $buyer = Buyer::where('email', $user->email)->first();
            
            if (!$buyer) {
                return response()->json([
                    'success' => false,
                    'message' => 'Buyer profile not found.'
                ], 404);
            }

            $cartItem = CartItem::find($cartItemId);
            
            if (!$cartItem || $cartItem->buyer_id !== $buyer->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cart item not found'
                ], 404);
            }

            $cartItem->delete();

            return response()->json([
                'success' => true,
                'message' => 'Item removed from cart successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error removing item from cart: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Clear entire cart
     */
    public function clearCart(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            
            if (!$user || $user->role !== 'Buyer') {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized. Buyer access required.'
                ], 403);
            }

            $buyer = Buyer::where('email', $user->email)->first();
            
            if (!$buyer) {
                return response()->json([
                    'success' => false,
                    'message' => 'Buyer profile not found.'
                ], 404);
            }

            $deletedCount = CartItem::where('buyer_id', $buyer->id)->delete();

            return response()->json([
                'success' => true,
                'message' => 'Cart cleared successfully',
                'items_removed' => $deletedCount
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error clearing cart: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get cart summary (item count and total)
     */
    public function getCartSummary(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            
            if (!$user || $user->role !== 'Buyer') {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized. Buyer access required.'
                ], 403);
            }

            $buyer = Buyer::where('email', $user->email)->first();
            
            if (!$buyer) {
                return response()->json([
                    'success' => false,
                    'message' => 'Buyer profile not found.'
                ], 404);
            }

            $cartItems = CartItem::with('product')
                ->where('buyer_id', $buyer->id)
                ->get();

            $totalItems = $cartItems->count();
            $totalQuantity = $cartItems->sum('quantity');
            $totalAmount = $cartItems->sum(function ($item) {
                return $item->quantity * $item->product->price;
            });

            return response()->json([
                'success' => true,
                'summary' => [
                    'total_items' => $totalItems,
                    'total_quantity' => $totalQuantity,
                    'total_amount' => round($totalAmount, 2),
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving cart summary: ' . $e->getMessage()
            ], 500);
        }
    }
}