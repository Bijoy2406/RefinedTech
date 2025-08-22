<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Buyer;
use App\Models\Seller;
use App\Models\Admin;
use App\Models\AdminAccessCode;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    /**
     * Get all approved users from all tables
     */
    public function getUsers()
    {
        $users = collect();
        
        // Get approved buyers
        $buyers = Buyer::where('status', 'approved')
                      ->get(['id', 'name', 'email', 'status', 'created_at', 'updated_at'])
                      ->map(function($buyer) {
                          $buyer->role = 'Buyer';
                          $buyer->table_type = 'buyers';
                          return $buyer;
                      });
        
        // Get approved sellers
        $sellers = Seller::where('status', 'approved')
                         ->get(['id', 'name', 'email', 'status', 'created_at', 'updated_at'])
                         ->map(function($seller) {
                             $seller->role = 'Seller';
                             $seller->table_type = 'sellers';
                             return $seller;
                         });
        
        // Get approved admins
        $admins = Admin::where('status', 'approved')
                      ->get(['id', 'name', 'email', 'status', 'created_at', 'updated_at'])
                      ->map(function($admin) {
                          $admin->role = 'Admin';
                          $admin->table_type = 'admins';
                          return $admin;
                      });
        
        $users = $buyers->merge($sellers)->merge($admins);
        
        return response()->json([
            'users' => $users,
            'total' => $users->count(),
            'buyers' => $buyers->count(),
            'sellers' => $sellers->count(),
            'admins' => $admins->count()
        ]);
    }

    /**
     * Get all pending users from all tables
     */
    public function getPendingUsers()
    {
        $pendingUsers = collect();
        
        // Get pending buyers
        $buyers = Buyer::where('status', 'pending')
                      ->get(['id', 'name', 'email', 'status', 'created_at', 'updated_at'])
                      ->map(function($buyer) {
                          $buyer->role = 'Buyer';
                          $buyer->table_type = 'buyers';
                          return $buyer;
                      });
        
        // Get pending sellers
        $sellers = Seller::where('status', 'pending')
                         ->get(['id', 'name', 'email', 'status', 'created_at', 'updated_at'])
                         ->map(function($seller) {
                             $seller->role = 'Seller';
                             $seller->table_type = 'sellers';
                             return $seller;
                         });
        
        // Get pending admins
        $admins = Admin::where('status', 'pending')
                      ->get(['id', 'name', 'email', 'status', 'created_at', 'updated_at'])
                      ->map(function($admin) {
                          $admin->role = 'Admin';
                          $admin->table_type = 'admins';
                          return $admin;
                      });
        
        $pendingUsers = $buyers->merge($sellers)->merge($admins);
        
        return response()->json([
            'pending_users' => $pendingUsers,
            'total' => $pendingUsers->count(),
            'buyers' => $buyers->count(),
            'sellers' => $sellers->count(),
            'admins' => $admins->count()
        ]);
    }

    /**
     * Approve a user by role and ID
     */
    public function approveUser(Request $request, $role, $id)
    {
        $user = $this->findUserByRoleAndId($role, $id);
        
        if (!$user) {
            return response()->json(['message' => 'User not found.'], 404);
        }
        
        $user->update(['status' => 'approved']);
        
        // If the approved user is an admin, automatically generate multiple access codes for them
        if ($role === 'Admin') {
            // Generate 3 access codes for the new admin
            $accessCodes = AdminAccessCode::generateMultipleCodesForNewAdmin($user->id, 3);
            
            return response()->json([
                'message' => 'Admin approved successfully. 3 admin access codes have been generated.',
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $role,
                    'status' => $user->status
                ],
                'generated_codes' => $accessCodes->map(function($code) {
                    return [
                        'access_code' => $code->access_code,
                        'description' => $code->description
                    ];
                })
            ]);
        }
        
        return response()->json([
            'message' => ucfirst($role) . ' approved successfully.',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $role,
                'status' => $user->status
            ]
        ]);
    }

    /**
     * Reject a user by role and ID
     */
    public function rejectUser(Request $request, $role, $id)
    {
        $user = $this->findUserByRoleAndId($role, $id);
        
        if (!$user) {
            return response()->json(['message' => 'User not found.'], 404);
        }
        
        $user->update(['status' => 'rejected']);
        
        return response()->json([
            'message' => ucfirst($role) . ' rejected successfully.',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $role,
                'status' => $user->status
            ]
        ]);
    }

    /**
     * Get specific user details by role and ID
     */
    public function getUserDetails(Request $request, $role, $id)
    {
        $user = $this->findUserByRoleAndId($role, $id);
        
        if (!$user) {
            return response()->json(['message' => 'User not found.'], 404);
        }
        
        $user->role = ucfirst($role);
        
        return response()->json([
            'user' => $user
        ]);
    }

    /**
     * Find user by role and ID
     */
    private function findUserByRoleAndId($role, $id)
    {
        switch (strtolower($role)) {
            case 'buyer':
                return Buyer::find($id);
            case 'seller':
                return Seller::find($id);
            case 'admin':
                return Admin::find($id);
            default:
                return null;
        }
    }

    /**
     * Get available admin access codes for distribution
     * Only accessible by admins
     */
    public function getAvailableAccessCodes(Request $request)
    {
        $user = $request->user();
        
        if ($user->role !== 'Admin') {
            return response()->json(['error' => 'Only administrators can view access codes'], 403);
        }

        // Get all unused access codes created by the current admin
        $myCodes = AdminAccessCode::where('created_by_admin_id', $user->id)
                                  ->where('is_used', false)
                                  ->get(['access_code', 'description', 'created_at']);

        // Get some general available codes (for distribution purposes)
        $availableCodes = AdminAccessCode::where('is_used', false)
                                         ->get(['access_code', 'description', 'created_by_admin_id', 'created_at']);

        return response()->json([
            'success' => true,
            'my_codes' => $myCodes,
            'codes' => $availableCodes,
            'total_unused_codes' => $availableCodes->count()
        ]);
    }
}
