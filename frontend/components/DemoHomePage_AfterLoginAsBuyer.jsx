import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import '../css/DemoHomePage_AfterLoginAsBuyer.css'

export default function DemoHomePage_AfterLoginAsBuyer() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [priceRange, setPriceRange] = useState('all')
  const [sortBy, setSortBy] = useState('newest')

  // Demo product data
  const products = [
    {
      id: 1,
      title: "iPhone 14 Pro Max",
      price: 899,
      originalPrice: 1099,
      condition: "Like New",
      seller: "TechStore Pro",
      rating: 4.8,
      reviews: 156,
      image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=300&fit=crop&auto=format",
      category: "smartphones",
      location: "New York, NY",
      featured: true
    },
    {
      id: 2,
      title: "MacBook Air M2",
      price: 999,
      originalPrice: 1199,
      condition: "Good",
      seller: "Apple Reseller",
      rating: 4.9,
      reviews: 89,
      image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=300&fit=crop&auto=format",
      category: "laptops",
      location: "California, CA",
      featured: true
    },
    {
      id: 3,
      title: "iPad Pro 12.9\"",
      price: 749,
      originalPrice: 899,
      condition: "Like New",
      seller: "Gadget Hub",
      rating: 4.7,
      reviews: 234,
      image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=300&fit=crop&auto=format",
      category: "tablets",
      location: "Texas, TX",
      featured: false
    },
    {
      id: 4,
      title: "Samsung Galaxy S23 Ultra",
      price: 799,
      originalPrice: 999,
      condition: "Good",
      seller: "Mobile World",
      rating: 4.6,
      reviews: 178,
      image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=300&fit=crop&auto=format",
      category: "smartphones",
      location: "Florida, FL",
      featured: false
    },
    {
      id: 5,
      title: "Dell XPS 13",
      price: 699,
      originalPrice: 899,
      condition: "Fair",
      seller: "Laptop Center",
      rating: 4.5,
      reviews: 92,
      image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=300&fit=crop&auto=format",
      category: "laptops",
      location: "Illinois, IL",
      featured: false
    },
    {
      id: 6,
      title: "AirPods Pro 2nd Gen",
      price: 199,
      originalPrice: 249,
      condition: "Like New",
      seller: "Audio Plus",
      rating: 4.8,
      reviews: 312,
      image: "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=400&h=300&fit=crop&auto=format",
      category: "accessories",
      location: "Washington, WA",
      featured: true
    }
  ]

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'smartphones', label: 'Smartphones' },
    { value: 'laptops', label: 'Laptops' },
    { value: 'tablets', label: 'Tablets' },
    { value: 'accessories', label: 'Accessories' }
  ]

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const getConditionBadgeClass = (condition) => {
    switch(condition) {
      case 'Like New': return 'condition-like-new'
      case 'Good': return 'condition-good'
      case 'Fair': return 'condition-fair'
      default: return 'condition-good'
    }
  }

  return (
    <div className="buyer-homepage">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>Find Your Perfect Tech</h1>
          <p>Discover amazing deals on verified pre-owned gadgets with guaranteed quality</p>
          
          {/* Search Bar */}
          <div className="search-container">
            <div className="search-bar">
              <input
                type="text"
                placeholder="Search for phones, laptops, tablets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              <button className="search-btn">🔍</button>
            </div>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="filters-section">
        <div className="filters-container">
          <div className="filter-group">
            <label>Category:</label>
            <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>
          
          <div className="filter-group">
            <label>Price Range:</label>
            <select value={priceRange} onChange={(e) => setPriceRange(e.target.value)}>
              <option value="all">All Prices</option>
              <option value="0-200">$0 - $200</option>
              <option value="200-500">$200 - $500</option>
              <option value="500-1000">$500 - $1000</option>
              <option value="1000+">$1000+</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Sort By:</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="newest">Newest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="featured-section">
        <h2>🌟 Featured Deals</h2>
        <div className="products-grid featured-grid">
          {products.filter(p => p.featured).map(product => (
            <div key={product.id} className="product-card featured-card">
              <div className="product-image">
                <img src={product.image} alt={product.title} />
                <div className="featured-badge">Featured</div>
                <div className={`condition-badge ${getConditionBadgeClass(product.condition)}`}>
                  {product.condition}
                </div>
              </div>
              <div className="product-info">
                <h3>{product.title}</h3>
                <div className="price-section">
                  <span className="current-price">${product.price}</span>
                  <span className="original-price">${product.originalPrice}</span>
                  <span className="savings">Save ${product.originalPrice - product.price}</span>
                </div>
                <div className="seller-info">
                  <span className="seller-name">👤 {product.seller}</span>
                  <div className="rating">
                    <span className="stars">⭐ {product.rating}</span>
                    <span className="review-count">({product.reviews})</span>
                  </div>
                </div>
                <div className="location">📍 {product.location}</div>
                <div className="product-actions">
                  <button className="btn-primary">View Details</button>
                  <button className="btn-secondary">💝 Wishlist</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* All Products */}
      <section className="products-section">
        <div className="section-header">
          <h2>All Products</h2>
          <div className="results-count">
            {filteredProducts.length} products found
          </div>
        </div>
        
        <div className="products-grid">
          {filteredProducts.map(product => (
            <div key={product.id} className="product-card">
              <div className="product-image">
                <img src={product.image} alt={product.title} />
                <div className={`condition-badge ${getConditionBadgeClass(product.condition)}`}>
                  {product.condition}
                </div>
              </div>
              <div className="product-info">
                <h3>{product.title}</h3>
                <div className="price-section">
                  <span className="current-price">${product.price}</span>
                  <span className="original-price">${product.originalPrice}</span>
                </div>
                <div className="seller-info">
                  <span className="seller-name">👤 {product.seller}</span>
                  <div className="rating">
                    <span className="stars">⭐ {product.rating}</span>
                    <span className="review-count">({product.reviews})</span>
                  </div>
                </div>
                <div className="location">📍 {product.location}</div>
                <div className="product-actions">
                  <button className="btn-primary">View Details</button>
                  <button className="btn-secondary">💝 Wishlist</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories Section */}
      <section className="categories-section">
        <h2>Shop by Category</h2>
        <div className="categories-grid">
          <div className="category-card">
            <div className="category-icon">📱</div>
            <h3>Smartphones</h3>
            <p>iPhone, Samsung, Google Pixel & more</p>
            <Link to="/category/smartphones" className="category-link">Browse →</Link>
          </div>
          <div className="category-card">
            <div className="category-icon">💻</div>
            <h3>Laptops</h3>
            <p>MacBook, Dell, HP, Lenovo & more</p>
            <Link to="/category/laptops" className="category-link">Browse →</Link>
          </div>
          <div className="category-card">
            <div className="category-icon">📋</div>
            <h3>Tablets</h3>
            <p>iPad, Samsung Tab, Surface & more</p>
            <Link to="/category/tablets" className="category-link">Browse →</Link>
          </div>
          <div className="category-card">
            <div className="category-icon">🎧</div>
            <h3>Accessories</h3>
            <p>AirPods, Watches, Cases & more</p>
            <Link to="/category/accessories" className="category-link">Browse →</Link>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="trust-section">
        <h2>Why Choose RefinedTech?</h2>
        <div className="trust-features">
          <div className="trust-item">
            <div className="trust-icon">🛡️</div>
            <h3>Verified Quality</h3>
            <p>Every device is tested and verified by our experts</p>
          </div>
          <div className="trust-item">
            <div className="trust-icon">💰</div>
            <h3>Best Prices</h3>
            <p>Up to 70% off retail prices with quality guarantee</p>
          </div>
          <div className="trust-item">
            <div className="trust-icon">🚚</div>
            <h3>Fast Shipping</h3>
            <p>Free shipping on orders over $200</p>
          </div>
          <div className="trust-item">
            <div className="trust-icon">🔄</div>
            <h3>Easy Returns</h3>
            <p>30-day return policy for peace of mind</p>
          </div>
        </div>
      </section>
    </div>
  )
}
