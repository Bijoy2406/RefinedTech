import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import axios from 'axios'
import RotatingText from './RotatingText'
import '../css/theme.css'
import '../css/Home.css'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8000';

export default function Home({ user }) {
  const navigate = useNavigate();
  const [realProducts, setRealProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch real products if user is a buyer
  useEffect(() => {
    if (user && user.role === 'Buyer') {
      fetchProducts();
    }
  }, [user]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/api/products`);
      const products = response.data.products || [];
      // Show only first 4 products for homepage
      setRealProducts(products.slice(0, 4));
    } catch (error) {
      console.error('Error fetching products:', error);
      // Fall back to hardcoded products if API fails
      setRealProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Real categories from ProductSeeder with proper icons and item counts
  const categories = [
    { name: "Smartphones", icon: "📱", count: 5, color: "#E53935" },
    { name: "Laptops", icon: "💻", count: 5, color: "#1976D2" },
    { name: "Tablets", icon: "📱", count: 5, color: "#388E3C" },
    { name: "Desktop Computers", icon: "🖥️", count: 5, color: "#7B1FA2" },
    { name: "Gaming", icon: "🎮", count: 5, color: "#F57C00" },
    { name: "Smart Watches", icon: "⌚", count: 5, color: "#C2185B" },
    { name: "Audio & Headphones", icon: "🎧", count: 5, color: "#5D4037" },
    { name: "Cameras", icon: "📷", count: 5, color: "#455A64" },
    { name: "Accessories", icon: "🔌", count: 5, color: "#424242" },
    { name: "Other Electronics", icon: "📦", count: 5, color: "#37474F" }
  ];

  const formatPrice = (price) => {
    return `৳${parseFloat(price).toFixed(2)}`;
  };

  const handleCategoryClick = (categoryName) => {
    if (user && user.role === 'Buyer') {
      // Navigate to buyer page with category filter
      navigate(`/buyer?category=${encodeURIComponent(categoryName)}`);
    } else {
      // For non-users, navigate to buyer page which will show all products
      // They can browse but buy buttons will redirect to login
      navigate(`/buyer?category=${encodeURIComponent(categoryName)}`);
    }
  };

  const handleProductClick = (product) => {
    // Allow viewing product details for everyone
    navigate(`/product/${product.id}`);
  };

  const handleViewAllProducts = () => {
    // Navigate to buyer page for browsing
    navigate('/buyer');
  };

  const getConditionBadgeClass = (condition) => {
    const classes = {
      'like-new': 'condition-like-new',
      'excellent': 'condition-excellent',
      'good': 'condition-good',
      'fair': 'condition-fair'
    };
    return classes[condition] || 'condition-fair';
  };

  const renderRealProduct = (product) => {
    const discount = product.original_price && product.original_price > product.price ? 
      Math.round(((product.original_price - product.price) / product.original_price) * 100) : 0;

    return (
      <div 
        key={product.id} 
        className="product-card modern" 
        onClick={() => handleProductClick(product)}
        style={{ cursor: 'pointer' }}
      >
        <div className="product-image">
          {product.images && product.images.length > 0 ? (
            <img src={`${API_BASE}${product.images[0]}`} alt={product.title} style={{width: '100%', height: '200px', objectFit: 'cover'}} />
          ) : (
            <div className="product-placeholder">
              {product.category === 'Smartphones' && '📱'}
              {product.category === 'Laptops' && '💻'}
              {product.category === 'Tablets' && '📱'}
              {product.category === 'Desktop Computers' && '🖥️'}
              {product.category === 'Audio & Headphones' && '🎧'}
              {product.category === 'Gaming' && '🎮'}
              {product.category === 'Smart Watches' && '⌚'}
              {product.category === 'Cameras' && '📷'}
              {product.category === 'Accessories' && '🔌'}
              {product.category === 'Other Electronics' && '📦'}
              {!['Smartphones', 'Laptops', 'Tablets', 'Desktop Computers', 'Audio & Headphones', 'Gaming', 'Smart Watches', 'Cameras', 'Accessories', 'Other Electronics'].includes(product.category) && '📦'}
            </div>
          )}
          <div className="product-badges">
            {product.is_featured && (
              <span className="condition-badge excellent">⭐ Featured</span>
            )}
            {product.is_urgent_sale && (
              <span className="condition-badge">🔥 Urgent</span>
            )}
            {!product.is_featured && !product.is_urgent_sale && (
              <span className={`condition-badge ${product.condition_grade === 'excellent' ? 'excellent' : ''}`}>
                {product.condition_grade?.replace('-', ' ') || 'Good'}
              </span>
            )}
          </div>
        </div>
        <div className="product-info">
          <h3 className="product-name">{product.title}</h3>
          <div className="product-price">
            <span className="current-price">{formatPrice(product.price)}</span>
            {product.original_price && product.original_price > product.price && (
              <>
                <span className="original-price">{formatPrice(product.original_price)}</span>
                <span className="discount">{discount}% OFF</span>
              </>
            )}
          </div>
          <div className="product-details">
            <span className="location">📍 {product.location_city}, {product.location_state}</span>
            <span className="seller">👤 {product.seller?.shop_username || 'Seller'}</span>
          </div>
          <p className="product-description">
            {product.description ? 
              (product.description.length > 100 ? 
                product.description.substring(0, 100) + '...' : 
                product.description
              ) : 
              `${product.brand} ${product.model} in ${product.condition_grade?.replace('-', ' ')} condition.`
            }
          </p>
          <div className="product-actions">
            <button 
              className="btn primary small"
              onClick={(e) => {
                e.stopPropagation();
                handleProductClick(product);
              }}
            >
              View Details
            </button>
            <button 
              className="btn outline small"
              onClick={(e) => e.stopPropagation()}
            >
              ❤️ Save
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (user) {
    // Logged-in user homepage
    return (
      <section className="home buyer-home">
        {/* Hero Section for Buyers */}
        <div className="buyer-hero">
          <div className="hero-content">
            <div className="welcome-badge">
              <span className="badge-icon">🛒</span>
              <span>Welcome back, {user.name}!</span>
            </div>
            <h1 className="hero-title">
              Discover Amazing <span className="highlight">Tech Deals</span>
            </h1>
            <p className="hero-description">
              Browse thousands of verified refurbished electronics from trusted sellers. 
              Find your perfect device at the best price.
            </p>
            <div className="hero-stats">
              <div className="stat-item">
                <span className="stat-number">50+</span>
                <span className="stat-label">New Products Today</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">98%</span>
                <span className="stat-label">Customer Satisfaction</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">7-Day</span>
                <span className="stat-label">Return Policy</span>
              </div>
            </div>
            <div className="hero-cta">
              <Link to="/buyer" className="btn primary large">
                🔍 Browse All Products
              </Link>
              <Link to="/favorites" className="btn secondary large">
                ❤️ My Favorites
              </Link>
            </div>
          </div>
        </div>

        {/* Categories Section */}
        <div className="categories-section">
          <div className="section-header">
            <h2>Shop by Category</h2>
            <p>Find exactly what you're looking for</p>
          </div>
          <div className="categories-grid modern">
            {categories.map((category, index) => (
              <div
                key={index} 
                className="category-card modern"
                style={{ '--category-color': category.color, cursor: 'pointer' }}
                onClick={() => handleCategoryClick(category.name)}
              >
                <div className="category-icon-wrapper">
                  <div className="category-icon">{category.icon}</div>
                </div>
                <div className="category-info">
                  <h3>{category.name}</h3>
                  <span className="category-count">{category.count} items available</span>
                </div>
                <div className="category-arrow">→</div>
              </div>
            ))}
          </div>
        </div>

        {/* Featured Products Section */}
        <div className="products-section">
          <div className="section-header">
            <h2>Latest Products</h2>
            <p>Fresh arrivals from verified sellers</p>
            <button 
              className="view-all-btn"
              onClick={handleViewAllProducts}
              style={{ cursor: 'pointer', background: 'none', border: 'none', color: 'inherit' }}
            >
              View All Products <span className="arrow">→</span>
            </button>
          </div>
          
          {loading ? (
            <div className="loading-products">
              <div className="loading-grid">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="loading-card">
                    <div className="loading-image"></div>
                    <div className="loading-content">
                      <div className="loading-line large"></div>
                      <div className="loading-line medium"></div>
                      <div className="loading-line small"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="products-grid modern">
              {realProducts.length > 0 ? (
                realProducts.map(renderRealProduct)
              ) : (
                <div className="no-products-message">
                  <p>No products available at the moment. Please check back later!</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Quick Actions Section */}
        <div className="quick-actions-section">
          <h2>Quick Actions</h2>
          <div className="actions-grid">
            <Link to="/buyer/search" className="action-card">
              <div className="action-icon">🔍</div>
              <h3>Advanced Search</h3>
              <p>Find specific products with detailed filters</p>
            </Link>
            <Link to="/favorites" className="action-card">
              <div className="action-icon">❤️</div>
              <h3>My Favorites</h3>
              <p>View your saved products and wishlist</p>
            </Link>
            <Link to="/orders" className="action-card">
              <div className="action-icon">📦</div>
              <h3>My Orders</h3>
              <p>Track your purchases and order history</p>
            </Link>
            <Link to="/messages" className="action-card">
              <div className="action-icon">💬</div>
              <h3>Messages</h3>
              <p>Chat with sellers and get instant replies</p>
            </Link>
          </div>
        </div>

        {/* Trust & Safety Section */}
        <div className="trust-section">
          <div className="trust-content">
            <h2>Why Choose RefinedTech?</h2>
            <div className="trust-features">
              <div className="trust-feature">
                <div className="trust-icon">🛡️</div>
                <h4>Verified Quality</h4>
                <p>Every product tested & verified</p>
              </div>
              <div className="trust-feature">
                <div className="trust-icon">🔒</div>
                <h4>Secure Payments</h4>
                <p>Your money is safe with us</p>
              </div>
              <div className="trust-feature">
                <div className="trust-icon">📱</div>
                <h4>Direct Communication</h4>
                <p>Chat directly with sellers</p>
              </div>
              <div className="trust-feature">
                <div className="trust-icon">⭐</div>
                <h4>Trusted Reviews</h4>
                <p>Real feedback from buyers</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  // Non-logged-in user homepage
  return (
    <section className="home">
      {/* Enhanced Hero Section */}
      <div className="hero-landing">
        <div className="hero-content">
          <div className="hero-text">
            <span className="hero-badge">🚀 Trusted Marketplace</span>
            <h1 className="hero-title">
              Smart Exchange for 
              <span className="highlight">
                <RotatingText
                  texts={[' Refurbished Tech', ' Premium Electronics', ' Quality Devices', ' Tech Deals']}
                  staggerFrom={"first"}
                  staggerDuration={0.025}
                  transition={{ type: "spring", damping: 30, stiffness: 400 }}
                  rotationInterval={3000}
                  splitBy="characters"
                />
              </span>
            </h1>
            <p className="hero-description">
              Buy and sell premium refurbished electronics with confidence. 
              Join our trusted community of tech enthusiasts and discover amazing deals.
            </p>
            <div className="hero-stats">
              <div className="stat-item">
                <span className="stat-number">5,000+</span>
                <span className="stat-label">Products Listed</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">2,500+</span>
                <span className="stat-label">Happy Customers</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">98%</span>
                <span className="stat-label">Satisfaction Rate</span>
              </div>
            </div>
            <div className="hero-cta">
              <Link to="/signup" className="btn primary large">
                🌟 Get Started Today
              </Link>
              <Link to="/login" className="btn secondary large">
                👋 Welcome Back
              </Link>
            </div>
          </div>
          <div className="hero-visual">
            <div className="floating-card card-1">
              <div className="device-icon">📱</div>
              <div className="device-info">
                <span className="device-name">iPhone 13 Pro</span>
                <span className="device-price">৳50,000</span>
              </div>
            </div>
            <div className="floating-card card-2">
              <div className="device-icon">💻</div>
              <div className="device-info">
                <span className="device-name">MacBook Pro</span>
                <span className="device-price">৳145,000</span>
              </div>
            </div>
            <div className="floating-card card-3">
              <div className="device-icon">🎧</div>
              <div className="device-info">
                <span className="device-name">Sony WH-1000XM4</span>
                <span className="device-price">৳22,000</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="features-landing">
        <div className="section-header">
          <h2>Why Choose RefinedTech?</h2>
          <p>Experience the best way to buy and sell refurbished electronics</p>
        </div>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🛡️</div>
            <h3>Verified Quality</h3>
            <p>Every product is thoroughly tested and verified by our expert team before listing.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💬</div>
            <h3>Direct Communication</h3>
            <p>Chat directly with sellers and buyers through our secure messaging system.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⭐</div>
            <h3>Trusted Reviews</h3>
            <p>Build trust through our comprehensive rating and review system.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>Secure Transactions</h3>
            <p>Safe and secure payment processing with buyer protection guarantee.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📱</div>
            <h3>Role-Based Access</h3>
            <p>Streamlined experience with dedicated dashboards for buyers, sellers, and admins.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🚀</div>
            <h3>Fast & Easy</h3>
            <p>List your products or find what you need in just a few clicks.</p>
          </div>
        </div>
      </div>

      {/* Popular Categories */}
      <div className="categories-landing">
        <div className="section-header">
          <h2>Popular Categories</h2>
          <p>Find exactly what you're looking for</p>
        </div>
        <div className="categories-showcase">
          {categories.map((category, index) => (
            <div 
              key={index} 
              className="category-showcase-card"
              style={{ cursor: 'pointer' }}
              onClick={() => handleCategoryClick(category.name)}
            >
              <div className="category-icon-large">{category.icon}</div>
              <h4>{category.name}</h4>
              <span className="category-count">{category.count}+ items</span>
              <div className="category-overlay">
                <span>Explore Now →</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Testimonials */}
      <div className="testimonials-section">
        <div className="section-header">
          <h2>What Our Users Say</h2>
          <p>Join thousands of satisfied customers</p>
        </div>
        <div className="testimonials-grid">
          <div className="testimonial-card">
            <div className="testimonial-content">
              <p>"Found an amazing iPhone 13 Pro in excellent condition. The seller was honest about everything and the transaction was smooth!"</p>
            </div>
            <div className="testimonial-author">
              <div className="author-avatar">👤</div>
              <div className="author-info">
                <span className="author-name">Sarah Khan</span>
                <span className="author-role">Buyer</span>
              </div>
              <div className="testimonial-rating">⭐⭐⭐⭐⭐</div>
            </div>
          </div>
          <div className="testimonial-card">
            <div className="testimonial-content">
              <p>"Sold my old MacBook within a week! The platform made it so easy to connect with serious buyers."</p>
            </div>
            <div className="testimonial-author">
              <div className="author-avatar">👨</div>
              <div className="author-info">
                <span className="author-name">Ahmed Rahman</span>
                <span className="author-role">Seller</span>
              </div>
              <div className="testimonial-rating">⭐⭐⭐⭐⭐</div>
            </div>
          </div>
          <div className="testimonial-card">
            <div className="testimonial-content">
              <p>"The verification process gives me confidence that I'm buying quality products. Great platform!"</p>
            </div>
            <div className="testimonial-author">
              <div className="author-avatar">👩</div>
              <div className="author-info">
                <span className="author-name">Fatima Ali</span>
                <span className="author-role">Buyer</span>
              </div>
              <div className="testimonial-rating">⭐⭐⭐⭐⭐</div>
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="final-cta">
        <div className="cta-content">
          <h2>Ready to Start Trading?</h2>
          <p>Join RefinedTech today and discover the best deals on refurbished electronics</p>
          <div className="cta-buttons">
            <Link to="/signup/buyer" className="btn primary large">
              🛒 Start Buying
            </Link>
            <Link to="/signup/seller" className="btn secondary large">
              💼 Start Selling
            </Link>
          </div>
          <p className="cta-note">✨ Free to join • No hidden fees • Secure platform</p>
        </div>
      </div>
    </section>
  )
}
