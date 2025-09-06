<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;
use App\Models\Seller;
use Illuminate\Support\Str;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Ensure a deterministic seed seller exists
        $seller = Seller::firstOrCreate(
            ['email' => 'seed.seller@refinedtech.local'],
            [
                'name' => 'Seed Seller',
                'first_name' => 'Seed',
                'last_name' => 'Seller',
                'password' => 'password', // hashed by model cast
                'country' => 'Bangladesh',
                'phone_number' => '+8801700000000',
                'shop_username' => 'SeedShop',
                'business_address' => 'Seed Plaza, Dhaka',
                'status' => 'approved',
                'date_of_birth' => '1990-01-01',
            ]
        );

        $categories = [
            'Smartphones' => [
                ['title' => 'iPhone 13 Pro Max', 'brand' => 'Apple', 'model' => 'A2643', 'price' => 95000, 'original_price' => 140000, 'storage_capacity' => '256GB', 'color' => 'Graphite', 'image' => 'iphone-13-pro-max.jpg'],
                ['title' => 'Samsung Galaxy S22 Ultra', 'brand' => 'Samsung', 'model' => 'S908', 'price' => 90000, 'original_price' => 135000, 'storage_capacity' => '256GB', 'color' => 'Phantom Black', 'image' => 'samsung-galaxy-s22-ultra.jpg'],
                ['title' => 'Google Pixel 7 Pro', 'brand' => 'Google', 'model' => 'GE2AE', 'price' => 70000, 'original_price' => 105000, 'storage_capacity' => '128GB', 'color' => 'Obsidian', 'image' => 'google-pixel-7-pro.jpg'],
                ['title' => 'OnePlus 10 Pro', 'brand' => 'OnePlus', 'model' => 'NE2213', 'price' => 60000, 'original_price' => 85000, 'storage_capacity' => '128GB', 'color' => 'Emerald Forest', 'image' => 'oneplus-10-pro.png'],
                ['title' => 'Xiaomi Mi 11', 'brand' => 'Xiaomi', 'model' => 'M2011K2G', 'price' => 35000, 'original_price' => 55000, 'storage_capacity' => '128GB', 'color' => 'Horizon Blue', 'image' => 'xiaomi-mi-11.jpg'],
            ],
            'Laptops' => [
                ['title' => 'MacBook Pro 14" M2', 'brand' => 'Apple', 'model' => 'A2779', 'price' => 180000, 'original_price' => 250000, 'ram_memory' => '16GB', 'storage_capacity' => '512GB', 'color' => 'Space Gray', 'image' => 'macbook-pro-14-m2.jpg'],
                ['title' => 'Dell XPS 13', 'brand' => 'Dell', 'model' => '9310', 'price' => 120000, 'original_price' => 170000, 'ram_memory' => '16GB', 'storage_capacity' => '512GB', 'color' => 'Silver', 'image' => 'dell-xps-13.jpg'],
                ['title' => 'HP Spectre x360', 'brand' => 'HP', 'model' => '14-ea', 'price' => 110000, 'original_price' => 155000, 'ram_memory' => '16GB', 'storage_capacity' => '1TB', 'color' => 'Nocturne Blue', 'image' => 'hp-spectre-x360.jpg'],
                ['title' => 'Lenovo ThinkPad X1 Carbon', 'brand' => 'Lenovo', 'model' => 'Gen 9', 'price' => 130000, 'original_price' => 185000, 'ram_memory' => '16GB', 'storage_capacity' => '512GB', 'color' => 'Black', 'image' => 'lenovo-thinkpad-x1-carbon.jpg'],
                ['title' => 'ASUS ROG Zephyrus G14', 'brand' => 'ASUS', 'model' => 'GA402', 'price' => 140000, 'original_price' => 200000, 'ram_memory' => '16GB', 'storage_capacity' => '1TB', 'color' => 'Moonlight White', 'image' => 'asus-rog-zephyrus-g14.jpg'],
            ],
            'Tablets' => [
                ['title' => 'iPad Air 5th Gen', 'brand' => 'Apple', 'model' => 'A2588', 'price' => 55000, 'original_price' => 75000, 'storage_capacity' => '64GB', 'color' => 'Blue', 'image' => 'ipad-air-5th-gen.jpg'],
                ['title' => 'Samsung Galaxy Tab S8', 'brand' => 'Samsung', 'model' => 'SM-X700', 'price' => 50000, 'original_price' => 70000, 'storage_capacity' => '128GB', 'color' => 'Graphite', 'image' => 'samsung-galaxy-tab-s8.jpg'],
                ['title' => 'Lenovo Tab P11 Pro', 'brand' => 'Lenovo', 'model' => 'TB-J706F', 'price' => 35000, 'original_price' => 50000, 'storage_capacity' => '128GB', 'color' => 'Platinum Gray', 'image' => 'lenovo-tab-p11-pro.jpg'],
                ['title' => 'Microsoft Surface Go 3', 'brand' => 'Microsoft', 'model' => '1901', 'price' => 40000, 'original_price' => 58000, 'storage_capacity' => '128GB', 'color' => 'Platinum', 'image' => 'microsoft-surface-go-3.jpg'],
                ['title' => 'Xiaomi Pad 5', 'brand' => 'Xiaomi', 'model' => '21051182G', 'price' => 30000, 'original_price' => 42000, 'storage_capacity' => '128GB', 'color' => 'Cosmic Gray', 'image' => 'xiaomi-pad-5.jpg'],
            ],
            'Desktop Computers' => [
                ['title' => 'Dell OptiPlex 7090', 'brand' => 'Dell', 'model' => '7090', 'price' => 70000, 'original_price' => 95000, 'processor' => 'Intel i7', 'ram_memory' => '16GB', 'storage_capacity' => '512GB SSD', 'color' => 'Black', 'image' => 'dell-optiplex-7090.jpg'],
                ['title' => 'HP EliteDesk 800 G6', 'brand' => 'HP', 'model' => '800 G6', 'price' => 65000, 'original_price' => 90000, 'processor' => 'Intel i5', 'ram_memory' => '16GB', 'storage_capacity' => '512GB SSD', 'color' => 'Black', 'image' => 'hp-elitedesk-800-g6.jpg'],
                ['title' => 'Lenovo ThinkCentre M920', 'brand' => 'Lenovo', 'model' => 'M920', 'price' => 60000, 'original_price' => 85000, 'processor' => 'Intel i5', 'ram_memory' => '16GB', 'storage_capacity' => '256GB SSD', 'color' => 'Black', 'image' => 'lenovo-thinkcentre-m920.jpg'],
                ['title' => 'Apple iMac 27" (2019)', 'brand' => 'Apple', 'model' => 'A2115', 'price' => 120000, 'original_price' => 180000, 'processor' => 'Intel i5', 'ram_memory' => '16GB', 'storage_capacity' => '512GB SSD', 'color' => 'Silver', 'image' => 'apple-imac-27-2019.jpg'],
                ['title' => 'Acer Aspire TC', 'brand' => 'Acer', 'model' => 'TC-1760', 'price' => 50000, 'original_price' => 75000, 'processor' => 'Intel i5', 'ram_memory' => '8GB', 'storage_capacity' => '512GB SSD', 'color' => 'Black', 'image' => 'acer-aspire-tc.jpg'],
            ],
            'Gaming' => [
                ['title' => 'PlayStation 5', 'brand' => 'Sony', 'model' => 'CFI-1102A', 'price' => 65000, 'original_price' => 75000, 'color' => 'White', 'image' => 'playstation-5.jpg'],
                ['title' => 'Xbox Series X', 'brand' => 'Microsoft', 'model' => 'RRT-00010', 'price' => 60000, 'original_price' => 70000, 'color' => 'Black', 'image' => 'xbox-series-x.jpg'],
                ['title' => 'Nintendo Switch OLED', 'brand' => 'Nintendo', 'model' => 'HEG-001', 'price' => 35000, 'original_price' => 42000, 'color' => 'White', 'image' => 'nintendo-switch-oled.jpg'],
                ['title' => 'ASUS ROG Strix G15', 'brand' => 'ASUS', 'model' => 'G513', 'price' => 120000, 'original_price' => 165000, 'processor' => 'Ryzen 7', 'ram_memory' => '16GB', 'storage_capacity' => '512GB SSD', 'color' => 'Eclipse Gray', 'image' => 'asus-rog-strix-g15.jpg'],
                ['title' => 'Alienware Aurora R13', 'brand' => 'Dell', 'model' => 'R13', 'price' => 180000, 'original_price' => 260000, 'processor' => 'Intel i7', 'ram_memory' => '16GB', 'storage_capacity' => '1TB SSD', 'color' => 'Dark Side', 'image' => 'alienware-aurora-r13.jpg'],
            ],
            'Smart Watches' => [
                ['title' => 'Apple Watch Series 7', 'brand' => 'Apple', 'model' => 'A2477', 'price' => 35000, 'original_price' => 48000, 'color' => 'Midnight', 'screen_size' => '45mm', 'image' => 'apple-watch-series-7.jpg'],
                ['title' => 'Samsung Galaxy Watch 5', 'brand' => 'Samsung', 'model' => 'SM-R910', 'price' => 25000, 'original_price' => 35000, 'color' => 'Graphite', 'screen_size' => '44mm', 'image' => 'samsung-galaxy-watch-5.jpg'],
                ['title' => 'Garmin Venu 2', 'brand' => 'Garmin', 'model' => '010-02430', 'price' => 30000, 'original_price' => 42000, 'color' => 'Silver', 'screen_size' => '45mm', 'image' => 'garmin-venu-2.jpg'],
                ['title' => 'Fitbit Versa 3', 'brand' => 'Fitbit', 'model' => 'FB511', 'price' => 18000, 'original_price' => 25000, 'color' => 'Black', 'screen_size' => '40mm', 'image' => 'fitbit-versa-3.jpg'],
                ['title' => 'Huawei Watch GT 3', 'brand' => 'Huawei', 'model' => 'JPT-B19', 'price' => 22000, 'original_price' => 32000, 'color' => 'Brown', 'screen_size' => '46mm', 'image' => 'huawei-watch-gt-3.jpg'],
            ],
            'Audio & Headphones' => [
                ['title' => 'Sony WH-1000XM4', 'brand' => 'Sony', 'model' => 'WH1000XM4', 'price' => 20000, 'original_price' => 28000, 'color' => 'Black', 'image' => 'sony-wh-1000xm4.jpg'],
                ['title' => 'Bose QuietComfort 45', 'brand' => 'Bose', 'model' => 'QC45', 'price' => 18000, 'original_price' => 26000, 'color' => 'Black', 'image' => 'bose-quietcomfort-45.jpg'],
                ['title' => 'Apple AirPods Pro (2nd Gen)', 'brand' => 'Apple', 'model' => 'A2931', 'price' => 16000, 'original_price' => 22000, 'color' => 'White', 'image' => 'apple-airpods-pro-2nd-gen.jpg'],
                ['title' => 'Sennheiser HD 560S', 'brand' => 'Sennheiser', 'model' => 'HD560S', 'price' => 12000, 'original_price' => 17000, 'color' => 'Black', 'image' => 'sennheiser-hd-560s.jpg'],
                ['title' => 'JBL Flip 6', 'brand' => 'JBL', 'model' => 'Flip6', 'price' => 9000, 'original_price' => 13000, 'color' => 'Blue', 'image' => 'jbl-flip-6.jpg'],
            ],
            'Cameras' => [
                ['title' => 'Canon EOS R6', 'brand' => 'Canon', 'model' => 'R6', 'price' => 200000, 'original_price' => 280000, 'color' => 'Black', 'image' => 'canon-eos-r6.jpg'],
                ['title' => 'Sony A7 III', 'brand' => 'Sony', 'model' => 'ILCE-7M3', 'price' => 170000, 'original_price' => 240000, 'color' => 'Black', 'image' => 'sony-a7-iii.jpg'],
                ['title' => 'Nikon Z6 II', 'brand' => 'Nikon', 'model' => 'Z6II', 'price' => 160000, 'original_price' => 230000, 'color' => 'Black', 'image' => 'nikon-z6-ii.jpg'],
                ['title' => 'Fujifilm X-T4', 'brand' => 'Fujifilm', 'model' => 'X-T4', 'price' => 140000, 'original_price' => 200000, 'color' => 'Black', 'image' => 'fujifilm-x-t4.jpg'],
                ['title' => 'Panasonic Lumix GH5', 'brand' => 'Panasonic', 'model' => 'GH5', 'price' => 120000, 'original_price' => 170000, 'color' => 'Black', 'image' => 'panasonic-lumix-gh5.jpg'],
            ],
            'Accessories' => [
                ['title' => 'Anker PowerCore 20000', 'brand' => 'Anker', 'model' => 'A1271', 'price' => 3500, 'original_price' => 5000, 'color' => 'Black', 'image' => 'anker-powercore-20000.jpg'],
                ['title' => 'Logitech MX Master 3', 'brand' => 'Logitech', 'model' => 'MX Master 3', 'price' => 7000, 'original_price' => 10000, 'color' => 'Black', 'image' => 'logitech-mx-master-3.jpg'],
                ['title' => 'SanDisk Extreme SSD 1TB', 'brand' => 'SanDisk', 'model' => 'E61', 'price' => 12000, 'original_price' => 16000, 'color' => 'Black', 'image' => 'sandisk-extreme-ssd-1tb.jpg'],
                ['title' => 'Belkin USB-C Hub', 'brand' => 'Belkin', 'model' => 'AVC009', 'price' => 4000, 'original_price' => 6000, 'color' => 'Gray', 'image' => 'belkin-usb-c-hub.jpg'],
                ['title' => 'Kingston 64GB microSD', 'brand' => 'Kingston', 'model' => 'Canvas Select', 'price' => 1200, 'original_price' => 1800, 'color' => 'Black', 'image' => 'kingston-64gb-microsd.jpg'],
            ],
            'Other Electronics' => [
                ['title' => 'Kindle Paperwhite', 'brand' => 'Amazon', 'model' => '11th Gen', 'price' => 12000, 'original_price' => 16000, 'color' => 'Black', 'image' => 'kindle-paperwhite.jpg'],
                ['title' => 'Raspberry Pi 4 Model B', 'brand' => 'Raspberry Pi', 'model' => '4B 4GB', 'price' => 6000, 'original_price' => 8500, 'color' => 'Green', 'image' => 'raspberry-pi-4-model-b.jpg'],
                ['title' => 'Philips Hue Starter Kit', 'brand' => 'Philips', 'model' => 'Hue E26', 'price' => 9000, 'original_price' => 13000, 'color' => 'White', 'image' => 'philips-hue-starter-kit.jpg'],
                ['title' => 'Google Nest Thermostat', 'brand' => 'Google', 'model' => 'G4CVZ', 'price' => 8000, 'original_price' => 12000, 'color' => 'Snow', 'image' => 'google-nest-thermostat.jpg'],
                ['title' => 'Oculus Quest 2', 'brand' => 'Meta', 'model' => 'Quest 2 128GB', 'price' => 25000, 'original_price' => 35000, 'color' => 'White', 'image' => 'oculus-quest-2.jpg'],
            ],
        ];

        $conditions = ['like-new', 'excellent', 'good', 'fair'];

        foreach ($categories as $category => $items) {
            foreach ($items as $index => $item) {
                $sku = 'SEED-' . strtoupper(Str::slug($category, '-')) . '-' . str_pad((string)($index + 1), 2, '0', STR_PAD_LEFT);

                $price = (float) $item['price'];
                $original = (float) ($item['original_price'] ?? $price);
                $discount = $original > $price ? round((($original - $price) / $original) * 100, 2) : 0;

                Product::updateOrCreate(
                    ['sku' => $sku],
                    [
                        'seller_id' => $seller->id,
                        'title' => $item['title'],
                        'description' => ($item['title'] . ' in great condition, fully tested and verified. Comes with standard accessories.'),
                        'category' => $category,
                        'subcategory' => $item['model'] ?? null,
                        'brand' => $item['brand'] ?? null,
                        'model' => $item['model'] ?? null,
                        'sku' => $sku,
                        'condition_grade' => $conditions[$index % count($conditions)],
                        'condition_description' => 'Minor signs of use, fully functional.',
                        'price' => $price,
                        'original_price' => $original,
                        'discount_percentage' => $discount,
                        'quantity_available' => 1,
                        'warranty_period' => '3 months',
                        'return_policy' => '7-day return policy',
                        'shipping_weight' => '1kg',
                        'dimensions' => null,
                        'color' => $item['color'] ?? null,
                        'storage_capacity' => $item['storage_capacity'] ?? null,
                        'ram_memory' => $item['ram_memory'] ?? null,
                        'processor' => $item['processor'] ?? null,
                        'operating_system' => $item['operating_system'] ?? null,
                        'battery_health' => $item['battery_health'] ?? null,
                        'screen_size' => $item['screen_size'] ?? null,
                        'connectivity' => $item['connectivity'] ?? null,
                        'included_accessories' => 'Original charger/cable (if applicable)',
                        'defects_issues' => null,
                        'purchase_date' => now()->subYears(1)->startOfYear()->addMonths($index + 1),
                        'usage_duration' => '12 months',
                        'reason_for_selling' => 'Upgraded to a new model',
                        'tags' => strtolower($category) . ', ' . strtolower($item['brand'] ?? ''),
                        'images' => json_encode([
                            '/assets/seed/' . Str::slug($category) . '/' . $item['image']
                        ]),
                        'is_featured' => $index === 0,
                        'is_urgent_sale' => $index === 1,
                        'negotiable' => true,
                        'minimum_price' => max($price - 500, 1),
                        'location_city' => 'Dhaka',
                        'location_state' => 'Dhaka Division',
                        'shipping_options' => 'In-person pickup, Courier',
                        'status' => 'active',
                        'approval_date' => now(),
                        'rejection_reason' => null,
                        'views_count' => 0,
                        'favorites_count' => 0,
                    ]
                );
            }
        }

        $this->command?->info('✅ Seeded deterministic products: 5 per category.');
    }
}
