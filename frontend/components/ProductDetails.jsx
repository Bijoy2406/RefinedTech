import { useParams, Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import '../css/ProductDetails.css'

export default function ProductDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  
  // Hardcoded product data (in real app, this would come from API)
  const allProducts = [
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
      reviews: 24,
      postedDate: "2025-08-20",
      description: "Barely used iPhone 13 Pro Max in excellent condition. Comes with original box and accessories.",
      specifications: {
        "Storage": "256GB",
        "Color": "Sierra Blue",
        "Network": "5G",
        "Battery Health": "96%",
        "Warranty": "None"
      },
      images: [
        "/Assets/placeholders/phone1.jpg",
        "/Assets/placeholders/phone1-2.jpg",
        "/Assets/placeholders/phone1-3.jpg"
      ],
      features: ["Face ID", "Triple Camera System", "A15 Bionic chip", "MagSafe compatible"]
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
      reviews: 18,
      postedDate: "2025-08-18",
      description: "Powerful MacBook Pro M2 with 16GB RAM. Perfect for work and creative tasks.",
      specifications: {
        "Processor": "Apple M2",
        "RAM": "16GB",
        "Storage": "512GB SSD",
        "Screen": "13.3-inch Retina",
        "Warranty": "6 months seller warranty"
      },
      images: [
        "/Assets/placeholders/laptop1.jpg",
        "/Assets/placeholders/laptop1-2.jpg"
      ],
      features: ["M2 chip", "16GB unified memory", "10-core GPU", "Touch ID"]
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
      reviews: 31,
      postedDate: "2025-08-22",
      description: "Premium noise-canceling headphones. Crystal clear sound quality.",
      specifications: {
        "Type": "Over-ear",
        "Connectivity": "Bluetooth 5.0, Wired",
        "Battery": "30 hours",
        "Noise Canceling": "Active",
        "Color": "Black"
      },
      images: [
        "/Assets/placeholders/headphones1.jpg"
      ],
      features: ["Active Noise Canceling", "30-hour battery", "Quick Charge", "Touch controls"]
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
      reviews: 12,
      postedDate: "2025-08-25",
      description: "Latest iPad Air with M1 chip. Perfect for students and professionals.",
      specifications: {
        "Processor": "Apple M1",
        "Storage": "64GB",
        "Screen": "10.9-inch Liquid Retina",
        "Color": "Space Gray",
        "Cellular": "Wi-Fi only"
      },
      images: [
        "/Assets/placeholders/tablet1.jpg"
      ],
      features: ["M1 chip", "12MP cameras", "USB-C", "Apple Pencil compatible"]
    }
  ]

  useEffect(() => {
    const foundProduct = allProducts.find(p => p.id === parseInt(id))
    setProduct(foundProduct)
  }, [id])

  if (!product) {
    return (
      <div className="product-details-container">
        <div className="not-found">
          <h2>Product not found</h2>
          <Link to="/" className="btn primary">Back to Home</Link>
        </div>
      </div>
    )
  }

  const savings = product.originalPrice - product.price
  const savingsPercentage = Math.round((savings / product.originalPrice) * 100)

  return (
    <div className="product-details-container">
      <div className="breadcrumb">
        <Link to="/">Home</Link> / <Link to="/marketplace">Marketplace</Link> / {product.name}
      </div>

      <div className="product-details">
        <div className="product-images">
          <div className="main-image">
            <div className="product-placeholder-large">
              {product.category === 'Phones' && '📱'}
              {product.category === 'Laptops' && '💻'}
              {product.category === 'Tablets' && '📱'}
              {product.category === 'Audio' && '🎧'}
            </div>
          </div>
          {product.images.length > 1 && (
            <div className="thumbnail-images">
              {product.images.map((img, index) => (
                <div key={index} className="thumbnail">
                  <div className="product-placeholder-thumb">
                    {product.category === 'Phones' && '📱'}
                    {product.category === 'Laptops' && '💻'}
                    {product.category === 'Tablets' && '📱'}
                    {product.category === 'Audio' && '🎧'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="product-info">
          <div className="product-header">
            <h1>{product.name}</h1>
            <div className="product-meta">
              <span className="category-badge">{product.category}</span>
              <span className="condition-badge condition-{product.condition.toLowerCase().replace(' ', '-')}">{product.condition}</span>
            </div>
          </div>

          <div className="pricing">
            <div className="current-price">${product.price}</div>
            <div className="original-price">${product.originalPrice}</div>
            <div className="savings">Save ${savings} ({savingsPercentage}%)</div>
          </div>

          <div className="seller-section">
            <div className="seller-info">
              <div className="seller-avatar">
                <span>{product.seller.charAt(0)}</span>
              </div>
              <div className="seller-details">
                <h3>{product.seller}</h3>
                <div className="seller-rating">
                  <span className="stars">⭐ {product.rating}</span>
                  <span className="review-count">({product.reviews} reviews)</span>
                </div>
                <div className="location">📍 {product.location}</div>
              </div>
            </div>
            <div className="seller-actions">
              <button className="btn primary">Contact Seller</button>
              <button className="btn outline">View Profile</button>
            </div>
          </div>

          <div className="product-description">
            <h3>Description</h3>
            <p>{product.description}</p>
          </div>

          <div className="product-features">
            <h3>Key Features</h3>
            <ul>
              {product.features.map((feature, index) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>
          </div>

          <div className="action-buttons">
            <button className="btn primary large">Make Offer</button>
            <button className="btn outline large">Add to Favorites</button>
            <button className="btn ghost large">Share</button>
          </div>
        </div>
      </div>

      <div className="product-specifications">
        <h3>Specifications</h3>
        <div className="specs-grid">
          {Object.entries(product.specifications).map(([key, value]) => (
            <div key={key} className="spec-item">
              <span className="spec-label">{key}</span>
              <span className="spec-value">{value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="additional-info">
        <div className="info-item">
          <strong>Posted:</strong> {new Date(product.postedDate).toLocaleDateString()}
        </div>
        <div className="info-item">
          <strong>Product ID:</strong> {product.id}
        </div>
      </div>
    </div>
  )
}
