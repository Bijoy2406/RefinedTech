import { Link } from 'react-router-dom'
import '../css/Home.css'

export default function Home({ user }) {
  // Hardcoded product data
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

  if (user) {
    // Logged-in user homepage
    return (
      <section className="home">
        <div className="hero">
          <h1>Welcome back, {user.name}!</h1>
          <p>Discover amazing deals on quality gadgets from trusted sellers.</p>
          <div className="cta">
            <Link to="/marketplace" className="btn primary">Browse All Products</Link>
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
            <h2>Featured Products</h2>
            <Link to="/marketplace" className="view-all">View All →</Link>
          </div>
          <div className="products-grid">
            {featuredProducts.map((product) => (
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
            ))}
          </div>
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
      <div className="hero">
        <h1>Smart Exchange for Used Gadgets</h1>
        <p>Buy and sell phones, laptops, and accessories with trusted ratings and secure chat.</p>
        <div className="cta">
          <Link to="/signup" className="btn primary">Get Started</Link>
          <Link to="/login" className="btn ghost">I already have an account</Link>
        </div>
      </div>
      <div className="features">
        <div className="card">
          <h3>Role-based Access</h3>
          <p>Admins approve sellers and admins. Buyers browse freely.</p>
        </div>
        <div className="card">
          <h3>Chat Built-in</h3>
          <p>Buyers and sellers can message directly to finalize deals.</p>
        </div>
        <div className="card">
          <h3>Verified Reviews</h3>
          <p>Rate products and sellers to grow community trust.</p>
        </div>
      </div>
    </section>
  )
}
