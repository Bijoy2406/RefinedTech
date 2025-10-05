import { useParams, Link, useNavigate } from 'react-router-dom'
import { useState, useEffect, useContext } from 'react'
import { UserContext } from '../App.jsx'
import axios from 'axios'
import LottieLoading from './LottieLoading'
import '../css/ProductDetails.css'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8000';

function ProductDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useContext(UserContext)
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [addingToCart, setAddingToCart] = useState(false)
  const [cartMessage, setCartMessage] = useState('')
  const [isInWishlist, setIsInWishlist] = useState(false)
  const [wishlistLoading, setWishlistLoading] = useState(false)
  const [wishlistMessage, setWishlistMessage] = useState('')
  const [showContactModal, setShowContactModal] = useState(false)
  const [contactMessage, setContactMessage] = useState('')
  const [sendingMessage, setSendingMessage] = useState(false)

  useEffect(() => {
    fetchProduct()
    if (user && user.role === 'Buyer') {
      checkWishlistStatus()
    }
  }, [id, user])

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

  const checkWishlistStatus = async () => {
    try {
      const token = localStorage.getItem('rt_token')
      const response = await axios.get(`${API_BASE}/api/wishlist/check/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setIsInWishlist(response.data.in_wishlist)
    } catch (error) {
      console.error('Error checking wishlist status:', error)
    }
  }

  const handleAddToCart = async (quantity = 1) => {
    if (!user) {
      navigate('/login')
      return
    }

    if (user.role !== 'Buyer') {
      setCartMessage('Only buyers can add items to cart')
      return
    }

    setAddingToCart(true)
    setCartMessage('')

    try {
      const token = localStorage.getItem('rt_token')
      const response = await axios.post(`${API_BASE}/api/cart/add`, {
        product_id: product.id,
        quantity: quantity
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.data.success) {
        setCartMessage('✅ Added to cart successfully!')
        
        // Clear message after 3 seconds
        setTimeout(() => {
          setCartMessage('')
        }, 3000)
      }
    } catch (error) {
      console.error('Error adding to cart:', error)
      if (error.response?.data?.message) {
        setCartMessage(`❌ ${error.response.data.message}`)
      } else {
        setCartMessage('❌ Failed to add to cart')
      }
    } finally {
      setAddingToCart(false)
    }
  }

  const handleBuyNow = async (quantity = 1) => {
    console.log('🛒 BUY NOW CLICKED - Starting process...')
    console.log('User:', user)
    console.log('Product ID:', product.id)
    console.log('Quantity:', quantity)
    
    if (!user) {
      console.log('❌ No user logged in - redirecting to login')
      navigate('/login')
      return
    }

    if (user.role !== 'Buyer') {
      const message = 'Only buyers can purchase items'
      console.log('❌ Role check failed:', message)
      alert(message)
      return
    }

    // Show loading indicator
    console.log('⏳ Setting loading state...')
    setLoading(true)
    setError(null)

    try {
      const token = localStorage.getItem('rt_token')
      console.log('🔑 Token retrieved:', token ? 'Token exists' : 'No token found')
      
      // Create order directly with buyer's saved information
      console.log('📦 Step 1: Creating order...')
      console.log('Request URL:', `${API_BASE}/api/orders/create-direct`)
      console.log('Request Data:', {
        product_id: parseInt(product.id),
        quantity: quantity,
        payment_method: 'sslcommerz'
      })
      
      const createOrderResponse = await axios.post(`${API_BASE}/api/orders/create-direct`, {
        product_id: parseInt(product.id),
        quantity: quantity,
        payment_method: 'sslcommerz'
      }, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      console.log('✅ Order creation response:', createOrderResponse.data)

      if (createOrderResponse.data.success) {
        const createdOrder = createOrderResponse.data.order
        console.log('✅ Order created successfully! Order ID:', createdOrder.id)
        console.log('Order details:', createdOrder)
        
        // Initiate payment immediately
        console.log('💳 Step 2: Initiating payment...')
        console.log('Request URL:', `${API_BASE}/api/payment/initiate`)
        console.log('Request Data:', { order_id: createdOrder.id })
        
        const paymentResponse = await axios.post(`${API_BASE}/api/payment/initiate`, {
          order_id: createdOrder.id
        }, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        console.log('✅ Payment initiation response:', paymentResponse.data)

        if (paymentResponse.data.success) {
          console.log('✅ Payment initiated successfully!')
          console.log('🌐 Payment URL:', paymentResponse.data.payment_url)
          console.log('🚀 Redirecting to SSLCommerz...')
          // Redirect to SSLCommerz payment gateway
          window.location.href = paymentResponse.data.payment_url
        } else {
          const errorMsg = paymentResponse.data.message || 'Failed to initiate payment'
          console.log('❌ Payment initiation failed:', errorMsg)
          throw new Error(errorMsg)
        }
      } else {
        const errorMsg = createOrderResponse.data.message || 'Failed to create order'
        console.log('❌ Order creation failed:', errorMsg)
        throw new Error(errorMsg)
      }
    } catch (error) {
      console.error('❌ ERROR in Buy Now process:', error)
      console.log('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText
      })
      
      setLoading(false)
      
      let errorMessage = ''
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message
        console.log('📢 Showing error from API:', errorMessage)
        alert(errorMessage)
      } else if (error.message) {
        errorMessage = error.message
        console.log('📢 Showing error message:', errorMessage)
        alert(errorMessage)
      } else {
        errorMessage = 'Failed to process order. Please try again.'
        console.log('📢 Showing generic error:', errorMessage)
        alert(errorMessage)
      }
      console.log('🔔 Alert/Toast message that would be shown:', errorMessage)
    }
  }

  const handleWishlistToggle = async () => {
    if (!user) {
      navigate('/login')
      return
    }

    if (user.role !== 'Buyer') {
      setWishlistMessage('Only buyers can manage wishlists')
      return
    }

    setWishlistLoading(true)
    setWishlistMessage('')

    try {
      const token = localStorage.getItem('rt_token')
      
      if (isInWishlist) {
        // Remove from wishlist
        await axios.delete(`${API_BASE}/api/wishlist/remove/${product.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        setIsInWishlist(false)
        setWishlistMessage('💔 Removed from wishlist')
      } else {
        // Add to wishlist
        await axios.post(`${API_BASE}/api/wishlist/add`, {
          product_id: product.id
        }, {
          headers: { Authorization: `Bearer ${token}` }
        })
        setIsInWishlist(true)
        setWishlistMessage('❤️ Added to wishlist!')
      }

      // Clear message after 3 seconds
      setTimeout(() => {
        setWishlistMessage('')
      }, 3000)

    } catch (error) {
      console.error('Error toggling wishlist:', error)
      if (error.response?.data?.message) {
        setWishlistMessage(`❌ ${error.response.data.message}`)
      } else {
        setWishlistMessage('❌ Failed to update wishlist')
      }
    } finally {
      setWishlistLoading(false)
    }
  }

  const handleContactSeller = () => {
    if (!user) {
      navigate('/login')
      return
    }

    if (user.role !== 'Buyer') {
      alert('Only buyers can contact sellers')
      return
    }

    setShowContactModal(true)
  }

  const handleSendMessage = async () => {
    if (!contactMessage.trim()) {
      alert('Please enter a message')
      return
    }

    setSendingMessage(true)

    try {
      const token = localStorage.getItem('rt_token')
      const response = await axios.post(`${API_BASE}/api/conversations/start`, {
        product_id: product.id,
        message: contactMessage,
        subject: `Inquiry about ${product.title}`
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.data.success) {
        alert('Message sent successfully! You can view the conversation in your messages.')
        setShowContactModal(false)
        setContactMessage('')
      }
    } catch (error) {
      console.error('Error sending message:', error)
      if (error.response?.data?.message) {
        alert(`Failed to send message: ${error.response.data.message}`)
      } else {
        alert('Failed to send message. Please try again.')
      }
    } finally {
      setSendingMessage(false)
    }
  }

  if (loading) {
    return <LottieLoading message="Loading product details..." />;
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
            <button className="btn primary large" onClick={() => handleBuyNow()}>
              {user ? 'Buy Now' : 'Login to Buy'}
            </button>
            <button 
              className="btn secondary large" 
              onClick={() => handleAddToCart()}
              disabled={addingToCart}
            >
              {addingToCart ? 'Adding...' : (user ? 'Add to Cart' : 'Login to Add Cart')}
            </button>
            <button 
              className={`btn outline large wishlist-btn ${isInWishlist ? 'in-wishlist' : ''}`}
              onClick={handleWishlistToggle}
              disabled={wishlistLoading}
              title={isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
            >
              {wishlistLoading ? (
                '⏳'
              ) : (
                <>
                  {isInWishlist ? '❤️' : '🤍'} 
                  {user ? (isInWishlist ? 'In Wishlist' : 'Add to Wishlist') : 'Login to Wishlist'}
                </>
              )}
            </button>
          </div>

          {cartMessage && (
            <div className={`cart-message ${cartMessage.includes('✅') ? 'success' : 'error'}`}>
              {cartMessage}
            </div>
          )}

          {wishlistMessage && (
            <div className={`wishlist-message ${wishlistMessage.includes('❤️') || wishlistMessage.includes('💔') ? 'success' : 'error'}`}>
              {wishlistMessage}
            </div>
          )}

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

        {/* Seller Info - Detailed */}
        <div className="info-section">
          <h3>👤 Seller Information</h3>
          <div className="seller-detailed">
            <div className="seller-profile">
              <div className="seller-avatar">
                <span>{product.seller?.shop_username?.charAt(0) || 'S'}</span>
              </div>
              <div className="seller-info-detailed">
                <h4>🏪 {product.seller?.shop_username || 'Seller'}</h4>
                
                {/* Personal Information */}
                <div className="seller-section">
                  <h5>Personal Information</h5>
                  <div className="seller-details">
                    {product.seller?.first_name && product.seller?.last_name && (
                      <div className="seller-detail-item">
                        <strong>� Full Name:</strong> {product.seller.first_name} {product.seller.last_name}
                      </div>
                    )}
                    {product.seller?.email && (
                      <div className="seller-detail-item">
                        <strong>📧 Email:</strong> {product.seller.email}
                      </div>
                    )}
                    {product.seller?.phone_number && (
                      <div className="seller-detail-item">
                        <strong>📞 Phone:</strong> {product.seller.phone_number}
                      </div>
                    )}
                    {product.seller?.date_of_birth && (
                      <div className="seller-detail-item">
                        <strong>🎂 Date of Birth:</strong> {new Date(product.seller.date_of_birth).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>

                {/* Business Information */}
                <div className="seller-section">
                  <h5>Business Information</h5>
                  <div className="seller-details">
                    {product.seller?.country && (
                      <div className="seller-detail-item">
                        <strong>🌍 Country:</strong> {product.seller.country}
                      </div>
                    )}
                    <div className="seller-detail-item">
                      <strong>📍 Product Location:</strong> {product.location_city}, {product.location_state}
                    </div>
                    {product.seller?.business_address && (
                      <div className="seller-detail-item">
                        <strong>🏢 Business Address:</strong> {product.seller.business_address}
                      </div>
                    )}
                    {product.seller?.status && (
                      <div className="seller-detail-item">
                        <strong>✅ Account Status:</strong> 
                        <span className={`status-badge ${product.seller.status}`}>
                          {product.seller.status.charAt(0).toUpperCase() + product.seller.status.slice(1)}
                        </span>
                      </div>
                    )}
                    {product.seller?.created_at && (
                      <div className="seller-detail-item">
                        <strong>📅 Member Since:</strong> {new Date(product.seller.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Verification Status */}
                <div className="seller-section">
                  <h5>Verification Status</h5>
                  <div className="seller-details">
                    <div className="seller-detail-item">
                      <strong>📄 Email Verified:</strong> 
                      <span className={`verification-badge ${product.seller?.email_verified_at ? 'verified' : 'unverified'}`}>
                        {product.seller?.email_verified_at ? '✅ Verified' : '❌ Not Verified'}
                      </span>
                    </div>
                    <div className="seller-detail-item">
                      <strong>🆔 ID Verification:</strong> 
                      <span className={`verification-badge ${product.seller?.national_id_path ? 'verified' : 'unverified'}`}>
                        {product.seller?.national_id_path ? '✅ Submitted' : '❌ Not Submitted'}
                      </span>
                    </div>
                    <div className="seller-detail-item">
                      <strong>🏪 Business Verification:</strong> 
                      <span className={`verification-badge ${product.seller?.proof_of_ownership_path ? 'verified' : 'unverified'}`}>
                        {product.seller?.proof_of_ownership_path ? '✅ Submitted' : '❌ Not Submitted'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Contact Seller Section - Only for Buyers */}
                {user && user.role === 'Buyer' && (
                  <div className="seller-contact-section">
                    <button 
                      className="btn primary contact-seller-btn"
                      onClick={handleContactSeller}
                    >
                      💬 Contact Seller
                    </button>
                  </div>
                )}
              </div>
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

      {/* Contact Seller Modal */}
      {showContactModal && (
        <div className="modal-overlay" onClick={() => setShowContactModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>💬 Contact Seller</h3>
              <button className="modal-close" onClick={() => setShowContactModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="product-info-mini">
                <h4>📦 {product.title}</h4>
                <p>🏪 Seller: {product.seller?.shop_username}</p>
              </div>
              <div className="form-group">
                <label htmlFor="contactMessage">Your Message:</label>
                <textarea
                  id="contactMessage"
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  placeholder="Hi! I'm interested in this product. Could you provide more details?"
                  rows="4"
                  maxLength="2000"
                />
                <small>{contactMessage.length}/2000 characters</small>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn outline" 
                onClick={() => setShowContactModal(false)}
                disabled={sendingMessage}
              >
                Cancel
              </button>
              <button 
                className="btn primary" 
                onClick={handleSendMessage}
                disabled={sendingMessage || !contactMessage.trim()}
              >
                {sendingMessage ? 'Sending...' : 'Send Message'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductDetails
