<?php

namespace App\Services;

use App\Models\Product;
use App\Models\Seller;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ChatbotService
{
    protected $geminiApiKey;
    protected $geminiApiUrl;

    public function __construct()
    {
        $this->geminiApiKey = config('chatbot.gemini.api_key');
        $this->geminiApiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/' . 
                              config('chatbot.gemini.model', 'gemini-pro') . ':generateContent';
    }

    /**
     * Get the appropriate frontend URL based on request origin
     */
    private function getFrontendUrl(): string
    {
        $request = request();
        $origin = $request->headers->get('Origin');
        
        // If request comes from production Netlify domain, use production URL
        if ($origin === 'https://refinedtech.netlify.app') {
            return config('chatbot.website_info.frontend_url_production', 'https://refinedtech.netlify.app');
        }
        
        // If request comes from Railway backend (API calls), use production URL
        if (str_contains($request->getHost(), '.up.railway.app')) {
            return config('chatbot.website_info.frontend_url_production', 'https://refinedtech.netlify.app');
        }
        
        // Otherwise use the default (localhost)
        return config('chatbot.website_info.frontend_url', 'http://localhost:5173');
    }

    /**
     * Process user message and generate response
     */
    public function processMessage(string $message): string
    {
        // Check if this is a predefined query
        $predefinedResponse = $this->handlePredefinedQueries($message);
        if ($predefinedResponse) {
            return $predefinedResponse;
        }

        // Prepare context about the website and products
        $context = $this->prepareContext($message);
        
        // Create prompt for Gemini
        $prompt = $this->createPrompt($message, $context);
        
        // Call Gemini API
        $response = $this->callGeminiApi($prompt);
        
        return $response;
    }

    /**
     * Handle predefined quick queries
     */
    private function handlePredefinedQueries(string $message): ?string
    {
        $message = strtolower(trim($message));
        
        switch ($message) {
            case 'show_highlights':
            case 'top_products':
            case 'featured_products':
                return $this->getHighlightedProducts();
                
            case 'how_to_buy':
            case 'buying_guide':
                return $this->getBuyingGuide();
                
            case 'how_to_sell':
            case 'selling_guide':
                return $this->getSellingGuide();
                
            case 'categories':
            case 'browse_categories':
                return $this->getCategoriesInfo();
                
            case 'about_us':
            case 'about_refinedtech':
                return $this->getAboutInfo();
                
            case 'contact_support':
            case 'help':
                return $this->getContactInfo();
                
            case 'warranty_info':
                return $this->getWarrantyInfo();
                
            case 'shipping_info':
                return $this->getShippingInfo();
                
            default:
                return null;
        }
    }

    /**
     * Prepare context based on user message
     */
    private function prepareContext(string $message): array
    {
        $context = [
            'website_info' => $this->getWebsiteInfo(),
            'products' => [],
            'categories' => $this->getCategories()
        ];

        // Always search for products to provide context to Gemini
        // This allows for intelligent product recommendations even when
        // the user doesn't explicitly ask about products
        $relevantProducts = $this->getRelevantProducts($message);
        
        if (!empty($relevantProducts)) {
            $context['products'] = $relevantProducts;
            $context['has_product_matches'] = true;
        } else {
            $context['has_product_matches'] = false;
        }

        return $context;
    }

    /**
     * Get website information
     */
    private function getWebsiteInfo(): array
    {
        return [
            'name' => config('chatbot.website_info.name', 'RefinedTech'),
            'description' => config('chatbot.website_info.description', 'A marketplace for buying and selling refurbished and pre-owned technology products'),
            'contact_email' => config('chatbot.website_info.contact_email'),
            'support_hours' => config('chatbot.website_info.support_hours'),
            'features' => [
                'User registration as Buyer, Seller, or Admin',
                'Product listings with detailed specifications',
                'Shopping cart and wishlist functionality',
                'Order management system',
                'Messaging system between buyers and sellers',
                'Profile management with image upload',
                'Admin panel for user and product management',
                'Secure authentication with Laravel Sanctum'
            ],
            'user_types' => [
                'Buyers' => 'Can browse, purchase products, manage cart and wishlist, communicate with sellers',
                'Sellers' => 'Can list products, manage inventory, fulfill orders, communicate with buyers',
                'Admins' => 'Can manage users, oversee platform operations, generate access codes'
            ]
        ];
    }

    /**
     * Get product categories
     */
    private function getCategories(): array
    {
        return Product::select('category')
            ->distinct()
            ->whereNotNull('category')
            ->where('status', 'active')
            ->pluck('category')
            ->toArray();
    }

    /**
     * Check if message is about products
     */
    private function isProductQuery(string $message): bool
    {
        $productKeywords = config('chatbot.product_keywords', [
            'product', 'buy', 'sell', 'price', 'cost', 'available', 'stock',
            'phone', 'laptop', 'computer', 'tablet', 'smartphone', 'device',
            'apple', 'samsung', 'google', 'dell', 'hp', 'lenovo', 'sony',
            'refurbished', 'used', 'pre-owned', 'condition', 'warranty'
        ]);

        $message = strtolower($message);
        foreach ($productKeywords as $keyword) {
            if (strpos($message, $keyword) !== false) {
                return true;
            }
        }

        return false;
    }

    /**
     * Get relevant products based on user query
     */
    private function getRelevantProducts(string $message): array
    {
        $originalMessage = $message;
        $message = strtolower($message);
        
        // Try multiple search strategies to find the most relevant products
        $searchTerms = $this->extractSearchTerms($message);
        
        // Strategy 1: Exact match search (highest priority)
        $exactMatches = $this->searchProductsExact($searchTerms, $message);
        
        // Strategy 2: If no exact matches, do broader search
        if (empty($exactMatches)) {
            $broadMatches = $this->searchProductsBroad($searchTerms, $message);
            return $broadMatches;
        }
        
        return $exactMatches;
    }

    /**
     * Search for exact or very close matches
     */
    private function searchProductsExact(array $searchTerms, string $message): array
    {
        $query = Product::with('seller:id,name')
            ->where('status', 'active')
            ->where('quantity_available', '>', 0);

        if (!empty($searchTerms)) {
            // Use AND logic for more precise matching
            $query->where(function ($q) use ($searchTerms) {
                foreach ($searchTerms as $term) {
                    $q->where(function ($subQ) use ($term) {
                        $subQ->where('title', 'ILIKE', "%{$term}%")
                             ->orWhere('brand', 'ILIKE', "%{$term}%")
                             ->orWhere('model', 'ILIKE', "%{$term}%");
                    });
                }
            });
        } else {
            // Direct string search
            $query->where(function ($q) use ($message) {
                $q->where('title', 'ILIKE', "%{$message}%")
                  ->orWhere('brand', 'ILIKE', "%{$message}%")
                  ->orWhere('model', 'ILIKE', "%{$message}%");
            });
        }

        // Get more results for exact matching, then prioritize
        $maxResults = config('chatbot.behavior.max_search_results', 200);
        $products = $query->limit($maxResults)->get();
        
        // Sort by relevance - exact title matches first, then brand, then model
        $sortedProducts = $products->sortByDesc(function ($product) use ($searchTerms, $message) {
            $score = 0;
            $title = strtolower($product->title);
            $brand = strtolower($product->brand ?? '');
            $model = strtolower($product->model ?? '');
            
            // Check for exact matches in title
            foreach ($searchTerms as $term) {
                if (strpos($title, $term) !== false) $score += 10;
                if (strpos($brand, $term) !== false) $score += 8;
                if (strpos($model, $term) !== false) $score += 6;
            }
            
            // Bonus for multiple term matches
            if (count($searchTerms) > 1) {
                $matchCount = 0;
                foreach ($searchTerms as $term) {
                    if (strpos($title . ' ' . $brand . ' ' . $model, $term) !== false) {
                        $matchCount++;
                    }
                }
                if ($matchCount >= count($searchTerms)) $score += 20;
            }
            
            return $score;
        });

        return $this->formatProductResults($sortedProducts->take(5));
    }

    /**
     * Search with broader criteria
     */
    private function searchProductsBroad(array $searchTerms, string $message): array
    {
        $query = Product::with('seller:id,name')
            ->where('status', 'active')
            ->where('quantity_available', '>', 0);

        if (!empty($searchTerms)) {
            // Use OR logic for broader matching
            $query->where(function ($q) use ($searchTerms) {
                foreach ($searchTerms as $term) {
                    $q->orWhere('title', 'ILIKE', "%{$term}%")
                      ->orWhere('description', 'ILIKE', "%{$term}%")
                      ->orWhere('brand', 'ILIKE', "%{$term}%")
                      ->orWhere('model', 'ILIKE', "%{$term}%")
                      ->orWhere('category', 'ILIKE', "%{$term}%")
                      ->orWhere('subcategory', 'ILIKE', "%{$term}%");
                }
            });
        } else {
            // Fallback to general search
            $query->where(function ($q) use ($message) {
                $q->where('title', 'ILIKE', "%{$message}%")
                  ->orWhere('description', 'ILIKE', "%{$message}%")
                  ->orWhere('brand', 'ILIKE', "%{$message}%")
                  ->orWhere('category', 'ILIKE', "%{$message}%")
                  ->orWhere('subcategory', 'ILIKE', "%{$message}%");
            });
        }

        // Increase search limit to catch more products
                // Get a larger set for broad matching
        $maxResults = config('chatbot.behavior.max_search_results', 50);
        $products = $query->limit($maxResults)->get();
        
        return $this->formatProductResults($products->take(5));
    }

    /**
     * Format product results consistently
     */
    private function formatProductResults($products): array
    {
        return $products->map(function ($product) {
            return [
                'id' => $product->id,
                'title' => $product->title,
                'description' => substr($product->description, 0, 200),
                'price' => $product->price,
                'original_price' => $product->original_price,
                'discount_percentage' => $product->discount_percentage,
                'category' => $product->category,
                'subcategory' => $product->subcategory,
                'brand' => $product->brand,
                'model' => $product->model,
                'condition_grade' => $product->condition_grade,
                'condition_description' => $product->condition_description,
                'warranty_period' => $product->warranty_period,
                'seller_name' => $product->seller->name ?? 'Unknown',
                'location' => $product->location_city,
                'is_featured' => $product->is_featured,
                'is_urgent_sale' => $product->is_urgent_sale,
                'negotiable' => $product->negotiable,
                'link' => $this->getFrontendUrl() . '/product/' . $product->id
            ];
        })->toArray();
    }

    /**
     * Extract meaningful search terms from user message
     */
    private function extractSearchTerms(string $message): array
    {
        // Common words to ignore
        $stopWords = ['the', 'is', 'at', 'which', 'on', 'what', 'price', 'cost', 'how', 'much', 'does', 'do', 'you', 'have', 'any', 'show', 'me', 'find', 'looking', 'for', 'want', 'need', 'buy', 'purchase', 'get', 'about', 'of', 'a', 'an', 'and', 'or', 'but', 'in', 'with', 'to', 'from'];
        
        // Extract words from message
        $words = preg_split('/\s+/', strtolower($message));
        $words = array_filter($words, function($word) use ($stopWords) {
            return strlen($word) > 2 && !in_array($word, $stopWords);
        });

        // Look for brand names, model numbers, and product types
        $brandKeywords = ['samsung', 'apple', 'iphone', 'galaxy', 'google', 'pixel', 'oneplus', 'xiaomi', 'oppo', 'vivo', 'huawei', 'sony', 'lg', 'motorola', 'nokia', 'dell', 'hp', 'lenovo', 'asus', 'acer', 'macbook', 'ipad'];
        $productTypes = ['smartphone', 'phone', 'laptop', 'tablet', 'computer', 'desktop', 'monitor', 'headphones', 'earbuds', 'watch', 'smartwatch'];
        
        $searchTerms = [];
        
        foreach ($words as $word) {
            if (in_array($word, $brandKeywords) || in_array($word, $productTypes) || preg_match('/^[a-z0-9]+$/i', $word)) {
                $searchTerms[] = $word;
            }
        }

        return array_unique($searchTerms);
    }

    /**
     * Create prompt for Gemini API
     */
    private function createPrompt(string $userMessage, array $context): string
    {
        $websiteInfo = json_encode($context['website_info'], JSON_PRETTY_PRINT);
        $products = json_encode($context['products'], JSON_PRETTY_PRINT);
        $categories = implode(', ', $context['categories']);
        $hasProducts = !empty($context['products']);
        $hasProductMatches = $context['has_product_matches'] ?? false;

        $prompt = "You are a helpful customer service chatbot for RefinedTech, a marketplace for refurbished and pre-owned technology products. 

IMPORTANT GUIDELINES:
- Only answer questions about RefinedTech, its products, features, and services
- Do NOT answer questions outside the scope of this website
- If asked about unrelated topics, politely redirect the conversation back to RefinedTech
- Be friendly, helpful, and professional
- When relevant products are found, ALWAYS provide detailed product information
- Help users discover products they might be interested in

WEBSITE INFORMATION:
{$websiteInfo}

AVAILABLE CATEGORIES:
{$categories}";

        if ($hasProducts) {
            $prompt .= "

PRODUCT SEARCH RESULTS:
{$products}

CRITICAL PRODUCT RESPONSE INSTRUCTIONS:
- If the user mentions ANY product name, brand, or model (like 'Canon EOS R6', 'iPhone', 'Samsung', etc.), and we have matching products, ALWAYS show detailed product information
- You don't need the user to explicitly ask for 'price' or 'details' - if they mention a product and we have it, show it!
- Always include the exact price from the product data with ৳ symbol (e.g., ৳599.99)
- If a product has original_price and discount_percentage, mention the savings
- Include key details like condition_grade, brand, model, warranty_period
- ALWAYS include a clickable link at the end using this EXACT format: [View Product Details](product_link_url)
- If multiple products match, show the most relevant ones with their clickable links
- Mention the seller's location if available
- If the product is negotiable, mention that the price may be negotiable
- If it's featured or urgent sale, mention those highlights

EXAMPLES OF WHEN TO SHOW PRODUCT DETAILS:
- User: 'Canon EOS R6' → Show Canon EOS R6 details if available
- User: 'Do you have iPhone?' → Show available iPhone models
- User: 'Samsung Galaxy' → Show Samsung Galaxy products
- User: 'Tell me about MacBook' → Show MacBook details
- User: 'Lenovo laptop' → Show Lenovo laptop options

EXAMPLE RESPONSE FORMAT:
'I found the Samsung Galaxy S22 Ultra you're looking for! 

📱 **Samsung Galaxy S22 Ultra** - ৳899.99
- Condition: Excellent (Grade A)
- Original Price: ৳1,199.99 (You save 25%!)
- 12-month warranty included
- Seller: TechDeals Pro (New York)
- Price is negotiable

This device is in excellent condition with minimal signs of use. Perfect for photography enthusiasts with its advanced camera system.

[View Product Details](http://localhost:5173/product/123)'";
        }

        $prompt .= "

USER QUESTION: {$userMessage}

Please provide a helpful response about RefinedTech. 

RESPONSE GUIDELINES:
- If specific products were found in the search results above, prioritize showing those product details
- If no products match but the user seems interested in a category, suggest they browse our categories or use our search feature
- Only mention featured/highlighted products if the user specifically asks for recommendations, highlights, or 'what do you recommend'
- For general questions, focus on answering what they asked without pushing products
- Always be helpful and informative about RefinedTech's services and features

QUICK ACTIONS AVAILABLE:
Users can ask for: 'show highlights', 'how to buy', 'how to sell', 'categories', 'about us', 'contact support', 'warranty info', 'shipping info'";

        return $prompt;
    }

    /**
     * Call Gemini API
     */
    private function callGeminiApi(string $prompt): string
    {
        try {
            $config = config('chatbot.gemini');
            $timeout = config('chatbot.behavior.response_timeout', 30);
            
            // For development environment, disable SSL verification to avoid certificate issues
            $httpClient = Http::timeout($timeout);
            if (config('app.env') === 'local') {
                // Try to use the cacert.pem file if it exists, otherwise disable verification
                $cacertPath = base_path('cacert.pem');
                if (file_exists($cacertPath)) {
                    $httpClient = $httpClient->withOptions([
                        'verify' => $cacertPath
                    ]);
                } else {
                    $httpClient = $httpClient->withOptions([
                        'verify' => false
                    ]);
                }
            }
            
            $response = $httpClient->post($this->geminiApiUrl . '?key=' . $this->geminiApiKey, [
                'contents' => [
                    [
                        'parts' => [
                            ['text' => $prompt]
                        ]
                    ]
                ],
                'generationConfig' => [
                    'temperature' => $config['temperature'] ?? 0.7,
                    'topK' => $config['top_k'] ?? 40,
                    'topP' => $config['top_p'] ?? 0.95,
                    'maxOutputTokens' => $config['max_output_tokens'] ?? 1024,
                ]
            ]);

            if ($response->successful()) {
                $data = $response->json();
                
                if (isset($data['candidates'][0]['content']['parts'][0]['text'])) {
                    return $data['candidates'][0]['content']['parts'][0]['text'];
                }
            }

            // Handle specific API errors
            $statusCode = $response->status();
            $responseBody = $response->body();
            
            Log::error('Gemini API Error', [
                'status' => $statusCode,
                'response' => $responseBody
            ]);

            // Provide more specific error messages
            if ($statusCode === 429) {
                // If quota exceeded, try to provide basic product info without AI
                if (!empty($context['products'])) {
                    return $this->createFallbackProductResponse($context['products']);
                }
                return "I'm currently experiencing high demand. Our AI service quota has been temporarily exceeded. Please try again in a few minutes, or contact support if this continues.";
            } elseif ($statusCode === 401 || $statusCode === 403) {
                return "I'm having authentication issues with our AI service. Please contact support to resolve this issue.";
            } elseif ($statusCode >= 500) {
                return "Our AI service is temporarily unavailable. Please try again in a moment.";
            }

            return "I'm sorry, I'm experiencing some technical difficulties right now. Please try again in a moment.";

        } catch (\Exception $e) {
            Log::error('Chatbot Service Error: ' . $e->getMessage());
            return "I'm sorry, I'm having trouble connecting to our AI service right now. Please try again later.";
        }
    }

    /**
     * Create a basic product response when AI service is unavailable
     */
    private function createFallbackProductResponse(array $products): string
    {
        if (empty($products)) {
            return "I found some products that might interest you, but I'm unable to provide detailed descriptions right now due to high demand. Please try again in a few minutes.";
        }

        $response = "I found " . count($products) . " product(s) for you:\n\n";
        
        foreach (array_slice($products, 0, 3) as $product) {
            $response .= "📱 **{$product['title']}** - ৳{$product['price']}\n";
            if (!empty($product['condition_grade'])) {
                $response .= "- Condition: {$product['condition_grade']}\n";
            }
            if (!empty($product['brand'])) {
                $response .= "- Brand: {$product['brand']}\n";
            }
            $response .= "\n[View Product Details]({$product['link']})\n\n";
        }
        
        $response .= "Note: Our AI assistant is currently experiencing high demand. For detailed product descriptions and personalized recommendations, please try again in a few minutes.";
        
        return $response;
    }

    /**
     * Get highlighted/featured products
     */
    private function getHighlightedProducts(): string
    {
        $featuredProducts = Product::with('seller:id,name')
            ->where('status', 'active')
            ->where('quantity_available', '>', 0)
            ->orderBy('created_at', 'desc')
            ->limit(3)
            ->get();

        if ($featuredProducts->isEmpty()) {
            return "We currently don't have any featured products available. Please check back later or browse our categories!";
        }

        $response = "🌟 **Here are our top featured products:**\n\n";
        
        foreach ($featuredProducts as $product) {
            $frontendUrl = $this->getFrontendUrl();
            $productLink = $frontendUrl . '/product/' . $product->id;
            
            $response .= "**{$product->title}** - ৳{$product->price}\n";
            $response .= "- Condition: {$product->condition_grade} ({$product->condition_notes})\n";
            
            if ($product->original_price > $product->price) {
                $savings = round((($product->original_price - $product->price) / $product->original_price) * 100, 2);
                $response .= "- Original Price: ৳{$product->original_price} (You save {$savings}%!)\n";
            }
            
            $response .= "- {$product->warranty_period} warranty included\n";
            $response .= "- Seller: {$product->seller->name}\n";
            
            if ($product->price_negotiable) {
                $response .= "- Price is negotiable\n";
            }
            
            $response .= "\n[View Product Details]({$productLink})\n\n";
        }
        
        return $response;
    }

    /**
     * Get buying guide information
     */
    private function getBuyingGuide(): string
    {
        return "🛒 **How to Buy on RefinedTech:**\n\n" .
               "1. **Browse Products** - Use our categories or search to find what you need\n" .
               "2. **Check Details** - Review product condition, seller info, and warranty\n" .
               "3. **Add to Cart** - Click 'Add to Cart' or 'Add to Wishlist'\n" .
               "4. **Contact Seller** - Use our messaging system for questions\n" .
               "5. **Place Order** - Complete your purchase through our secure checkout\n" .
               "6. **Track Order** - Monitor your order status in your account\n\n" .
               "💡 **Tips:**\n" .
               "- Check seller ratings and reviews\n" .
               "- Ask about warranty and return policies\n" .
               "- Compare prices with similar products\n" .
               "- Use our wishlist to save items for later\n\n" .
               "Need help? Contact our support team!";
    }

    /**
     * Get selling guide information
     */
    private function getSellingGuide(): string
    {
        return "💼 **How to Sell on RefinedTech:**\n\n" .
               "1. **Register as Seller** - Sign up with seller account\n" .
               "2. **Get Approved** - Wait for admin approval (usually 24-48 hours)\n" .
               "3. **List Products** - Add detailed product information\n" .
               "4. **Upload Photos** - Use high-quality images\n" .
               "5. **Set Fair Prices** - Research market prices\n" .
               "6. **Manage Orders** - Respond to buyer inquiries promptly\n" .
               "7. **Ship Products** - Use reliable shipping methods\n\n" .
               "📋 **Required Information:**\n" .
               "- Product title and description\n" .
               "- Condition grade and notes\n" .
               "- Original and selling price\n" .
               "- Warranty information\n" .
               "- Clear photos from multiple angles\n\n" .
               "🎯 **Best Practices:**\n" .
               "- Be honest about product condition\n" .
               "- Respond to messages within 24 hours\n" .
               "- Offer fair prices and negotiate respectfully\n" .
               "- Package items securely for shipping";
    }

    /**
     * Get categories information
     */
    private function getCategoriesInfo(): string
    {
        $categories = $this->getCategories();
        
        $response = "📱 **Browse Our Categories:**\n\n";
        
        if (!empty($categories)) {
            foreach ($categories as $category) {
                $response .= "• **{$category}**\n";
            }
        } else {
            $response .= "• Smartphones\n";
            $response .= "• Laptops\n";
            $response .= "• Tablets\n";
            $response .= "• Desktop Computers\n";
            $response .= "• Gaming\n";
            $response .= "• Smart Watches\n";
            $response .= "• Audio & Headphones\n";
            $response .= "• Cameras\n";
            $response .= "• Accessories\n";
        }
        
        $response .= "\n🔍 **How to Browse:**\n";
        $response .= "- Click on any category to see available products\n";
        $response .= "- Use filters to narrow down your search\n";
        $response .= "- Sort by price, condition, or newest listings\n";
        $response .= "- Use the search bar for specific items\n\n";
        $response .= "💡 Can't find what you're looking for? Try searching with different keywords or contact our support team!";
        
        return $response;
    }

    /**
     * Get about us information
     */
    private function getAboutInfo(): string
    {
        return "🏢 **About RefinedTech**\n\n" .
               "RefinedTech is your trusted marketplace for refurbished and pre-owned technology products. We connect buyers and sellers in a secure, reliable environment.\n\n" .
               "🎯 **Our Mission:**\n" .
               "To make quality technology accessible and affordable while promoting sustainable consumption.\n\n" .
               "✨ **Why Choose RefinedTech:**\n" .
               "• Verified sellers and products\n" .
               "• Secure payment system\n" .
               "• Warranty on all products\n" .
               "• Direct communication with sellers\n" .
               "• Quality assurance standards\n" .
               "• Competitive pricing\n\n" .
               "🌱 **Sustainability:**\n" .
               "By buying refurbished products, you're helping reduce electronic waste and supporting a circular economy.\n\n" .
               "📞 **Contact Us:**\n" .
               "Email: support@refinedtech.com\n" .
               "Hours: 9 AM - 6 PM EST, Monday - Friday";
    }

    /**
     * Get contact support information
     */
    private function getContactInfo(): string
    {
        return "📞 **Need Help? We're Here for You!**\n\n" .
               "🎧 **Support Team:**\n" .
               "Email: support@refinedtech.com\n" .
               "Response Time: Usually within 24 hours\n" .
               "Hours: 9 AM - 6 PM EST, Monday - Friday\n\n" .
               "💬 **Common Questions:**\n" .
               "• Product inquiries - Use our messaging system to contact sellers directly\n" .
               "• Order issues - Check your order status in your account\n" .
               "• Account problems - Email us with your account details\n" .
               "• Technical issues - Describe the problem and include screenshots\n\n" .
               "🔧 **Self-Help Options:**\n" .
               "• Check our FAQ section\n" .
               "• Browse product categories\n" .
               "• Use the search function\n" .
               "• Review your order history\n\n" .
               "⚡ **Quick Tip:** For faster support, include your order number or username when contacting us!";
    }

    /**
     * Get warranty information
     */
    private function getWarrantyInfo(): string
    {
        return "🛡️ **Warranty Information**\n\n" .
               "All products on RefinedTech come with warranty coverage!\n\n" .
               "📋 **Warranty Types:**\n" .
               "• **3-month warranty** - Standard on most items\n" .
               "• **6-month warranty** - Available on select products\n" .
               "• **1-year warranty** - Premium items and newer products\n\n" .
               "✅ **What's Covered:**\n" .
               "• Manufacturing defects\n" .
               "• Hardware malfunctions\n" .
               "• Battery issues (for applicable devices)\n" .
               "• Screen defects\n\n" .
               "❌ **What's NOT Covered:**\n" .
               "• Physical damage from drops or water\n" .
               "• Software issues\n" .
               "• Normal wear and tear\n" .
               "• Damage from misuse\n\n" .
               "📞 **Warranty Claims:**\n" .
               "1. Contact the seller first\n" .
               "2. Provide order details and issue description\n" .
               "3. Follow seller's return/exchange process\n" .
               "4. Contact support if needed\n\n" .
               "💡 Always check the specific warranty terms for each product before purchasing!";
    }

    /**
     * Get shipping information
     */
    private function getShippingInfo(): string
    {
        return "🚚 **Shipping Information**\n\n" .
               "Shipping is handled directly by our sellers to ensure the best service!\n\n" .
               "📦 **Shipping Process:**\n" .
               "1. **Order Placed** - Seller receives notification\n" .
               "2. **Processing** - Seller prepares your item (1-2 business days)\n" .
               "3. **Shipped** - You receive tracking information\n" .
               "4. **Delivered** - Usually within 3-7 business days\n\n" .
               "💰 **Shipping Costs:**\n" .
               "• Varies by seller and location\n" .
               "• Displayed at checkout\n" .
               "• Some sellers offer free shipping\n" .
               "• Local pickup may be available\n\n" .
               "📍 **Delivery Areas:**\n" .
               "• Nationwide delivery available\n" .
               "• International shipping varies by seller\n" .
               "• Express delivery options available\n\n" .
               "📋 **Shipping Tips:**\n" .
               "• Provide accurate delivery address\n" .
               "• Check seller's shipping policies\n" .
               "• Track your package using provided tracking number\n" .
               "• Contact seller for shipping updates\n\n" .
               "⚠️ **Note:** Shipping times may vary during holidays or peak seasons.";
    }
}