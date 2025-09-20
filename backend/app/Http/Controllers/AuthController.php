<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use App\Models\User;
use App\Models\Buyer;
use App\Models\Seller;
use App\Models\Admin;
use App\Models\AdminAccessCode;
use CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary;
class AuthController extends Controller
{
    public function signup(Request $request)
    {
        $role = $request->role;
        
        // Base validation rules
        $baseRules = [
            'name' => 'required|string|max:255',
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255',
            'password' => 'required|string|min:6|confirmed',
            'role' => 'required|string|in:Buyer,Seller,Admin',
            'country' => 'required|string|max:255',
            'phone_number' => 'required|string|max:20',
        ];

        // Role-specific validation rules
        $roleSpecificRules = [];
        
        switch ($role) {
            case 'Seller':
                $roleSpecificRules = [
                    'shop_username' => 'required|string|max:255|unique:sellers',
                    'date_of_birth' => 'required|date|before:today',
                    'business_address' => 'required|string',
                    'national_id' => 'required|file|image|mimes:jpeg,png,jpg,gif|max:2048',
                    'proof_of_ownership' => 'required|file|image|mimes:jpeg,png,jpg,gif|max:2048',
                ];
                break;
                
            case 'Admin':
                $roleSpecificRules = [
                    'admin_access_code' => 'required|string|max:255',
                    'admin_username' => 'required|string|max:255|unique:admins',
                    'id_proof_reference' => 'required|string',
                ];
                break;
        }

        // Email uniqueness validation across all tables
        $emailRules = $this->getEmailValidationRules($role);
        $baseRules['email'] .= '|' . $emailRules;

        $validator = Validator::make($request->all(), array_merge($baseRules, $roleSpecificRules));

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Additional validation for Admin role
        if ($role === 'Admin') {
            $accessCode = AdminAccessCode::where('access_code', $request->admin_access_code)
                                        ->where('is_used', false)
                                        ->first();

            if (!$accessCode) {
                return response()->json(['message' => 'The admin access code is invalid or has already been used.'], 422);
            }
        }

        try {
            // Create user based on role
            $user = $this->createUserByRole($request, $role);
            
            // If this is an admin registration, mark the access code as used
            if ($role === 'Admin' && isset($accessCode)) {
                $accessCode->markAsUsed($user->id);
            }

            $message = $role === 'Buyer' 
                ? 'User registered successfully and is approved.' 
                : 'User registered successfully and is pending approval.';

            return response()->json([
                'message' => $message,
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'status' => $user->status,
                ]
            ], 201);

        } catch (\Exception $e) {
            return response()->json(['message' => 'Registration failed: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Get email validation rules to check uniqueness across all user tables
     */
    private function getEmailValidationRules($role)
    {
        $rules = [];
        
        if ($role !== 'Buyer') {
            $rules[] = 'unique:buyers';
        }
        if ($role !== 'Seller') {
            $rules[] = 'unique:sellers';
        }
        if ($role !== 'Admin') {
            $rules[] = 'unique:admins';
        }
        
        return implode('|', $rules);
    }

    /**
     * Create user in the appropriate table based on role
     */
    private function createUserByRole(Request $request, $role)
    {
        $baseData = [
            'name' => $request->name,
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'country' => $request->country,
            'phone_number' => $request->phone_number,
            'status' => $role === 'Buyer' ? 'approved' : 'pending',
        ];

        // Add admin_access_code if provided (for tracking referrals)
        if ($request->has('admin_access_code') && $request->admin_access_code) {
            $baseData['admin_access_code'] = $request->admin_access_code;
        }

        switch ($role) {
            case 'Buyer':
                return Buyer::create($baseData);

            case 'Seller':
                $sellerData = array_merge($baseData, [
                    'shop_username' => $request->shop_username,
                    'date_of_birth' => $request->date_of_birth,
                    'business_address' => $request->business_address,
                ]);

                // Handle file uploads
                if ($request->hasFile('national_id')) {
                    $nationalIdPath = $request->file('national_id')->store('national_ids', 'public');
                    $sellerData['national_id_path'] = $nationalIdPath;
                }
                
                if ($request->hasFile('proof_of_ownership')) {
                    $proofPath = $request->file('proof_of_ownership')->store('proof_of_ownership', 'public');
                    $sellerData['proof_of_ownership_path'] = $proofPath;
                }

                return Seller::create($sellerData);

            case 'Admin':
                return Admin::create(array_merge($baseData, [
                    'admin_access_code' => $request->admin_access_code,
                    'admin_username' => $request->admin_username,
                    'id_proof_reference' => $request->id_proof_reference,
                ]));

            default:
                throw new \Exception('Invalid role specified');
        }
    }

    /**
     * Find user by email across all tables
     */
    private function findUserByEmail($email)
    {
        // Try to find in buyers table
        $buyer = Buyer::where('email', $email)->first();
        if ($buyer) return $buyer;

        // Try to find in sellers table
        $seller = Seller::where('email', $email)->first();
        if ($seller) return $seller;

        // Try to find in admins table
        $admin = Admin::where('email', $email)->first();
        if ($admin) return $admin;

        return null;
    }

    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = $this->findUserByEmail($request->email);

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['error' => 'Invalid credentials'], 401);
        }

        if ($user->status !== 'approved') {
            return response()->json(['error' => 'Your account is not approved.'], 403);
        }

        // Revoke all existing tokens for this user to prevent token accumulation
        $user->tokens()->delete();
        
        $token = $user->createToken('auth_token')->plainTextToken;

        $userResponse = [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'status' => $user->status,
            'created_at' => $user->created_at,
            'updated_at' => $user->updated_at
        ];

        return response()->json([
            'message' => 'Login successful',
            'user' => $userResponse,
            'token' => $token,
        ], 200);
    }

