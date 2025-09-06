import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import axios from 'axios'
import '../css/Home.css'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8000';

export default function Home({ user }) {
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

  // Hardcoded product data (fallback for non-buyers or API failure)
  const featuredProducts = [
    {
      id: 1,
      name: "iPhone 13 Pro Max",
      price: 850,
      originalPrice: 1200,
      condition: "Excellent",
      category: "Phones",
      location: "Dhaka, Bangladesh",
      seller: "TechTrader",
      rating: 4.8,
      image: "/Assets/placeholders/phone1.jpg",
      description: "Barely used iPhone 13 Pro Max in excellent condition. Comes with original box and accessories."
    },
    {
      id: 2,
      name: "MacBook Pro M2",
      price: 1450,
      originalPrice: 2000,
      condition: "Good",
      category: "Laptops",
      location: "Chittagong, Bangladesh",
      seller: "GadgetGuru",
      rating: 4.9,
      image: "/Assets/placeholders/laptop1.jpg",
      description: "Powerful MacBook Pro M2 with 16GB RAM. Perfect for work and creative tasks."
    },
    {
      id: 3,
      name: "Sony WH-1000XM4",
      price: 220,
      originalPrice: 350,
      condition: "Very Good",
      category: "Audio",
      location: "Sylhet, Bangladesh",
      seller: "AudioExpert",
      rating: 4.7,
      image: "/Assets/placeholders/headphones1.jpg",
      description: "Premium noise-canceling headphones. Crystal clear sound quality."
    },
    {
      id: 4,
      name: "iPad Air 5th Gen",
      price: 480,
      originalPrice: 600,
      condition: "Like New",
      category: "Tablets",
      location: "Khulna, Bangladesh",
      seller: "TabletTrader",
      rating: 4.6,
      image: "/Assets/placeholders/tablet1.jpg",
      description: "Latest iPad Air with M1 chip. Perfect for students and professionals."
    }
  ];

  const categories = [
    { name: "Phones", icon: "📱", count: 245 },
    { name: "Laptops", icon: "💻", count: 189 },
    { name: "Tablets", icon: "📱", count: 67 },
    { name: "Audio", icon: "🎧", count: 134 },
    { name: "Gaming", icon: "🎮", count: 98 },
    { name: "Accessories", icon: "🔌", count: 312 }
  ];

  const formatPrice = (price) => {
    return `$${parseFloat(price).toFixed(2)}`;
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
    return (
      <div key={product.id} className="product-card">
        <div className="product-image">
          {product.images && product.images.length > 0 ? (
            <img src={product.images[0]} alt={product.title} style={{width: '100%', height: '200px', objectFit: 'cover'}} />
          ) : (
            <div className="product-placeholder">
              {product.category === 'Smartphones' && '📱'}
              {product.category === 'Laptops' && '💻'}
              {product.category === 'Tablets' && '📱'}
              {product.category === 'Audio & Headphones' && '🎧'}
              {product.category === 'Gaming' && '🎮'}
              {!['Smartphones', 'Laptops', 'Tablets', 'Audio & Headphones', 'Gaming'].includes(product.category) && '📦'}
            </div>
          )}
          {product.is_featured && (
            <div className="featured-badge">⭐ Featured</div>
          )}
          {product.is_urgent_sale && (
            <div className="urgent-badge">🔥 Urgent</div>
          )}
        </div>
        <div className="product-info">
          <h3 className="product-name">{product.title}</h3>
          <div className="product-price">
            <span className="current-price">{formatPrice(product.price)}</span>
            {product.original_price && product.original_price > product.price && (
              <span className="original-price">{formatPrice(product.original_price)}</span>
            )}
          </div>
          <div className="product-details">
            <span className={`condition ${getConditionBadgeClass(product.condition_grade)}`}>
              {product.condition_grade?.replace('-', ' ') || 'Good'}
            </span>
            <span className="location">📍 {product.location_city}, {product.location_state}</span>
          </div>
          <div className="seller-info">
            <span className="seller">Seller: {product.seller?.shop_username || 'Seller'}</span>
            <span className="rating">👁️ {product.views_count || 0} views</span>
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
            <Link to={`/buyer`} className="btn small primary">View Details</Link>
            <button className="btn small outline">Contact Seller</button>
          </div>
        </div>
      </div>
    );
  };

  if (user) {
    // Logged-in user homepage
    return (
      <section className="home">
        <div className="hero">
          <h1>Welcome back, {user.name}!</h1>
          <p>
            {user.role === 'Buyer' 
              ? "Discover amazing deals on quality refurbished electronics from trusted sellers." 
              : "Discover amazing deals on quality gadgets from trusted sellers."
            }
          </p>
          <div className="cta">
            <Link to={user.role === 'Buyer' ? '/buyer' : '/marketplace'} className="btn primary">
              {user.role === 'Buyer' ? 'Browse All Products' : 'Browse All Products'}
            </Link>
            <Link to="/sell" className="btn ghost">Sell Your Gadgets</Link>
          </div>
        </div>

        {/* Categories Section */}
        <div className="categories-section">
          <h2>Shop by Category</h2>
          <div className="categories-grid">
            {categories.map((category, index) => (
              <Link key={index} to={`/category/${category.name.toLowerCase()}`} className="category-card">
                <div className="category-icon">{category.icon}</div>
                <div className="category-info">
                  <h3>{category.name}</h3>
                  <span className="category-count">{category.count} items</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Featured Products Section */}
        <div className="products-section">
          <div className="section-header">
            <h2>{user.role === 'Buyer' ? 'Latest Products' : 'Featured Products'}</h2>
            <Link to={user.role === 'Buyer' ? '/buyer' : '/marketplace'} className="view-all">View All →</Link>
          </div>
          
          {user.role === 'Buyer' && loading ? (
            <div className="loading-products">
              <div className="spinner"></div>
              <p>Loading latest products...</p>
            </div>
          ) : (
            <div className="products-grid">
              {user.role === 'Buyer' && realProducts.length > 0 ? (
                realProducts.map(renderRealProduct)
              ) : (
                featuredProducts.map((product) => (
                  <div key={product.id} className="product-card">
                    <div className="product-image">
                      <div className="product-placeholder">
                        {product.category === 'Phones' && '📱'}
                        {product.category === 'Laptops' && '💻'}
                        {product.category === 'Tablets' && '📱'}
                        {product.category === 'Audio' && '🎧'}
                      </div>
                    </div>
                    <div className="product-info">
                      <h3 className="product-name">{product.name}</h3>
                      <div className="product-price">
                        <span className="current-price">${product.price}</span>
                        <span className="original-price">${product.originalPrice}</span>
                      </div>
                      <div className="product-details">
                        <span className="condition">{product.condition}</span>
                        <span className="location">📍 {product.location}</span>
                      </div>
                      <div className="seller-info">
                        <span className="seller">Seller: {product.seller}</span>
                        <span className="rating">⭐ {product.rating}</span>
                      </div>
                      <p className="product-description">{product.description}</p>
                      <div className="product-actions">
                        <Link to={`/product/${product.id}`} className="btn small primary">View Details</Link>
                        <button className="btn small outline">Contact Seller</button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="features">
          <div className="card">
            <h3>Quick Actions</h3>
            <p>Manage your listings, check messages, or update your profile.</p>
            <div className="quick-actions">
              <Link to="/my-listings" className="btn small">My Listings</Link>
              <Link to="/favorites" className="btn small outline">Favorites</Link>
              <Link to="/messages" className="btn small outline">Messages</Link>
            </div>
          </div>
          <div className="card">
            <h3>Marketplace Tips</h3>
            <p>Get the best deals by checking seller ratings and product conditions.</p>
          </div>
          <div className="card">
            <h3>Recent Activity</h3>
            <p>Stay updated with your latest interactions and deals.</p>
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
              <span className="highlight"> Refurbished Tech</span>
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
                <span className="device-price">$850</span>
              </div>
            </div>
            <div className="floating-card card-2">
              <div className="device-icon">💻</div>
              <div className="device-info">
                <span className="device-name">MacBook Pro</span>
                <span className="device-price">$1,450</span>
              </div>
            </div>
            <div className="floating-card card-3">
              <div className="device-icon">🎧</div>
              <div className="device-info">
                <span className="device-name">Sony WH-1000XM4</span>
                <span className="device-price">$220</span>
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
            <Link key={index} to="/signup" className="category-showcase-card">
              <div className="category-icon-large">{category.icon}</div>
              <h4>{category.name}</h4>
              <span className="category-count">{category.count}+ items</span>
              <div className="category-overlay">
                <span>Explore Now →</span>
              </div>
            </Link>
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
