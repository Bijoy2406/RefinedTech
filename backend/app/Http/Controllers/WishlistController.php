<?php

namespace App\Http\Controllers;

use App\Models\Wishlist;
use App\Models\Product;
use App\Models\Buyer;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class WishlistController extends Controller
{
    /**
     * Get buyer's wishlist items
     */
    public function getWishlist(Request $request): JsonResponse
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

            $wishlistItems = Wishlist::getWishlistWithProducts($buyer->id);
            
            return response()->json([
                'success' => true,
                'wishlist' => [
                    'items' => $wishlistItems,
                    'total_items' => $wishlistItems->count(),
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching wishlist: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Add item to wishlist
     */
    public function addToWishlist(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            
            // Debug logging
            \Log::info('Wishlist add request', [
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
                    'message' => 'Product is not available'
                ], 400);
            }

            // Check if buyer is trying to add their own product
            if ($product->seller_id == $buyer->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'You cannot add your own product to wishlist'
                ], 400);
            }

            $added = Wishlist::addToWishlist($buyer->id, $product->id);

            if ($added) {
                return response()->json([
                    'success' => true,
                    'message' => 'Product added to wishlist successfully'
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Product is already in your wishlist'
                ], 400);
            }

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error adding item to wishlist: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove item from wishlist
     */
    public function removeFromWishlist(Request $request, $productId): JsonResponse
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

            $removed = Wishlist::removeFromWishlist($buyer->id, $productId);

            if ($removed) {
                return response()->json([
                    'success' => true,
                    'message' => 'Product removed from wishlist successfully'
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Product not found in your wishlist'
                ], 400);
            }

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error removing item from wishlist: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Check if product is in wishlist
     */
    public function checkWishlistStatus(Request $request, $productId): JsonResponse
    {
        try {
            $user = $request->user();
            
            if (!$user || $user->role !== 'Buyer') {
                return response()->json([
                    'success' => true,
                    'in_wishlist' => false
                ]);
            }

            $buyer = Buyer::where('email', $user->email)->first();
            
            if (!$buyer) {
                return response()->json([
                    'success' => true,
                    'in_wishlist' => false
                ]);
            }

            $inWishlist = Wishlist::isInWishlist($buyer->id, $productId);

            return response()->json([
                'success' => true,
                'in_wishlist' => $inWishlist
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error checking wishlist status: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Clear entire wishlist
     */
    public function clearWishlist(Request $request): JsonResponse
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

            $deletedCount = Wishlist::where('buyer_id', $buyer->id)->delete();

            return response()->json([
                'success' => true,
                'message' => "Wishlist cleared successfully. Removed $deletedCount items."
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error clearing wishlist: ' . $e->getMessage()
            ], 500);
        }
    }
}