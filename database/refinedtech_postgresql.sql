-- PostgreSQL version of RefinedTech Database
-- DROP DATABASE IF EXISTS refinedtech;
-- Note: In PostgreSQL, you typically create the database using createdb command or pgAdmin
-- CREATE DATABASE refinedtech WITH ENCODING 'UTF8' LC_COLLATE='en_US.UTF-8' LC_CTYPE='en_US.UTF-8';

-- Connect to refinedtech database before running the following commands
-- \c refinedtech;

-- Create custom enum types first
CREATE TYPE user_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE product_condition AS ENUM ('like-new', 'excellent', 'good', 'fair');
CREATE TYPE product_status AS ENUM ('pending', 'active', 'rejected', 'sold', 'draft');
CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded', 'partial_refund');
CREATE TYPE payment_method AS ENUM ('sslcommerz');
CREATE TYPE sender_type AS ENUM ('buyer', 'seller');
CREATE TYPE user_type AS ENUM ('buyer', 'seller', 'admin');
CREATE TYPE image_type AS ENUM ('main', 'gallery', 'condition', 'defect');
CREATE TYPE transaction_type AS ENUM ('payment', 'refund', 'partial_refund');
CREATE TYPE transaction_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'cancelled');

-- Buyers Table
CREATE TABLE buyers (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    email_verified_at TIMESTAMP NULL,
    password VARCHAR(255) NOT NULL,
    country VARCHAR(255) NOT NULL,
    phone_number VARCHAR(255) NOT NULL,
    address VARCHAR(500) NULL,
    city VARCHAR(100) NULL,
    state VARCHAR(100) NULL,
    postal_code VARCHAR(20) NULL,
    status user_status DEFAULT 'approved',
    profile_image_url VARCHAR(500) NULL,
    profile_image_public_id VARCHAR(255) NULL,
    remember_token VARCHAR(100) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for buyers table
CREATE TRIGGER update_buyers_updated_at BEFORE UPDATE ON buyers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sellers Table  
CREATE TABLE sellers (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    email_verified_at TIMESTAMP NULL,
    password VARCHAR(255) NOT NULL,
    country VARCHAR(255) NOT NULL,
    phone_number VARCHAR(255) NOT NULL,
    shop_username VARCHAR(255) UNIQUE NOT NULL,
    date_of_birth DATE NOT NULL,
    business_address TEXT NOT NULL,
    national_id_path VARCHAR(255) NULL,
    proof_of_ownership_path VARCHAR(255) NULL,
    status user_status DEFAULT 'pending',
    remember_token VARCHAR(100) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create trigger for sellers table
CREATE TRIGGER update_sellers_updated_at BEFORE UPDATE ON sellers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Admins Table
CREATE TABLE admins (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    email_verified_at TIMESTAMP NULL,
    password VARCHAR(255) NOT NULL,
    admin_access_code VARCHAR(255) NOT NULL,
    admin_username VARCHAR(255) UNIQUE NOT NULL,
    country VARCHAR(255) NOT NULL,
    id_proof_reference VARCHAR(255) NOT NULL,
    status user_status DEFAULT 'pending',
    remember_token VARCHAR(100) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create trigger for admins table
CREATE TRIGGER update_admins_updated_at BEFORE UPDATE ON admins
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Personal Access Tokens Table (Required by Laravel Sanctum)
CREATE TABLE personal_access_tokens (
    id BIGSERIAL PRIMARY KEY,
    tokenable_type VARCHAR(255) NOT NULL,
    tokenable_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    token VARCHAR(64) NOT NULL UNIQUE,
    abilities TEXT NULL,
    last_used_at TIMESTAMP NULL,
    expires_at TIMESTAMP NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL
);

-- Create index for personal_access_tokens
CREATE INDEX personal_access_tokens_tokenable_type_tokenable_id_index 
ON personal_access_tokens (tokenable_type, tokenable_id);

-- Admin Access Codes Table
CREATE TABLE admin_access_codes (
    id BIGSERIAL PRIMARY KEY,
    access_code VARCHAR(255) UNIQUE NOT NULL,
    created_by_admin_id BIGINT NULL,
    used_by_admin_id BIGINT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    used_at TIMESTAMP NULL,
    description TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by_admin_id) REFERENCES admins(id) ON DELETE SET NULL,
    FOREIGN KEY (used_by_admin_id) REFERENCES admins(id) ON DELETE SET NULL
);

-- Create trigger for admin_access_codes table
CREATE TRIGGER update_admin_access_codes_updated_at BEFORE UPDATE ON admin_access_codes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enhanced Products Table for RefinedTech Marketplace
CREATE TABLE products (
    id BIGSERIAL PRIMARY KEY,
    seller_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    subcategory VARCHAR(100),
    brand VARCHAR(100) NOT NULL,
    model VARCHAR(150) NOT NULL,
    sku VARCHAR(100) UNIQUE,
    condition_grade product_condition NOT NULL,
    condition_description TEXT,
    price DECIMAL(10,2) NOT NULL,
    original_price DECIMAL(10,2),
    discount_percentage DECIMAL(5,2),
    quantity_available INTEGER DEFAULT 1,
    warranty_period VARCHAR(50),
    return_policy VARCHAR(255),
    shipping_weight DECIMAL(8,2),
    dimensions VARCHAR(100),
    color VARCHAR(50),
    storage_capacity VARCHAR(50),
    ram_memory VARCHAR(50),
    processor VARCHAR(100),
    operating_system VARCHAR(100),
    battery_health VARCHAR(20),
    screen_size VARCHAR(20),
    connectivity TEXT,
    included_accessories TEXT,
    defects_issues TEXT,
    purchase_date DATE,
    usage_duration VARCHAR(50),
    reason_for_selling TEXT,
    images JSONB,
    videos JSONB,
    tags VARCHAR(255),
    is_featured BOOLEAN DEFAULT FALSE,
    is_urgent_sale BOOLEAN DEFAULT FALSE,
    negotiable BOOLEAN DEFAULT TRUE,
    minimum_price DECIMAL(10,2),
    location_city VARCHAR(100),
    location_state VARCHAR(100),
    shipping_options JSONB,
    status product_status DEFAULT 'active',
    views_count INTEGER DEFAULT 0,
    favorites_count INTEGER DEFAULT 0,
    admin_notes TEXT,
    rejection_reason TEXT,
    approval_date TIMESTAMP NULL,
    approved_by BIGINT NULL,
    featured_until TIMESTAMP NULL,
    boost_expires_at TIMESTAMP NULL,
    sold_at TIMESTAMP NULL,
    sold_to BIGINT NULL,
    final_sale_price DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (seller_id) REFERENCES sellers(id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES admins(id) ON DELETE SET NULL,
    FOREIGN KEY (sold_to) REFERENCES buyers(id) ON DELETE SET NULL
);

-- Create indexes for products table
CREATE INDEX idx_products_seller ON products (seller_id);
CREATE INDEX idx_products_category ON products (category);
CREATE INDEX idx_products_brand ON products (brand);
CREATE INDEX idx_products_condition ON products (condition_grade);
CREATE INDEX idx_products_price ON products (price);
CREATE INDEX idx_products_status ON products (status);
CREATE INDEX idx_products_location ON products (location_city, location_state);
CREATE INDEX idx_products_featured ON products (is_featured);
CREATE INDEX idx_products_created ON products (created_at);
CREATE INDEX idx_sku ON products (sku);

-- Create trigger for products table
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Product Images Table (for better image management)
CREATE TABLE product_images (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL,
    image_path VARCHAR(255) NOT NULL,
    image_type image_type DEFAULT 'gallery',
    alt_text VARCHAR(255),
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Create index for product_images
CREATE INDEX idx_product_images ON product_images (product_id, sort_order);

-- Create trigger for product_images table
CREATE TRIGGER update_product_images_updated_at BEFORE UPDATE ON product_images
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Product Categories Reference Table
CREATE TABLE product_categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    parent_id BIGINT NULL,
    description TEXT,
    icon VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES product_categories(id) ON DELETE SET NULL
);

-- Create indexes for product_categories
CREATE INDEX idx_parent ON product_categories (parent_id);
CREATE INDEX idx_slug ON product_categories (slug);

-- Create trigger for product_categories table
CREATE TRIGGER update_product_categories_updated_at BEFORE UPDATE ON product_categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Product Conditions Reference
CREATE TABLE product_conditions (
    id BIGSERIAL PRIMARY KEY,
    grade VARCHAR(20) NOT NULL UNIQUE,
    title VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    icon VARCHAR(10),
    color VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reviews Table
CREATE TABLE reviews (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL,
    reviewer_id BIGINT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewer_id) REFERENCES buyers(id) ON DELETE CASCADE
);

-- Create indexes for reviews
CREATE INDEX idx_reviews_product ON reviews (product_id);
CREATE INDEX idx_reviews_reviewer ON reviews (reviewer_id);

-- Create trigger for reviews table
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Conversations Table  
CREATE TABLE conversations (
    id BIGSERIAL PRIMARY KEY,
    seller_id BIGINT NOT NULL,
    buyer_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (seller_id) REFERENCES sellers(id) ON DELETE CASCADE,
    FOREIGN KEY (buyer_id) REFERENCES buyers(id) ON DELETE CASCADE
);

-- Create indexes for conversations
CREATE INDEX idx_conversations_seller ON conversations (seller_id);
CREATE INDEX idx_conversations_buyer ON conversations (buyer_id);

-- Create trigger for conversations table
CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Messages Table
CREATE TABLE messages (
    id BIGSERIAL PRIMARY KEY,
    conversation_id BIGINT NOT NULL,
    sender_id BIGINT NOT NULL,
    sender_type sender_type NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
);

-- Create indexes for messages
CREATE INDEX idx_messages_conversation ON messages (conversation_id);
CREATE INDEX idx_messages_sender ON messages (sender_id, sender_type);

-- Create trigger for messages table
CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Admin Approvals Table
CREATE TABLE admin_approvals (
    id BIGSERIAL PRIMARY KEY,
    admin_id BIGINT NOT NULL,
    approved_user_id BIGINT NOT NULL,
    approved_user_type user_type NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE
);

-- Create indexes for admin_approvals
CREATE INDEX idx_admin_approvals_admin ON admin_approvals (admin_id);
CREATE INDEX idx_admin_approvals_user ON admin_approvals (approved_user_id, approved_user_type);

-- Create trigger for admin_approvals table
CREATE TRIGGER update_admin_approvals_updated_at BEFORE UPDATE ON admin_approvals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Orders Table for Purchase Management
CREATE TABLE orders (
    id BIGSERIAL PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    buyer_id BIGINT NOT NULL,
    seller_id BIGINT NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    shipping_cost DECIMAL(8,2) DEFAULT 0.00,
    tax_amount DECIMAL(8,2) DEFAULT 0.00,
    discount_amount DECIMAL(8,2) DEFAULT 0.00,
    final_amount DECIMAL(10,2) NOT NULL,
    
    -- Shipping Information
    shipping_address_line1 VARCHAR(255) NOT NULL,
    shipping_address_line2 VARCHAR(255),
    shipping_city VARCHAR(100) NOT NULL,
    shipping_state VARCHAR(100) NOT NULL,
    shipping_postal_code VARCHAR(20) NOT NULL,
    shipping_country VARCHAR(100) NOT NULL,
    shipping_phone VARCHAR(20),
    
    -- Billing Information
    billing_address_line1 VARCHAR(255),
    billing_address_line2 VARCHAR(255),
    billing_city VARCHAR(100),
    billing_state VARCHAR(100),
    billing_postal_code VARCHAR(20),
    billing_country VARCHAR(100),
    billing_phone VARCHAR(20),
    
    -- Order Status
    status order_status DEFAULT 'pending',
    payment_status payment_status DEFAULT 'pending',
    payment_method payment_method NOT NULL,
    
    -- Payment Information
    payment_reference VARCHAR(255),
    payment_gateway VARCHAR(50),
    transaction_id VARCHAR(255),
    
    -- Tracking Information
    tracking_number VARCHAR(100),
    shipping_carrier VARCHAR(100),
    estimated_delivery_date DATE,
    actual_delivery_date DATE,
    
    -- Notes and Communication
    buyer_notes TEXT,
    seller_notes TEXT,
    admin_notes TEXT,
    
    -- Timestamps
    confirmed_at TIMESTAMP NULL,
    shipped_at TIMESTAMP NULL,
    delivered_at TIMESTAMP NULL,
    cancelled_at TIMESTAMP NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (buyer_id) REFERENCES buyers(id) ON DELETE CASCADE,
    FOREIGN KEY (seller_id) REFERENCES sellers(id) ON DELETE CASCADE
);

-- Create indexes for orders
CREATE INDEX idx_orders_number ON orders (order_number);
CREATE INDEX idx_orders_buyer ON orders (buyer_id);
CREATE INDEX idx_orders_seller ON orders (seller_id);
CREATE INDEX idx_orders_status ON orders (status);
CREATE INDEX idx_orders_payment_status ON orders (payment_status);
CREATE INDEX idx_orders_created ON orders (created_at);

-- Create trigger for orders table
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Order Items Table
CREATE TABLE order_items (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    
    -- Product snapshot at time of purchase
    product_title VARCHAR(255) NOT NULL,
    product_sku VARCHAR(100),
    product_condition VARCHAR(50),
    product_image_url VARCHAR(500),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Create indexes for order_items
CREATE INDEX idx_order_items_order ON order_items (order_id);
CREATE INDEX idx_order_items_product ON order_items (product_id);

-- Create trigger for order_items table
CREATE TRIGGER update_order_items_updated_at BEFORE UPDATE ON order_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Shopping Cart Table
CREATE TABLE cart_items (
    id BIGSERIAL PRIMARY KEY,
    buyer_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (buyer_id) REFERENCES buyers(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    
    UNIQUE (buyer_id, product_id)
);

-- Create indexes for cart_items
CREATE INDEX idx_cart_buyer ON cart_items (buyer_id);
CREATE INDEX idx_cart_product ON cart_items (product_id);

-- Create trigger for cart_items table
CREATE TRIGGER update_cart_items_updated_at BEFORE UPDATE ON cart_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Wishlist/Favorites Table
CREATE TABLE wishlists (
    id BIGSERIAL PRIMARY KEY,
    buyer_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (buyer_id) REFERENCES buyers(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    
    UNIQUE (buyer_id, product_id)
);

-- Create indexes for wishlists
CREATE INDEX idx_wishlist_buyer ON wishlists (buyer_id);
CREATE INDEX idx_wishlist_product ON wishlists (product_id);

-- Create trigger for wishlists table
CREATE TRIGGER update_wishlists_updated_at BEFORE UPDATE ON wishlists
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Payment Transactions Table
CREATE TABLE payment_transactions (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL,
    transaction_id VARCHAR(255) UNIQUE NOT NULL,
    gateway VARCHAR(50) NOT NULL DEFAULT 'sslcommerz',
    gateway_transaction_id VARCHAR(255) NULL,
    payment_method VARCHAR(50) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'BDT',
    status transaction_status DEFAULT 'pending',
    gateway_response JSONB NULL,
    processed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- Order Status History Table (for tracking order lifecycle)
CREATE TABLE order_status_history (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL,
    old_status order_status,
    new_status order_status,
    changed_by VARCHAR(50),
    change_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- Create indexes for payment_transactions
CREATE INDEX idx_payment_transactions_order ON payment_transactions (order_id);
CREATE INDEX idx_payment_transactions_gateway ON payment_transactions (gateway_transaction_id);
CREATE INDEX idx_payment_transactions_status ON payment_transactions (status);

-- Create trigger for payment_transactions table
CREATE TRIGGER update_payment_transactions_updated_at BEFORE UPDATE ON payment_transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create trigger for order_status_history table
CREATE TRIGGER update_order_status_history_updated_at BEFORE UPDATE ON order_status_history
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert initial data
-- Insert initial admin access codes
INSERT INTO admin_access_codes (access_code, description, created_by_admin_id, is_used) VALUES
('ADM-SYSTEM01', 'System generated admin access code #1', NULL, FALSE),
('ADM-SYSTEM02', 'System generated admin access code #2', NULL, FALSE),
('ADM-SYSTEM03', 'System generated admin access code #3', NULL, FALSE);

-- Insert a super admin user (approved by default)
INSERT INTO admins (name, first_name, last_name, email, password, admin_access_code, admin_username, country, id_proof_reference, status, created_at, updated_at) VALUES
('Bijoy', 'Bijoy', 'Admin', 'bijoy@refinedtech.com', '$2y$12$b59UhTSZFanXUF.PPqOD/.wFM1C9BW7Jo1BJ6AIOHuGWWYc1GX8fG', 'ADM-SYSTEM01', 'bijoy', 'System', 'SUPER-ADMIN-001', 'approved', NOW(), NOW());

-- Mark the access code as used by the super admin
UPDATE admin_access_codes SET is_used = TRUE, used_by_admin_id = 1, used_at = NOW() WHERE access_code = 'ADM-SYSTEM01';

-- Insert additional admin access codes generated by the super admin
INSERT INTO admin_access_codes (access_code, description, created_by_admin_id, is_used) VALUES
('ADM-A1B2C3D4', 'Access code generated by Super Admin #1', 1, FALSE),
('ADM-E5F6G7H8', 'Access code generated by Super Admin #2', 1, FALSE),
('ADM-I9J0K1L2', 'Access code generated by Super Admin #3', 1, FALSE),
('ADM-M3N4O5P6', 'Access code generated by Super Admin #4', 1, FALSE),
('ADM-Q7R8S9T0', 'Access code generated by Super Admin #5', 1, FALSE);

-- Insert default categories
INSERT INTO product_categories (name, slug, description, icon, sort_order) VALUES
('Smartphones', 'smartphones', 'Refurbished mobile phones and accessories', '📱', 1),
('Laptops', 'laptops', 'Refurbished laptops and notebooks', '💻', 2),
('Tablets', 'tablets', 'Refurbished tablets and e-readers', '📱', 3),
('Desktop Computers', 'desktop-computers', 'Refurbished desktop PCs and workstations', '🖥️', 4),
('Gaming', 'gaming', 'Gaming consoles, accessories and peripherals', '🎮', 5),
('Smart Watches', 'smart-watches', 'Refurbished smartwatches and fitness trackers', '⌚', 6),
('Audio & Headphones', 'audio-headphones', 'Refurbished headphones, speakers and audio equipment', '🎧', 7),
('Cameras', 'cameras', 'Refurbished cameras and photography equipment', '📷', 8),
('Accessories', 'accessories', 'Tech accessories, cables, cases and peripherals', '🔌', 9),
('Other Electronics', 'other-electronics', 'Other refurbished electronic devices', '⚡', 10);

-- Insert product conditions
INSERT INTO product_conditions (grade, title, description, icon, color) VALUES
('like-new', 'Like New', 'Excellent condition with minimal signs of use. Functions perfectly with original packaging.', '⭐', 'green'),
('excellent', 'Excellent', 'Great condition with minor cosmetic wear. Functions perfectly with most accessories.', '✨', 'blue'),
('good', 'Good', 'Good condition with noticeable wear but functions well. May lack some accessories.', '👍', 'orange'),
('fair', 'Fair', 'Fair condition with significant wear. Functions properly but shows clear usage signs.', '👌', 'yellow');

-- ================================================================================================
-- MESSAGE SYSTEM QUERIES - RefinedTech Marketplace (PostgreSQL version)
-- These queries help you view and analyze the messaging system between buyers and sellers
-- ================================================================================================

-- Note: The messaging system references conversation_messages and product_conversations tables
-- which would need to be created based on your Final_3/chat branch requirements.
-- These are example queries adapted for PostgreSQL syntax.

-- PostgreSQL specific query examples:

-- 1. View all conversations with message statistics (PostgreSQL version)
/*
SELECT 
    c.id as conversation_id,
    s.shop_username as seller_name,
    b.name as buyer_name,
    c.created_at,
    c.updated_at,
    COUNT(m.id) as total_messages,
    COUNT(CASE WHEN m.sender_type = 'buyer' THEN 1 END) as buyer_messages,
    COUNT(CASE WHEN m.sender_type = 'seller' THEN 1 END) as seller_messages
FROM conversations c
JOIN sellers s ON c.seller_id = s.id
JOIN buyers b ON c.buyer_id = b.id
LEFT JOIN messages m ON c.id = m.conversation_id
GROUP BY c.id, s.shop_username, b.name, c.created_at, c.updated_at
ORDER BY c.updated_at DESC;
*/

-- 2. Get recent messaging activity (PostgreSQL version)
/*
SELECT 
    DATE(m.created_at) as message_date,
    COUNT(*) as messages_sent,
    COUNT(DISTINCT m.conversation_id) as active_conversations,
    COUNT(DISTINCT CASE WHEN m.sender_type = 'buyer' THEN m.sender_id END) as active_buyers,
    COUNT(DISTINCT CASE WHEN m.sender_type = 'seller' THEN m.sender_id END) as active_sellers
FROM messages m
WHERE m.created_at >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY DATE(m.created_at)
ORDER BY message_date DESC;
*/

-- ================================================================================================
-- VIEWS FOR DATA ABSTRACTION AND REPORTING
-- ================================================================================================

-- Seller Performance Dashboard View
CREATE OR REPLACE VIEW seller_performance_dashboard AS
SELECT 
    s.id as seller_id,
    s.shop_username,
    s.name as seller_name,
    s.email,
    s.status,
    COUNT(DISTINCT p.id) as total_products,
    COUNT(DISTINCT CASE WHEN p.status = 'active' THEN p.id END) as active_products,
    COUNT(DISTINCT o.id) as total_orders,
    COUNT(DISTINCT CASE WHEN o.status = 'delivered' THEN o.id END) as completed_orders,
    COALESCE(SUM(CASE WHEN o.status = 'delivered' THEN o.final_amount END), 0) as total_revenue,
    COALESCE(AVG(CASE WHEN o.status = 'delivered' THEN o.final_amount END), 0) as avg_order_value,
    COUNT(DISTINCT CASE WHEN o.status IN ('pending', 'confirmed', 'processing', 'shipped') THEN o.id END) as pending_orders,
    ROUND(
        CASE WHEN COUNT(o.id) > 0 
        THEN (COUNT(CASE WHEN o.status = 'delivered' THEN 1 END)::DECIMAL / COUNT(o.id)) * 100 
        ELSE 0 END, 2
    ) as delivery_success_rate,
    MAX(o.created_at) as last_order_received
FROM sellers s
LEFT JOIN products p ON s.id = p.seller_id
LEFT JOIN orders o ON s.id = o.seller_id
WHERE s.status = 'approved'
GROUP BY s.id, s.shop_username, s.name, s.email, s.status;

-- Enhanced Product Catalog View
CREATE OR REPLACE VIEW enhanced_product_catalog AS
SELECT 
    p.id,
    p.title,
    p.brand,
    p.model,
    p.category,
    p.subcategory,
    p.condition_grade,
    p.price,
    p.original_price,
    p.discount_percentage,
    p.quantity_available,
    p.images,
    p.tags,
    p.is_featured,
    p.is_urgent_sale,
    p.negotiable,
    p.location_city,
    p.location_state,
    p.status,
    p.views_count,
    p.favorites_count,
    p.created_at,
    s.id as seller_id,
    s.shop_username,
    s.name as seller_name,
    pc.title as condition_title,
    pc.description as condition_description,
    pc.icon as condition_icon,
    pc.color as condition_color,
    COALESCE(sales_stats.total_sold, 0) as total_sold,
    COALESCE(sales_stats.total_revenue, 0) as total_revenue_generated,
    CASE 
        WHEN p.original_price IS NOT NULL AND p.original_price > p.price 
        THEN ROUND(((p.original_price - p.price) / p.original_price) * 100, 2)
        ELSE COALESCE(p.discount_percentage, 0)
    END as actual_discount_percentage
FROM products p
JOIN sellers s ON p.seller_id = s.id
LEFT JOIN product_conditions pc ON p.condition_grade = pc.grade
LEFT JOIN (
    SELECT 
        oi.product_id,
        SUM(oi.quantity) as total_sold,
        SUM(oi.total_price) as total_revenue
    FROM order_items oi
    JOIN orders o ON oi.order_id = o.id
    WHERE o.status = 'delivered'
    GROUP BY oi.product_id
) sales_stats ON p.id = sales_stats.product_id;

-- Customer Order History View
CREATE OR REPLACE VIEW customer_order_history AS
SELECT 
    o.id as order_id,
    o.order_number,
    o.status,
    o.payment_status,
    o.total_amount,
    o.shipping_cost,
    o.tax_amount,
    o.final_amount,
    o.created_at as order_date,
    o.confirmed_at,
    o.shipped_at,
    o.delivered_at,
    b.id as buyer_id,
    b.name as buyer_name,
    b.email as buyer_email,
    s.id as seller_id,
    s.shop_username,
    s.name as seller_name,
    COUNT(oi.id) as total_items,
    STRING_AGG(oi.product_title, ', ') as product_titles,
    CASE 
        WHEN o.delivered_at IS NOT NULL THEN EXTRACT(DAY FROM (o.delivered_at - o.created_at))
        ELSE EXTRACT(DAY FROM (CURRENT_DATE - o.created_at))
    END as days_to_delivery
FROM orders o
JOIN buyers b ON o.buyer_id = b.id
JOIN sellers s ON o.seller_id = s.id
JOIN order_items oi ON o.id = oi.order_id
GROUP BY o.id, o.order_number, o.status, o.payment_status, o.total_amount, 
         o.shipping_cost, o.tax_amount, o.final_amount, o.created_at, 
         o.confirmed_at, o.shipped_at, o.delivered_at,
         b.id, b.name, b.email, s.id, s.shop_username, s.name;

-- ================================================================================================
-- TRIGGERS FOR BUSINESS LOGIC AND DATA INTEGRITY
-- ================================================================================================

-- Trigger to update product views counter when conversations are created
CREATE OR REPLACE FUNCTION update_product_views_on_conversation()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE products 
    SET views_count = views_count + 1
    WHERE id = (SELECT product_id FROM products WHERE seller_id = NEW.seller_id LIMIT 1);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for product views (modified for our schema)
CREATE TRIGGER update_product_views
    AFTER INSERT ON conversations
    FOR EACH ROW
    EXECUTE FUNCTION update_product_views_on_conversation();

-- Trigger to track order status changes
CREATE OR REPLACE FUNCTION track_order_status_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status != NEW.status THEN
        INSERT INTO order_status_history (
            order_id,
            old_status,
            new_status,
            changed_by,
            change_reason,
            created_at
        ) VALUES (
            NEW.id,
            OLD.status,
            NEW.status,
            'system',
            CASE 
                WHEN NEW.status = 'confirmed' THEN 'Order confirmed by seller'
                WHEN NEW.status = 'processing' THEN 'Order is being processed'
                WHEN NEW.status = 'shipped' THEN 'Order has been shipped'
                WHEN NEW.status = 'delivered' THEN 'Order delivered successfully'
                WHEN NEW.status = 'cancelled' THEN 'Order cancelled'
                ELSE 'Status updated'
            END,
            CURRENT_TIMESTAMP
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER track_order_status_changes
    AFTER UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION track_order_status_changes();

-- Trigger to cleanup wishlist when items are purchased
CREATE OR REPLACE FUNCTION cleanup_wishlist_on_purchase()
RETURNS TRIGGER AS $$
BEGIN
    DELETE FROM wishlists 
    WHERE product_id = NEW.product_id 
    AND buyer_id = (
        SELECT buyer_id FROM orders WHERE id = NEW.order_id
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER cleanup_wishlist_on_purchase
    AFTER INSERT ON order_items
    FOR EACH ROW
    EXECUTE FUNCTION cleanup_wishlist_on_purchase();

-- ================================================================================================
-- STORED PROCEDURES FOR BUSINESS OPERATIONS
-- ================================================================================================

-- Procedure for bulk product import (PostgreSQL version)
CREATE OR REPLACE FUNCTION bulk_product_import(
    p_seller_id BIGINT,
    p_product_data JSONB,
    OUT p_products_imported INTEGER,
    OUT p_error_message TEXT
)
RETURNS RECORD AS $$
DECLARE
    v_product JSONB;
    v_product_count INTEGER DEFAULT 0;
    v_error_count INTEGER DEFAULT 0;
BEGIN
    p_products_imported := 0;
    p_error_message := '';
    
    -- Validate seller exists and is approved
    IF NOT EXISTS (SELECT 1 FROM sellers WHERE id = p_seller_id AND status = 'approved') THEN
        p_error_message := 'Seller not found or not approved';
        RETURN;
    END IF;
    
    BEGIN
        -- Loop through products in JSON array
        FOR v_product IN SELECT * FROM jsonb_array_elements(p_product_data)
        LOOP
            BEGIN
                INSERT INTO products (
                    seller_id, title, description, category, brand, model,
                    condition_grade, price, quantity_available, created_at
                ) VALUES (
                    p_seller_id,
                    v_product->>'title',
                    v_product->>'description',
                    v_product->>'category',
                    v_product->>'brand',
                    v_product->>'model',
                    (v_product->>'condition_grade')::product_condition,
                    (v_product->>'price')::DECIMAL(10,2),
                    COALESCE((v_product->>'quantity')::INTEGER, 1),
                    CURRENT_TIMESTAMP
                );
                
                v_product_count := v_product_count + 1;
                
            EXCEPTION WHEN OTHERS THEN
                v_error_count := v_error_count + 1;
                CONTINUE;
            END;
        END LOOP;
        
        p_products_imported := v_product_count;
        
        IF v_error_count > 0 THEN
            p_error_message := FORMAT('Imported %s products, %s failed', v_product_count, v_error_count);
        ELSE
            p_error_message := FORMAT('Successfully imported %s products', v_product_count);
        END IF;
        
    EXCEPTION WHEN OTHERS THEN
        p_error_message := 'Error during bulk import: ' || SQLERRM;
        RETURN;
    END;
END;
$$ LANGUAGE plpgsql;

-- Procedure for order cancellation with inventory restoration
CREATE OR REPLACE FUNCTION cancel_order(
    p_order_id BIGINT,
    p_cancellation_reason TEXT DEFAULT NULL,
    OUT p_result_message TEXT
)
RETURNS TEXT AS $$
DECLARE
    v_order_status order_status;
    v_refund_amount DECIMAL(10,2);
    v_order_exists INTEGER DEFAULT 0;
BEGIN
    p_result_message := '';
    
    BEGIN
        -- Check if order exists and get current status
        SELECT status, final_amount INTO v_order_status, v_refund_amount
        FROM orders 
        WHERE id = p_order_id;
        
        GET DIAGNOSTICS v_order_exists = ROW_COUNT;
        
        IF v_order_exists = 0 THEN
            p_result_message := 'Order not found';
            RETURN;
        END IF;
        
        IF v_order_status IN ('delivered', 'cancelled') THEN
            p_result_message := 'Order cannot be cancelled - current status is ' || v_order_status;
            RETURN;
        END IF;
        
        -- Update order status
        UPDATE orders 
        SET status = 'cancelled', 
            cancelled_at = CURRENT_TIMESTAMP,
            admin_notes = COALESCE(admin_notes, '') || E'\nCancelled: ' || COALESCE(p_cancellation_reason, 'No reason provided')
        WHERE id = p_order_id;
        
        -- Restore product quantities
        UPDATE products 
        SET quantity_available = quantity_available + oi.quantity,
            status = CASE WHEN status = 'sold' THEN 'active' ELSE status END
        FROM order_items oi
        WHERE products.id = oi.product_id AND oi.order_id = p_order_id;
        
        -- Create refund transaction record
        INSERT INTO payment_transactions (
            order_id, transaction_id, gateway, payment_method, amount, 
            currency, status, created_at
        ) VALUES (
            p_order_id, 'REFUND-' || EXTRACT(EPOCH FROM CURRENT_TIMESTAMP)::BIGINT, 
            'sslcommerz', 'sslcommerz', v_refund_amount, 'BDT', 'pending', CURRENT_TIMESTAMP
        );
        
        p_result_message := 'Order cancelled successfully and inventory restored';
        
    EXCEPTION WHEN OTHERS THEN
        p_result_message := 'Error occurred during order cancellation: ' || SQLERRM;
        RETURN;
    END;
END;
$$ LANGUAGE plpgsql;

-- Comments for reference
-- super_admin's password: password123
-- all other pass: 123456

-- ================================================================================================
-- SAMPLE QUERIES FOR TESTING AND ADMINISTRATION
-- ================================================================================================

-- Test Views
-- SELECT * FROM seller_performance_dashboard LIMIT 5;
-- SELECT * FROM enhanced_product_catalog WHERE status = 'active' LIMIT 10;
-- SELECT * FROM customer_order_history WHERE buyer_id = 1;

-- Test Functions
-- SELECT * FROM bulk_product_import(1, '[{"title":"Test Product","category":"Smartphones","brand":"TestBrand","model":"Test1","condition_grade":"good","price":1000}]');
-- SELECT cancel_order(1, 'Customer requested cancellation');

-- Query examples (commented out for PostgreSQL)
-- SELECT * FROM admin_access_codes;
-- SELECT * FROM admins;
-- SELECT * FROM buyers;
-- SELECT * FROM sellers;
-- SELECT * FROM products;
-- SELECT * FROM product_images;
-- SELECT * FROM product_categories;
-- SELECT * FROM product_conditions;
-- SELECT * FROM reviews;
-- SELECT * FROM messages;
-- SELECT * FROM conversations;
-- SELECT * FROM orders;
-- SELECT * FROM order_items;
-- SELECT * FROM cart_items;
-- SELECT * FROM wishlists;
-- SELECT * FROM payment_transactions;
-- SELECT * FROM order_status_history;