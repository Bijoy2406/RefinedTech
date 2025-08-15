<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    public function getUsers()
    {
        $users = User::where('status', 'approved')
                       ->whereIn('role', ['admin', 'seller'])
                       ->get();
        return response()->json($users);
    }

    public function getPendingUsers()
    {
        $users = User::where('status', 'pending')->get();
        return response()->json($users);
    }

    public function approveUser(User $user)
    {
        $user->update(['status' => 'approved']);
        return response()->json(['message' => 'User approved successfully.']);
    }

    public function rejectUser(User $user)
    {
        $user->update(['status' => 'rejected']);
        return response()->json(['message' => 'User rejected successfully.']);
    }
}
