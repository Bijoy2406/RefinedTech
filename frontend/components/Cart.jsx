import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import LottieLoading from './LottieLoading';
import '../css/Cart.css';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8000';

export default function Cart() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState({});
  const [error, setError] = useState('');
  const [cartSummary, setCartSummary] = useState({
    total_items: 0,
    total_amount: 0,
  });

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('rt_token');
      
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.get(`${API_BASE}/api/cart`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        const cart = response.data.cart;
        setCartItems(cart.items || []);
        setCartSummary({
          total_items: cart.total_items || 0,
          total_amount: cart.total_amount || 0,
        });
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      } else {
        setError('Failed to load cart items');
      }
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (cartItemId, newQuantity) => {
    if (newQuantity < 0) return;

    setUpdating(prev => ({ ...prev, [cartItemId]: true }));
    
    try {
      const token = localStorage.getItem('rt_token');
      
      if (newQuantity === 0) {
        // Remove item
        await axios.delete(`${API_BASE}/api/cart/${cartItemId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        // Update quantity
        await axios.put(`${API_BASE}/api/cart/${cartItemId}`, 
          { quantity: newQuantity },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      // Refresh cart
      await fetchCart();
      
    } catch (error) {
      console.error('Error updating cart item:', error);
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError('Failed to update cart item');
      }
    } finally {
      setUpdating(prev => ({ ...prev, [cartItemId]: false }));
    }
  };

  const removeItem = async (cartItemId) => {
    setUpdating(prev => ({ ...prev, [cartItemId]: true }));
    
    try {
      const token = localStorage.getItem('rt_token');
      
      await axios.delete(`${API_BASE}/api/cart/${cartItemId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Refresh cart
      await fetchCart();
      
    } catch (error) {
      console.error('Error removing cart item:', error);
      setError('Failed to remove cart item');
    } finally {
      setUpdating(prev => ({ ...prev, [cartItemId]: false }));
    }
  };

  const clearCart = async () => {
    if (!window.confirm('Are you sure you want to clear your cart?')) {
      return;
    }

    setLoading(true);
    
    try {
      const token = localStorage.getItem('rt_token');
      
      await axios.delete(`${API_BASE}/api/cart`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Refresh cart
      await fetchCart();
      
    } catch (error) {
      console.error('Error clearing cart:', error);
      setError('Failed to clear cart');
    }
  };

  const proceedToCheckout = () => {
    if (cartItems.length === 0) {
      setError('Your cart is empty');
      return;
    }

    // Check if all items are available
    const unavailableItems = cartItems.filter(item => 
      item.status !== 'active' || item.quantity > item.quantity_available
    );

    if (unavailableItems.length > 0) {
      setError('Some items in your cart are no longer available. Please update your cart.');
      return;
    }

    navigate('/buy?cart=true');
  };

  if (loading) {
    return <LottieLoading message="Loading your cart..." />
  }

  return (
    <div className="cart-container">
      <div className="cart-header">
        <h1 className="cart-title">🛒 Shopping Cart</h1>
        {cartItems.length > 0 && (
          <button 
            className="clear-cart-btn"
            onClick={clearCart}
            disabled={loading}
          >
            Clear Cart
          </button>
        )}
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError('')} className="close-error">×</button>
        </div>
      )}

      {cartItems.length === 0 ? (
        <div className="empty-cart">
          <div className="empty-cart-icon">🛒</div>
          <h2>Your cart is empty</h2>
          <p>Add some products to get started shopping!</p>
          <button 
            className="continue-shopping"
            onClick={() => navigate('/')}
          >
            Continue Shopping
          </button>
        </div>
      ) : (
        <div className="cart-content">
          <div className="cart-items">
            {cartItems.map((item) => (
              <div key={item.id} className={`cart-item ${updating[item.id] ? 'updating' : ''}`}>
                <div className="cart-item-content">
                  <div className="product-image-section">
                    {item.main_image ? (
                      <img 
                        src={`${API_BASE}/storage/products/${item.main_image}`}
                        alt={item.title}
                        className="product-image"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="no-image">
                        <span>📷</span>
                        <p>No Image</p>
                      </div>
                    )}
                  </div>

                  <div className="product-details">
                    <h3 className="product-name">{item.title}</h3>
                    <div className="product-meta">
                      <span className="condition-badge">
                        ✨ {item.condition_grade}
                      </span>
                      <span className="product-price">৳{item.price}</span>
                    </div>
                    
                    {item.status !== 'active' && (
                      <div className="status-alert unavailable">
                        ⚠️ No longer available
                      </div>
                    )}
                    
                    {item.quantity > item.quantity_available && (
                      <div className="status-alert limited">
                        ⚠️ Only {item.quantity_available} in stock
                      </div>
                    )}
                  </div>

                  <div className="item-controls">
                    <div className="quantity-section">
                      <label className="quantity-label">Quantity</label>
                      <div className="quantity-controls">
                        <button
                          className="quantity-btn decrease"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={updating[item.id] || item.quantity <= 1}
                        >
                          −
                        </button>
                        <span className="quantity-display">{item.quantity}</span>
                        <button
                          className="quantity-btn increase"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={updating[item.id] || item.quantity >= item.quantity_available}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="item-total">
                      <span className="total-label">Total</span>
                      <span className="total-price">৳{item.total_price.toFixed(2)}</span>
                    </div>

                    <div className="item-actions">
                      <button
                        className="remove-btn"
                        onClick={() => removeItem(item.id)}
                        disabled={updating[item.id]}
                        title="Remove from cart"
                      >
                        {updating[item.id] ? '⏳' : '🗑️'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <div className="summary-header">
              <h2 className="summary-title">Order Summary</h2>
            </div>
            
            <div className="summary-content">
              <div className="summary-row">
                <span className="summary-label">Items ({cartSummary.total_items})</span>
                <span className="summary-value">৳{cartSummary.total_amount.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Shipping</span>
                <span className="summary-value">৳9.99</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Tax (estimated)</span>
                <span className="summary-value">৳{(cartSummary.total_amount * 0.08).toFixed(2)}</span>
              </div>
              <div className="summary-divider"></div>
              <div className="summary-row total-row">
                <span className="summary-label">Total</span>
                <span className="summary-value">৳{(cartSummary.total_amount + 9.99 + (cartSummary.total_amount * 0.08)).toFixed(2)}</span>
              </div>
            </div>

            <div className="checkout-actions">
              <button
                className="checkout-btn"
                onClick={proceedToCheckout}
                disabled={cartItems.length === 0}
              >
                💳 Proceed to Checkout
              </button>
              <button
                className="continue-shopping-btn"
                onClick={() => navigate('/')}
              >
                🔍 Continue Shopping
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
