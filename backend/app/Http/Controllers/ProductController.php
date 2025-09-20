<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use App\Models\Product;
use App\Models\ProductImage;
use Exception;

class ProductController extends Controller
{
    /**
     * Get all products for the authenticated seller
     */
    public function getSellerProducts(Request $request): JsonResponse
    {
        try {
            $seller = Auth::user();
            
            if (!$seller || !($seller instanceof \App\Models\Seller)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized. Seller access required.'
                ], 403);
            }

            $products = Product::where('seller_id', $seller->id)
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($product) {
                    return [
                        'id' => $product->id,
                        'title' => $product->title,
                        'description' => $product->description,
                        'category' => $product->category,
                        'subcategory' => $product->subcategory,
                        'brand' => $product->brand,
                        'model' => $product->model,
                        'condition_grade' => $product->condition_grade,
                        'condition_description' => $product->condition_description,
                        'price' => $product->price,
                        'original_price' => $product->original_price,
                        'discount_percentage' => $product->discount_percentage,
                        'quantity_available' => $product->quantity_available,
                        'warranty_period' => $product->warranty_period,
                        'return_policy' => $product->return_policy,
                        'shipping_weight' => $product->shipping_weight,
                        'dimensions' => $product->dimensions,
                        'color' => $product->color,
                        'storage_capacity' => $product->storage_capacity,
                        'ram_memory' => $product->ram_memory,
                        'processor' => $product->processor,
                        'operating_system' => $product->operating_system,
                        'battery_health' => $product->battery_health,
                        'screen_size' => $product->screen_size,
                        'connectivity' => $product->connectivity,
                        'included_accessories' => $product->included_accessories,
                        'defects_issues' => $product->defects_issues,
                        'purchase_date' => $product->purchase_date,
                        'usage_duration' => $product->usage_duration,
                        'reason_for_selling' => $product->reason_for_selling,
                        'tags' => $product->tags,
                        'is_featured' => $product->is_featured,
                        'is_urgent_sale' => $product->is_urgent_sale,
                        'negotiable' => $product->negotiable,
                        'minimum_price' => $product->minimum_price,
                        'location_city' => $product->location_city,
                        'location_state' => $product->location_state,
                        'shipping_options' => $product->shipping_options,
                        'status' => $product->status,
                        'views_count' => $product->views_count,
                        'favorites_count' => $product->favorites_count,
                        'created_at' => $product->created_at,
                        'updated_at' => $product->updated_at,
                        'images' => $product->images ? json_decode($product->images) : []
                    ];
                });

            return response()->json([
                'success' => true,
                'products' => $products
            ]);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch products: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get seller dashboard statistics
     */
    public function getSellerStats(Request $request): JsonResponse
    {
        try {
            $seller = Auth::user();
            
            if (!$seller || !($seller instanceof \App\Models\Seller)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized. Seller access required.'
                ], 403);
            }

            $stats = [
                'totalProducts' => Product::where('seller_id', $seller->id)->count(),
                'activeProducts' => Product::where('seller_id', $seller->id)
                    ->where('status', 'active')->count(),
                'pendingProducts' => Product::where('seller_id', $seller->id)
                    ->where('status', 'pending')->count(),
                'soldProducts' => Product::where('seller_id', $seller->id)
                    ->where('status', 'sold')->count(),
                'totalRevenue' => 0, // Will implement with orders system
                'viewsCount' => Product::where('seller_id', $seller->id)
                    ->sum('views_count')
            ];

            return response()->json($stats);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch statistics: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create a new product
     */
    public function createProduct(Request $request): JsonResponse
    {
        try {
            $seller = Auth::user();
            
            if (!$seller || !($seller instanceof \App\Models\Seller)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized. Seller access required.'
                ], 403);
            }

            $validator = Validator::make($request->all(), [
                'title' => 'required|string|max:255',
                'description' => 'nullable|string|max:2000',
                'category' => 'required|string|max:100',
                'subcategory' => 'nullable|string|max:100',
                'brand' => 'required|string|max:100',
                'model' => 'required|string|max:100',
                'condition_grade' => 'required|in:like-new,excellent,good,fair',
                'condition_description' => 'nullable|string|max:1000',
                'price' => 'required|numeric|min:0',
                'original_price' => 'nullable|numeric|min:0',
                'discount_percentage' => 'nullable|numeric|min:0|max:100',
                'quantity_available' => 'required|integer|min:1',
                'warranty_period' => 'nullable|string|max:100',
                'return_policy' => 'nullable|string|max:500',
                'shipping_weight' => 'nullable|string|max:50',
                'dimensions' => 'nullable|string|max:100',
                'color' => 'nullable|string|max:50',
                'storage_capacity' => 'nullable|string|max:50',
                'ram_memory' => 'nullable|string|max:50',
                'processor' => 'nullable|string|max:100',
                'operating_system' => 'nullable|string|max:100',
                'battery_health' => 'nullable|string|max:50',
                'screen_size' => 'nullable|string|max:50',
                'connectivity' => 'nullable|string|max:200',
                'included_accessories' => 'nullable|string|max:1000',
                'defects_issues' => 'nullable|string|max:1000',
                'purchase_date' => 'nullable|date',
                'usage_duration' => 'nullable|string|max:100',
                'reason_for_selling' => 'nullable|string|max:500',
                'tags' => 'nullable|string|max:500',
                'is_featured' => 'boolean',
                'is_urgent_sale' => 'boolean',
                'negotiable' => 'boolean',
                'minimum_price' => 'nullable|numeric|min:0',
                'location_city' => 'nullable|string|max:100',
                'location_state' => 'nullable|string|max:100',
                'shipping_options' => 'nullable|string|max:500'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $productData = $validator->validated();
            $productData['seller_id'] = $seller->id;
            $productData['status'] = 'active'; // Products are automatically approved
            $productData['approval_date'] = now(); // Set approval date when creating
            $productData['created_at'] = now();
            $productData['updated_at'] = now();

            // Convert boolean fields
            $productData['is_featured'] = $request->has('is_featured') ? 
                ($request->boolean('is_featured') ? 1 : 0) : 0;
            $productData['is_urgent_sale'] = $request->has('is_urgent_sale') ? 
                ($request->boolean('is_urgent_sale') ? 1 : 0) : 0;
            $productData['negotiable'] = $request->has('negotiable') ? 
                ($request->boolean('negotiable') ? 1 : 0) : 1;

            // Generate unique SKU
            $productData['sku'] = 'RT-' . strtoupper($seller->id) . '-' . time() . rand(100, 999);

            $product = Product::create($productData);

            return response()->json([
                'success' => true,
                'message' => 'Product created and published successfully!',
                'product' => $product
            ], 201);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create product: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update an existing product
     */
    public function updateProduct(Request $request, $id): JsonResponse
    {
        try {
            $seller = Auth::user();
            
            if (!$seller || !($seller instanceof \App\Models\Seller)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized. Seller access required.'
                ], 403);
            }

            $product = Product::where('id', $id)
                ->where('seller_id', $seller->id)
                ->first();

            if (!$product) {
                return response()->json([
                    'success' => false,
                    'message' => 'Product not found or access denied.'
                ], 404);
            }

            $validator = Validator::make($request->all(), [
                'title' => 'required|string|max:255',
                'description' => 'nullable|string|max:2000',
                'category' => 'required|string|max:100',
                'subcategory' => 'nullable|string|max:100',
                'brand' => 'required|string|max:100',
                'model' => 'required|string|max:100',
                'condition_grade' => 'required|in:like-new,excellent,good,fair',
                'condition_description' => 'nullable|string|max:1000',
                'price' => 'required|numeric|min:0',
                'original_price' => 'nullable|numeric|min:0',
                'discount_percentage' => 'nullable|numeric|min:0|max:100',
                'quantity_available' => 'required|integer|min:1',
                'warranty_period' => 'nullable|string|max:100',
                'return_policy' => 'nullable|string|max:500',
                'shipping_weight' => 'nullable|string|max:50',
                'dimensions' => 'nullable|string|max:100',
                'color' => 'nullable|string|max:50',
                'storage_capacity' => 'nullable|string|max:50',
                'ram_memory' => 'nullable|string|max:50',
                'processor' => 'nullable|string|max:100',
                'operating_system' => 'nullable|string|max:100',
                'battery_health' => 'nullable|string|max:50',
                'screen_size' => 'nullable|string|max:50',
                'connectivity' => 'nullable|string|max:200',
                'included_accessories' => 'nullable|string|max:1000',
                'defects_issues' => 'nullable|string|max:1000',
                'purchase_date' => 'nullable|date',
                'usage_duration' => 'nullable|string|max:100',
                'reason_for_selling' => 'nullable|string|max:500',
                'tags' => 'nullable|string|max:500',
                'is_featured' => 'boolean',
                'is_urgent_sale' => 'boolean',
                'negotiable' => 'boolean',
                'minimum_price' => 'nullable|numeric|min:0',
                'location_city' => 'nullable|string|max:100',
                'location_state' => 'nullable|string|max:100',
                'shipping_options' => 'nullable|string|max:500'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $productData = $validator->validated();
            $productData['updated_at'] = now();

            // Convert boolean fields
            $productData['is_featured'] = $request->has('is_featured') ? 
                ($request->boolean('is_featured') ? 1 : 0) : 0;
            $productData['is_urgent_sale'] = $request->has('is_urgent_sale') ? 
                ($request->boolean('is_urgent_sale') ? 1 : 0) : 0;
            $productData['negotiable'] = $request->has('negotiable') ? 
                ($request->boolean('negotiable') ? 1 : 0) : 1;

            // Products remain active after updates (no re-approval needed)
            $product->update($productData);

            return response()->json([
                'success' => true,
                'message' => 'Product updated successfully!',
                'product' => $product->fresh()
            ]);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update product: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete a product
     */
    public function deleteProduct(Request $request, $id): JsonResponse
    {
        try {
            $seller = Auth::user();
            
            if (!$seller || !($seller instanceof \App\Models\Seller)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized. Seller access required.'
                ], 403);
            }

            $product = Product::where('id', $id)
                ->where('seller_id', $seller->id)
                ->first();

            if (!$product) {
                return response()->json([
                    'success' => false,
                    'message' => 'Product not found or access denied.'
                ], 404);
            }

            // Check if product has active orders (when order system is implemented)
            // For now, just delete

            $product->delete();

            return response()->json([
                'success' => true,
                'message' => 'Product deleted successfully.'
            ]);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete product: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all products (public endpoint for buyers)
     */
    public function getAllProducts(Request $request): JsonResponse
    {
        try {
<<<<<<< HEAD
            $query = Product::with('seller')
                ->where('status', 'active')
=======
            $query = Product::where('status', 'active')
>>>>>>> dev
                ->where('quantity_available', '>', 0)
                ->orderBy('created_at', 'desc');

            // Apply filters
            if ($request->has('category') && $request->category) {
                $query->where('category', $request->category);
            }

            if ($request->has('brand') && $request->brand) {
                $query->where('brand', 'LIKE', '%' . $request->brand . '%');
            }

            if ($request->has('condition') && $request->condition) {
                $query->where('condition_grade', $request->condition);
            }

            if ($request->has('min_price') && $request->min_price) {
                $query->where('price', '>=', $request->min_price);
            }

            if ($request->has('max_price') && $request->max_price) {
                $query->where('price', '<=', $request->max_price);
            }

            if ($request->has('search') && $request->search) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('title', 'LIKE', '%' . $search . '%')
                      ->orWhere('description', 'LIKE', '%' . $search . '%')
                      ->orWhere('brand', 'LIKE', '%' . $search . '%')
                      ->orWhere('model', 'LIKE', '%' . $search . '%');
                });
            }

            // Pagination
            $perPage = $request->get('per_page', 20);
            $products = $query->paginate($perPage);

<<<<<<< HEAD
            // Normalize items for frontend consumption (decode images, include minimal seller info)
            $items = collect($products->items())->map(function ($product) {
                return [
                    'id' => $product->id,
                    'title' => $product->title,
                    'description' => $product->description,
                    'category' => $product->category,
                    'subcategory' => $product->subcategory,
                    'brand' => $product->brand,
                    'model' => $product->model,
                    'condition_grade' => $product->condition_grade,
                    'condition_description' => $product->condition_description,
                    'price' => $product->price,
                    'original_price' => $product->original_price,
                    'discount_percentage' => $product->discount_percentage,
                    'quantity_available' => $product->quantity_available,
                    'warranty_period' => $product->warranty_period,
                    'return_policy' => $product->return_policy,
                    'shipping_weight' => $product->shipping_weight,
                    'dimensions' => $product->dimensions,
                    'color' => $product->color,
                    'storage_capacity' => $product->storage_capacity,
                    'ram_memory' => $product->ram_memory,
                    'processor' => $product->processor,
                    'operating_system' => $product->operating_system,
                    'battery_health' => $product->battery_health,
                    'screen_size' => $product->screen_size,
                    'connectivity' => $product->connectivity,
                    'included_accessories' => $product->included_accessories,
                    'defects_issues' => $product->defects_issues,
                    'purchase_date' => $product->purchase_date,
                    'usage_duration' => $product->usage_duration,
                    'reason_for_selling' => $product->reason_for_selling,
                    'tags' => $product->tags,
                    'is_featured' => $product->is_featured,
                    'is_urgent_sale' => $product->is_urgent_sale,
                    'negotiable' => $product->negotiable,
                    'minimum_price' => $product->minimum_price,
                    'location_city' => $product->location_city,
                    'location_state' => $product->location_state,
                    'shipping_options' => $product->shipping_options,
                    'status' => $product->status,
                    'views_count' => $product->views_count,
                    'favorites_count' => $product->favorites_count,
                    'created_at' => $product->created_at,
                    'updated_at' => $product->updated_at,
                    'images' => $product->images
                        ? (is_array($product->images)
                            ? $product->images
                            : ((json_decode($product->images, true)) ?: []))
                        : [],
                    'seller' => $product->seller ? [
                        'id' => $product->seller->id,
                        'shop_username' => $product->seller->shop_username,
                        'name' => $product->seller->name,
                    ] : null,
                ];
            });

            return response()->json([
                'success' => true,
                'products' => $items,
=======
            return response()->json([
                'success' => true,
                'products' => $products->items(),
>>>>>>> dev
                'pagination' => [
                    'current_page' => $products->currentPage(),
                    'last_page' => $products->lastPage(),
                    'per_page' => $products->perPage(),
                    'total' => $products->total()
                ]
            ]);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch products: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get a single product by ID
     */
    public function getProduct(Request $request, $id): JsonResponse
    {
        try {
<<<<<<< HEAD
            $product = Product::with('seller')
                ->where('id', $id)
=======
            $product = Product::where('id', $id)
>>>>>>> dev
                ->where('status', 'active')
                ->first();

            if (!$product) {
                return response()->json([
                    'success' => false,
                    'message' => 'Product not found.'
                ], 404);
            }

            // Increment views count
            $product->increment('views_count');

            return response()->json([
                'success' => true,
                'product' => $product
            ]);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch product: ' . $e->getMessage()
            ], 500);
        }
    }
<<<<<<< HEAD

    /**
     * Get category statistics (product count per category)
     */
    public function getCategoryStats(Request $request): JsonResponse
    {
        try {
            $categoryStats = Product::where('status', 'active')
                ->where('quantity_available', '>', 0)
                ->select('category', DB::raw('count(*) as count'))
                ->groupBy('category')
                ->get()
                ->pluck('count', 'category')
                ->toArray();

            // Define all available categories with their display information
            $allCategories = [
                'Smartphones' => ['icon' => '📱', 'color' => '#E53935'],
                'Laptops' => ['icon' => '💻', 'color' => '#1976D2'],
                'Tablets' => ['icon' => '📱', 'color' => '#388E3C'],
                'Desktop Computers' => ['icon' => '🖥️', 'color' => '#7B1FA2'],
                'Gaming' => ['icon' => '🎮', 'color' => '#F57C00'],
                'Smart Watches' => ['icon' => '⌚', 'color' => '#C2185B'],
                'Audio & Headphones' => ['icon' => '🎧', 'color' => '#5D4037'],
                'Cameras' => ['icon' => '📷', 'color' => '#455A64'],
                'Accessories' => ['icon' => '🔌', 'color' => '#424242'],
                'Other Electronics' => ['icon' => '📦', 'color' => '#37474F']
            ];

            // Merge with actual counts from database
            $categories = collect($allCategories)->map(function ($categoryInfo, $categoryName) use ($categoryStats) {
                return [
                    'name' => $categoryName,
                    'icon' => $categoryInfo['icon'],
                    'color' => $categoryInfo['color'],
                    'count' => $categoryStats[$categoryName] ?? 0
                ];
            })->values();

            return response()->json([
                'success' => true,
                'categories' => $categories
            ]);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch category statistics: ' . $e->getMessage()
            ], 500);
        }
    }
=======
>>>>>>> dev
}