    public function logout(Request $request)
    {
        // Revoke the token that was used to authenticate the current request
        $request->user()->currentAccessToken()->delete();
        
        return response()->json([
            'message' => 'Logged out successfully'
        ], 200);
    }

    public function getUserInfo(Request $request)
    {
        $user = $request->user();
        $imageUrl = null;
        
        // Priority: Cloudinary URL, then fallback to legacy route
        if ($user && $user->profile_image_url) {
            $imageUrl = $user->profile_image_url;
        } elseif ($user && $user->profile_image) {
            try {
                $imageUrl = route('profile.image', ['id' => $user->id, 'type' => strtolower($user->role)]);
            } catch (\Throwable $e) {
                $imageUrl = null;
            }
        }
        
        // Prepare user data with profile_picture field for frontend compatibility
        $userData = $user->toArray();
        $userData['profile_picture'] = $imageUrl;
        
        return response()->json([
            'user' => $userData,
            'profile_image_url' => $imageUrl,
        ], 200);
    }

    public function updatePassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:6',
            'confirm_password' => 'required|string|same:new_password',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = $request->user();

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json(['error' => 'Current password is incorrect'], 400);
        }

        $user->password = Hash::make($request->new_password);
        $user->save();

        return response()->json([
            'message' => 'Password updated successfully'
        ], 200);
    }

    /**
     * Generate a new admin access code (only for existing admins)
     */
    public function generateAdminAccessCode(Request $request)
    {
        $user = $request->user();

        // Only admins can generate access codes
        if ($user->role !== 'Admin') {
            return response()->json(['error' => 'Only administrators can generate access codes'], 403);
        }

        $validator = Validator::make($request->all(), [
            'description' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $accessCode = AdminAccessCode::create([
            'access_code' => AdminAccessCode::generateUniqueCode(),
            'created_by_admin_id' => $user->id,
            'description' => $request->description ?? 'Generated by ' . $user->name,
        ]);

        return response()->json([
            'message' => 'Admin access code generated successfully',
            'access_code' => $accessCode->access_code,
            'description' => $accessCode->description,
        ], 201);
    }

    /**
     * Get list of access codes created by the authenticated admin
     */
    public function getMyAccessCodes(Request $request)
    {
        $user = $request->user();

        if ($user->role !== 'Admin') {
            return response()->json(['error' => 'Only administrators can view access codes'], 403);
        }

        $accessCodes = AdminAccessCode::where('created_by_admin_id', $user->id)
                                     ->orderBy('created_at', 'desc')
                                     ->get();

        return response()->json([
            'access_codes' => $accessCodes
        ], 200);
    }

    /**
     * Upload or replace profile image (stored on Cloudinary)
     */
    public function uploadProfileImage(Request $request)
    {
        try {
            // Accept either traditional multipart file OR base64Image field
            $hasFile = $request->hasFile('image');
            $base64 = $request->input('base64Image');

            if (!$hasFile && !$base64) {
                return response()->json(['errors' => ['image' => ['No image or base64Image supplied']]], 422);
            }

            $user = $request->user();
            $imageData = null;

            if ($hasFile) {
                $validator = Validator::make($request->all(), [
                    'image' => 'required|file|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
                ]);
                if ($validator->fails()) {
                    return response()->json(['errors' => $validator->errors()], 422);
                }
                $file = $request->file('image');
                $imageData = $file->getRealPath();
            } else {
                // Handle base64 data
                $data = $base64;
                if (preg_match('/^data:(image\/(?:png|jpeg|jpg|gif|webp));base64,(.*)$/i', $data, $matches)) {
                    $data = $matches[2];
                }
                
                // Clean the base64 string
                $data = preg_replace('/[^A-Za-z0-9+\/=]/', '', $data);
                
                // Validate base64
                $decoded = base64_decode($data, true);
                if ($decoded === false) {
                    return response()->json(['errors' => ['base64Image' => ['Invalid base64 encoding']]], 422);
                }
                if (strlen($decoded) > 5 * 1024 * 1024) { // 5MB
                    return response()->json(['errors' => ['base64Image' => ['Image exceeds 5MB']]], 422);
                }
                
                $imageData = 'data:image/png;base64,' . $data;
            }

            // Delete old image from Cloudinary if exists
            if ($user->profile_image_public_id) {
                try {
                    Cloudinary::uploadApi()->destroy($user->profile_image_public_id);
                } catch (\Exception $e) {
                    \Log::warning('Failed to delete old Cloudinary image: ' . $e->getMessage());
                }
            }

            // Upload to Cloudinary
            $upload = Cloudinary::uploadApi()->upload($imageData, [
                'folder' => 'refinedtech/profiles/' . strtolower($user->role) . 's',
                'public_id' => strtolower($user->role) . '_' . $user->id,
                'overwrite' => true,
                'transformation' => [
                    'width' => 400,
                    'height' => 400,
                    'crop' => 'fill',
                    'quality' => 'auto'
                ]
            ]);

            // Update user with Cloudinary URL and public_id
            $user->profile_image_url = $upload['secure_url'];
            $user->profile_image_public_id = $upload['public_id'];
            
            // Clear old BLOB data to save space
            $user->profile_image = null;
            $user->profile_image_mime = null;
            
            $user->save();

            // Create response
            $responseData = [
                'message' => 'Profile image updated',
                'profile_image_url' => $user->profile_image_url,
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'status' => $user->status,
                    'profile_image_url' => $user->profile_image_url,
                ]
            ];

            return response()->json($responseData, 200);
            
        } catch (\Exception $e) {
            \Log::error('Profile image upload error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to upload image',
                'errors' => ['image' => ['Upload failed. Please try again.']]
            ], 500);
        }
    }

    /**
     * Serve profile image by user id & type
     */
    public function getProfileImage($type, $id)
    {
        try {
            switch (strtolower($type)) {
                case 'admin':
                    $model = Admin::find($id); break;
                case 'buyer':
                    $model = Buyer::find($id); break;
                case 'seller':
                    $model = Seller::find($id); break;
                default:
                    return response()->json(['error' => 'Invalid user type'], 404);
            }

            if (!$model) {
                return response()->json(['error' => 'User not found'], 404);
            }

            // If Cloudinary URL exists, redirect to it
            if ($model->profile_image_url) {
                return redirect($model->profile_image_url);
            }

            // Fallback to legacy BLOB data
            if (!$model->profile_image) {
                return response()->json(['error' => 'Image not found'], 404);
            }

            // Ensure we have valid binary data
            if (!is_string($model->profile_image) || strlen($model->profile_image) === 0) {
                return response()->json(['error' => 'Invalid image data'], 404);
            }

            return response($model->profile_image, 200, [
                'Content-Type' => $model->profile_image_mime ?? 'image/jpeg',
                'Cache-Control' => 'private, max-age=3600',
                'Content-Length' => strlen($model->profile_image),
            ]);
        } catch (\Exception $e) {
            \Log::error('Profile image serve error: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to serve image'], 500);
        }
    }

    /**
     * Update profile picture via base64 (frontend compatibility method)
     */
    public function updateProfilePicture(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'profile_picture' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = $request->user();
        $base64Data = $request->input('profile_picture');
        
        // Parse data URI
        if (preg_match('/^data:(image\/(?:png|jpeg|jpg|gif|webp));base64,(.*)$/i', $base64Data, $matches)) {
            $data = $matches[2];
        } else {
            return response()->json(['error' => 'Invalid image format'], 422);
        }
        
        // Decode and validate
        $decoded = base64_decode($data, true);
        if ($decoded === false) {
            return response()->json(['error' => 'Invalid base64 encoding'], 422);
        }
        
        if (strlen($decoded) > 5 * 1024 * 1024) { // 5MB
            return response()->json(['error' => 'Image exceeds 5MB limit'], 422);
        }
        
        try {
            // Delete old image from Cloudinary if exists
            if ($user->profile_image_public_id) {
                try {
                    Cloudinary::uploadApi()->destroy($user->profile_image_public_id);
                } catch (\Exception $e) {
                    \Log::warning('Failed to delete old Cloudinary image: ' . $e->getMessage());
                }
            }

            // Upload to Cloudinary
            $upload = Cloudinary::uploadApi()->upload($base64Data, [
                'folder' => 'refinedtech/profiles/' . strtolower($user->role) . 's',
                'public_id' => strtolower($user->role) . '_' . $user->id,
                'overwrite' => true,
                'transformation' => [
                    'width' => 400,
                    'height' => 400,
                    'crop' => 'fill',
                    'quality' => 'auto'
                ]
            ]);

            // Update user with Cloudinary URL and public_id
            $user->profile_image_url = $upload['secure_url'];
            $user->profile_image_public_id = $upload['public_id'];
            
            // Clear old BLOB data to save space
            $user->profile_image = null;
            $user->profile_image_mime = null;
            
            $user->save();
            
            // Return user data with profile_picture field for frontend compatibility
            $userData = $user->toArray();
            $userData['profile_picture'] = $user->profile_image_url;
            
            return response()->json([
                'message' => 'Profile picture updated successfully',
                'user' => $userData
            ], 200);
            
        } catch (\Exception $e) {
            \Log::error('Profile picture update error: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to update profile picture'], 500);
        }
    }

    /**
     * Remove profile picture (frontend compatibility method)
     */
    public function removeProfilePicture(Request $request)
    {
        $user = $request->user();
        
        $user->profile_image = null;
        $user->profile_image_mime = null;
        $user->save();
        
        // Return user data without profile_picture field
        $userData = $user->toArray();
        $userData['profile_picture'] = null;
        
        return response()->json([
            'message' => 'Profile picture removed successfully',
            'user' => $userData
        ], 200);
    }

    /**
     * Get admin's access codes information
     */
    public function getAdminAccessCode(Request $request)
    {
        $user = $request->user();

        if ($user->role !== 'Admin') {
            return response()->json(['error' => 'Only administrators can view access codes'], 403);
        }

        // Get all access codes generated by this admin
        $generatedCodes = AdminAccessCode::where('created_by_admin_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();

        // Check if admin needs new codes (less than 1 unused code)
        $unusedCount = $generatedCodes->where('is_used', false)->count();
        
        if ($unusedCount < 1) {
            // Generate 5 new codes
            $this->generateCodesForAdmin($user->id);
            // Refresh the list
            $generatedCodes = AdminAccessCode::where('created_by_admin_id', $user->id)
                ->orderBy('created_at', 'desc')
                ->get();
        }

        return response()->json([
            'access_codes' => $generatedCodes,
            'unused_count' => $generatedCodes->where('is_used', false)->count(),
            'total_count' => $generatedCodes->count(),
            'referred_count' => $this->getReferredUsersCountForAdmin($user->id)
        ], 200);
    }

    /**
     * Generate 5 new access codes for an admin
     */
    private function generateCodesForAdmin($adminId)
    {
        for ($i = 0; $i < 5; $i++) {
            do {
                $code = $this->generate6DigitCode();
            } while (AdminAccessCode::where('access_code', $code)->exists());

            AdminAccessCode::create([
                'access_code' => $code,
                'created_by_admin_id' => $adminId,
                'description' => 'Auto-generated referral code',
                'is_used' => false,
            ]);
        }
    }

    /**
     * Generate a random 6-digit code
     */
    private function generate6DigitCode()
    {
        return str_pad(random_int(100000, 999999), 6, '0', STR_PAD_LEFT);
    }

    /**
     * Get users who signed up using codes generated by this admin
     */
    public function getReferredUsers(Request $request)
    {
        $user = $request->user();

        if ($user->role !== 'Admin') {
            return response()->json(['error' => 'Only administrators can view referred users'], 403);
        }

        $referredUsers = collect();

        // Get all access codes generated by this admin
        $adminCodes = AdminAccessCode::where('created_by_admin_id', $user->id)
            ->pluck('access_code')
            ->toArray();

        if (empty($adminCodes)) {
            return response()->json([
                'users' => [],
                'total_count' => 0
            ], 200);
        }

        // Search for users who used any of these codes
        // Search in buyers table
        $buyers = \App\Models\Buyer::whereIn('admin_access_code', $adminCodes)
            ->select('id', 'name', 'email', 'created_at', 'admin_access_code')
            ->get()
            ->map(function ($buyer) {
                $buyer->user_type = 'buyer';
                return $buyer;
            });

        // Search in sellers table  
        $sellers = \App\Models\Seller::whereIn('admin_access_code', $adminCodes)
            ->select('id', 'name', 'email', 'created_at', 'admin_access_code')
            ->get()
            ->map(function ($seller) {
                $seller->user_type = 'seller';
                return $seller;
            });

        // Search in admins table (excluding the current admin)
        $admins = \App\Models\Admin::whereIn('admin_access_code', $adminCodes)
            ->where('id', '!=', $user->id)
            ->select('id', 'name', 'email', 'created_at', 'admin_access_code')
            ->get()
            ->map(function ($admin) {
                $admin->user_type = 'admin';
                return $admin;
            });

        // Merge all collections and sort by created_at
        $referredUsers = $buyers->merge($sellers)->merge($admins)->sortByDesc('created_at')->values();

        return response()->json([
            'users' => $referredUsers,
            'total_count' => $referredUsers->count()
        ], 200);
    }

    /**
     * Helper method to count referred users for a specific admin
     */
    private function getReferredUsersCountForAdmin($adminId)
    {
        // Get all access codes generated by this admin
        $adminCodes = AdminAccessCode::where('created_by_admin_id', $adminId)
            ->pluck('access_code')
            ->toArray();

        if (empty($adminCodes)) {
            return 0;
        }

        $buyerCount = \App\Models\Buyer::whereIn('admin_access_code', $adminCodes)->count();
        $sellerCount = \App\Models\Seller::whereIn('admin_access_code', $adminCodes)->count();
        $adminCount = \App\Models\Admin::whereIn('admin_access_code', $adminCodes)
            ->where('id', '!=', $adminId)
            ->count();
        
        return $buyerCount + $sellerCount + $adminCount;
    }

    /**
     * Generate new access codes for admin (manual trigger)
     */
    public function generateNewCodes(Request $request)
    {
        $user = $request->user();

        if ($user->role !== 'Admin') {
            return response()->json(['error' => 'Only administrators can generate codes'], 403);
        }

        $this->generateCodesForAdmin($user->id);

        return response()->json([
            'message' => '5 new access codes generated successfully'
        ], 200);
    }
}

