import { useParams, Link, useNavigate } from 'react-router-dom'
import { useState, useEffect, useContext } from 'react'
import { UserContext } from '../App.jsx'
import axios from 'axios'
import '../css/ProductDetails.css'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8000';

function ProductDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useContext(UserContext)
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchProduct()
  }, [id])

  const fetchProduct = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${API_BASE}/api/products/${id}`)
      setProduct(response.data.product)
    } catch (error) {
      console.error('Error fetching product:', error)
      setError('Product not found')
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = () => {
    if (!user) {
      navigate('/login')
      return
    }
    // TODO: Implement add to cart functionality
    alert('Add to cart functionality will be implemented here')
  }

  const handleBuyNow = () => {
    if (!user) {
      navigate('/login')
      return
    }
    // TODO: Implement buy now functionality
    navigate('/buy')
  }

  if (loading) {
    return (
      <div className="product-details-container">
        <div className="loading">Loading product details...</div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="product-details-container">
        <div className="not-found">
          <h2>{error || 'Product not found'}</h2>
          <Link to="/" className="btn primary">Back to Home</Link>
        </div>
      </div>
    )
  }

  const formatPrice = (price) => {
    return `৳${parseFloat(price).toFixed(2)}`;
  };

  const savings = product.original_price && product.original_price > product.price ? 
    product.original_price - product.price : 0;
  const savingsPercentage = savings > 0 ? Math.round((savings / product.original_price) * 100) : 0;

  // Handle images properly - they might be a string or array
  const getProductImages = () => {
    if (!product.images) return [];
    if (typeof product.images === 'string') {
      try {
        return JSON.parse(product.images);
      } catch {
        return [product.images];
      }
    }
    if (Array.isArray(product.images)) {
      return product.images;
    }
    return [];
  };

  const productImages = getProductImages();

  return (
    <div className="product-details-container">
      <div className="breadcrumb">
        <Link to="/">Home</Link> / <Link to="/buyer">Products</Link> / {product.title}
      </div>

      <div className="product-details">
        <div className="product-images">
          <div className="main-image">
            {productImages.length > 0 ? (
              <img src={`${API_BASE}${productImages[0]}`} alt={product.title} />
            ) : (
              <div className="product-placeholder-large">
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
              </div>
            )}
          </div>
          {productImages.length > 1 && (
            <div className="thumbnail-images">
              {productImages.slice(1).map((img, index) => (
                <div key={index} className="thumbnail">
                  <img src={`${API_BASE}${img}`} alt={`${product.title} ${index + 2}`} />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="product-info">
          <div className="product-header">
            <h1>{product.title}</h1>
            <div className="product-meta">
              <span className="category-badge">{product.category}</span>
              <span className={`condition-badge ${product.condition_grade?.toLowerCase().replace('-', '')}`}>
                {product.condition_grade?.replace('-', ' ') || 'Good'}
              </span>
              {product.is_featured && <span className="badge featured">⭐ Featured</span>}
              {product.is_urgent_sale && <span className="badge urgent">🔥 Urgent Sale</span>}
              {product.negotiable && <span className="badge negotiable">💬 Negotiable</span>}
            </div>
          </div>

          <div className="pricing">
            <div className="current-price">{formatPrice(product.price)}</div>
            {product.original_price && product.original_price > product.price && (
              <>
                <div className="original-price">{formatPrice(product.original_price)}</div>
                <div className="savings">Save {formatPrice(savings)} ({savingsPercentage}%)</div>
              </>
            )}
            <div className="pricing-meta">
              {product.negotiable && <span className="negotiable-text">💬 Price negotiable</span>}
              <span className="quantity">📦 {product.quantity_available} available</span>
            </div>
          </div>

          <div className="action-buttons">
            <button className="btn primary large" onClick={handleBuyNow}>
              {user ? 'Buy Now' : 'Login to Buy'}
            </button>
            <button className="btn secondary large" onClick={handleAddToCart}>
              {user ? 'Add to Cart' : 'Login to Add Cart'}
            </button>
            <button className="btn outline large">Add to Favorites</button>
          </div>

          {/* Quick Info Cards */}
          <div className="quick-info-grid">
            {product.brand && (
              <div className="info-card">
                <span className="info-label">Brand</span>
                <span className="info-value">{product.brand}</span>
              </div>
            )}
            {product.model && (
              <div className="info-card">
                <span className="info-label">Model</span>
                <span className="info-value">{product.model}</span>
              </div>
            )}
            {product.warranty_period && (
              <div className="info-card">
                <span className="info-label">Warranty</span>
                <span className="info-value">{product.warranty_period}</span>
              </div>
            )}
            {product.location_city && (
              <div className="info-card">
                <span className="info-label">Location</span>
                <span className="info-value">📍 {product.location_city}, {product.location_state}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Compact Information Sections */}
      <div className="info-sections">
        
        {/* Description */}
        <div className="info-section">
          <h3>📝 Description</h3>
          <p>{product.description || 'No description available.'}</p>
        </div>

        {/* Specifications in 2-column layout */}
        <div className="info-section">
          <h3>⚙️ Specifications</h3>
          <div className="specs-compact">
            <div className="specs-column">
              {product.processor && <div className="spec-row"><span>Processor:</span> <span>{product.processor}</span></div>}
              {product.ram_memory && <div className="spec-row"><span>RAM:</span> <span>{product.ram_memory}</span></div>}
              {product.storage_capacity && <div className="spec-row"><span>Storage:</span> <span>{product.storage_capacity}</span></div>}
              {product.operating_system && <div className="spec-row"><span>OS:</span> <span>{product.operating_system}</span></div>}
              {product.screen_size && <div className="spec-row"><span>Screen:</span> <span>{product.screen_size}</span></div>}
            </div>
            <div className="specs-column">
              {product.color && <div className="spec-row"><span>Color:</span> <span>{product.color}</span></div>}
              {product.battery_health && <div className="spec-row"><span>Battery:</span> <span>{product.battery_health}</span></div>}
              {product.connectivity && <div className="spec-row"><span>Connectivity:</span> <span>{product.connectivity}</span></div>}
              {product.dimensions && <div className="spec-row"><span>Dimensions:</span> <span>{product.dimensions}</span></div>}
              {product.shipping_weight && <div className="spec-row"><span>Weight:</span> <span>{product.shipping_weight}</span></div>}
            </div>
          </div>
        </div>

        {/* Condition - Compact */}
        <div className="info-section">
          <h3>🔍 Condition & Usage</h3>
          <div className="condition-compact">
            {product.condition_description && <p className="condition-desc">{product.condition_description}</p>}
            <div className="condition-details">
              {product.purchase_date && <span>📅 Purchased: {new Date(product.purchase_date).toLocaleDateString()}</span>}
              {product.usage_duration && <span>⏱️ Used for: {product.usage_duration}</span>}
            </div>
            {product.reason_for_selling && (
              <div className="selling-reason">
                <strong>Reason for selling:</strong> {product.reason_for_selling}
              </div>
            )}
          </div>
        </div>

        {/* Additional Info - Only if exists */}
        {(product.included_accessories || product.defects_issues) && (
          <div className="info-section">
            <h3>📋 Additional Information</h3>
            {product.included_accessories && (
              <div className="additional-item">
                <strong>✅ Included:</strong> {product.included_accessories}
              </div>
            )}
            {product.defects_issues && (
              <div className="additional-item issues">
                <strong>⚠️ Known Issues:</strong> {product.defects_issues}
              </div>
            )}
          </div>
        )}

        {/* Seller Info - Compact */}
        <div className="info-section">
          <h3>👤 Seller Information</h3>
          <div className="seller-compact">
            <div className="seller-profile">
              <div className="seller-avatar">
                <span>{product.seller?.shop_username?.charAt(0) || 'S'}</span>
              </div>
              <div className="seller-info-compact">
                <h4>{product.seller?.shop_username || 'Seller'}</h4>
                <div className="seller-meta">
                  📍 {product.location_city}, {product.location_state}
                  {product.seller?.email && <span>📧 Contact available</span>}
                </div>
              </div>
            </div>
            <div className="seller-actions-compact">
              <button 
                className="btn primary small"
                onClick={() => {
                  if (!user) {
                    navigate('/login');
                    return;
                  }
                  alert('Contact seller functionality will be implemented here');
                }}
              >
                💬 {user ? 'Contact' : 'Login to Contact'}
              </button>
              <button className="btn outline small">View Profile</button>
            </div>
          </div>
        </div>

        {/* Policies - Only if exists */}
        {(product.return_policy || product.shipping_options) && (
          <div className="info-section">
            <h3>📋 Policies</h3>
            <div className="policies-compact">
              {product.return_policy && (
                <div className="policy-item-compact">
                  <strong>Return Policy:</strong> {product.return_policy}
                </div>
              )}
              {product.shipping_options && (
                <div className="policy-item-compact">
                  <strong>Shipping:</strong> {product.shipping_options}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tags - Only if exists */}
        {product.tags && (
          <div className="info-section">
            <h3>🏷️ Tags</h3>
            <div className="tags-compact">
              {product.tags.split(',').map((tag, index) => (
                <span key={index} className="tag-compact">{tag.trim()}</span>
              ))}
            </div>
          </div>
        )}
      </div>      
    </div>
  )
}

export default ProductDetails
