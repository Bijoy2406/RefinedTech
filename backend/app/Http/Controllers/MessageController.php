<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\ProductConversation;
use App\Models\ConversationMessage;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class MessageController extends Controller
{
    /**
     * Start a new conversation about a product
     */
    public function startConversation(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'product_id' => 'required|exists:products,id',
            'message' => 'required|string|max:2000',
            'subject' => 'nullable|string|max:255'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 400);
        }

        try {
            // Get the authenticated user and determine their type
            $user = $request->user();
            $userType = null;
            $userId = null;

            if ($user instanceof \App\Models\Buyer) {
                $userType = 'buyer';
                $userId = $user->id;
            } elseif ($user instanceof \App\Models\Seller) {
                $userType = 'seller';
                $userId = $user->id;
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Only buyers and sellers can start conversations'
                ], 403);
            }

            // Get the product and determine the other party
            $product = Product::with('seller')->findOrFail($request->product_id);

            if ($userType === 'buyer') {
                $buyerId = $userId;
                $sellerId = $product->seller_id;
            } else {
                // Seller starting conversation - this would be unusual but allowed
                $sellerId = $userId;
                $buyerId = null; // This would need to be specified differently
                return response()->json([
                    'success' => false,
                    'message' => 'Sellers cannot start conversations. Buyers must initiate contact.'
                ], 403);
            }

            // Check if conversation already exists
            $conversation = ProductConversation::where([
                'buyer_id' => $buyerId,
                'seller_id' => $sellerId,
                'product_id' => $request->product_id
            ])->first();

            if (!$conversation) {
                // Create new conversation
                $conversation = ProductConversation::create([
                    'buyer_id' => $buyerId,
                    'seller_id' => $sellerId,
                    'product_id' => $request->product_id,
                    'subject' => $request->subject ?? 'Inquiry about ' . $product->title,
                    'status' => 'active',
                    'last_message_at' => now()
                ]);
            }

            // Create the first message
            $message = ConversationMessage::create([
                'conversation_id' => $conversation->id,
                'sender_type' => $userType,
                'sender_id' => $userId,
                'message' => $request->message,
                'is_read' => false
            ]);

            // Update conversation's last message time
            $conversation->update(['last_message_at' => now()]);

            return response()->json([
                'success' => true,
                'message' => 'Conversation started successfully',
                'conversation' => $conversation->load(['product', 'buyer', 'seller']),
                'first_message' => $message
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to start conversation: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Send a message in an existing conversation
     */
    public function sendMessage(Request $request, $conversationId): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'message' => 'required|string|max:2000'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 400);
        }

        try {
            $user = $request->user();
            $userType = null;
            $userId = null;

            if ($user instanceof \App\Models\Buyer) {
                $userType = 'buyer';
                $userId = $user->id;
            } elseif ($user instanceof \App\Models\Seller) {
                $userType = 'seller';
                $userId = $user->id;
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Only buyers and sellers can send messages'
                ], 403);
            }

            // Find conversation and verify user is part of it
            $conversation = ProductConversation::findOrFail($conversationId);

            $isAuthorized = ($userType === 'buyer' && $conversation->buyer_id === $userId) ||
                           ($userType === 'seller' && $conversation->seller_id === $userId);

            if (!$isAuthorized) {
                return response()->json([
                    'success' => false,
                    'message' => 'You are not authorized to send messages in this conversation'
                ], 403);
            }

            // Create the message
            $message = ConversationMessage::create([
                'conversation_id' => $conversation->id,
                'sender_type' => $userType,
                'sender_id' => $userId,
                'message' => $request->message,
                'is_read' => false
            ]);

            // Update conversation's last message time
            $conversation->update(['last_message_at' => now()]);

            return response()->json([
                'success' => true,
                'message' => 'Message sent successfully',
                'data' => $message->load('sender')
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to send message: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all conversations for the authenticated user
     */
    public function getConversations(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            $userType = null;
            $userId = null;

            if ($user instanceof \App\Models\Buyer) {
                $userType = 'buyer';
                $userId = $user->id;
            } elseif ($user instanceof \App\Models\Seller) {
                $userType = 'seller';
                $userId = $user->id;
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Only buyers and sellers can view conversations'
                ], 403);
            }

            $query = ProductConversation::with(['product', 'buyer', 'seller', 'latestMessage'])
                ->orderBy('last_message_at', 'desc');

            if ($userType === 'buyer') {
                $query->where('buyer_id', $userId);
            } else {
                $query->where('seller_id', $userId);
            }

            $conversations = $query->get();

            // Add unread count for each conversation
            $conversations->each(function ($conversation) use ($userType, $userId) {
                $conversation->unread_count = $conversation->getUnreadCountForUser($userType, $userId);
            });

            return response()->json([
                'success' => true,
                'conversations' => $conversations
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get conversations: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get messages for a specific conversation
     */
    public function getMessages(Request $request, $conversationId): JsonResponse
    {
        try {
            $user = $request->user();
            $userType = null;
            $userId = null;

            if ($user instanceof \App\Models\Buyer) {
                $userType = 'buyer';
                $userId = $user->id;
            } elseif ($user instanceof \App\Models\Seller) {
                $userType = 'seller';
                $userId = $user->id;
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Only buyers and sellers can view messages'
                ], 403);
            }

            // Find conversation and verify user is part of it
            $conversation = ProductConversation::with(['product', 'buyer', 'seller'])
                ->findOrFail($conversationId);

            $isAuthorized = ($userType === 'buyer' && $conversation->buyer_id === $userId) ||
                           ($userType === 'seller' && $conversation->seller_id === $userId);

            if (!$isAuthorized) {
                return response()->json([
                    'success' => false,
                    'message' => 'You are not authorized to view this conversation'
                ], 403);
            }

            // Get messages with pagination
            $page = $request->get('page', 1);
            $perPage = $request->get('per_page', 20);

            $messages = ConversationMessage::where('conversation_id', $conversationId)
                ->orderBy('created_at', 'asc')
                ->paginate($perPage, ['*'], 'page', $page);

            // Mark messages as read for the current user
            $conversation->markAsReadForUser($userType, $userId);

            return response()->json([
                'success' => true,
                'conversation' => $conversation,
                'messages' => $messages
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get messages: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mark conversation as read
     */
    public function markAsRead(Request $request, $conversationId): JsonResponse
    {
        try {
            $user = $request->user();
            $userType = null;
            $userId = null;

            if ($user instanceof \App\Models\Buyer) {
                $userType = 'buyer';
                $userId = $user->id;
            } elseif ($user instanceof \App\Models\Seller) {
                $userType = 'seller';
                $userId = $user->id;
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Only buyers and sellers can mark messages as read'
                ], 403);
            }

            $conversation = ProductConversation::findOrFail($conversationId);

            $isAuthorized = ($userType === 'buyer' && $conversation->buyer_id === $userId) ||
                           ($userType === 'seller' && $conversation->seller_id === $userId);

            if (!$isAuthorized) {
                return response()->json([
                    'success' => false,
                    'message' => 'You are not authorized to modify this conversation'
                ], 403);
            }

            $conversation->markAsReadForUser($userType, $userId);

            return response()->json([
                'success' => true,
                'message' => 'Conversation marked as read'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to mark as read: ' . $e->getMessage()
            ], 500);
        }
    }
}
