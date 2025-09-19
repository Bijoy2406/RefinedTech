import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
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
    return (
      <div className="cart-page">
        <div className="loading">Loading your cart...</div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-container">
        <div className="cart-header">
          <h1>Shopping Cart</h1>
          {cartItems.length > 0 && (
            <button 
              className="btn btn-outline clear-cart-btn"
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
            <p>Add some products to get started!</p>
            <button 
              className="btn btn-primary"
              onClick={() => navigate('/')}
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="cart-content">
            <div className="cart-items">
              {cartItems.map((item) => (
                <div key={item.id} className="cart-item">
                  <div className="item-image">
                    {item.main_image ? (
                      <img 
                        src={`${API_BASE}/storage/products/${item.main_image}`}
                        alt={item.title}
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="no-image">No Image</div>
                    )}
                  </div>

                  <div className="item-details">
                    <h3>{item.title}</h3>
                    <p className="item-condition">Condition: {item.condition_grade}</p>
                    <p className="item-price">${item.price}</p>
                    
                    {item.status !== 'active' && (
                      <p className="item-status unavailable">⚠️ No longer available</p>
                    )}
                    
                    {item.quantity > item.quantity_available && (
                      <p className="item-status limited">
                        ⚠️ Only {item.quantity_available} available
                      </p>
                    )}
                  </div>

                  <div className="item-quantity">
                    <label>Quantity:</label>
                    <div className="quantity-controls">
                      <button
                        className="quantity-btn"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={updating[item.id] || item.quantity <= 1}
                      >
                        -
                      </button>
                      <span className="quantity-display">{item.quantity}</span>
                      <button
                        className="quantity-btn"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={updating[item.id] || item.quantity >= item.quantity_available}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="item-total">
                    <p className="total-price">${item.total_price.toFixed(2)}</p>
                  </div>

                  <div className="item-actions">
                    <button
                      className="btn btn-outline remove-btn"
                      onClick={() => removeItem(item.id)}
                      disabled={updating[item.id]}
                    >
                      {updating[item.id] ? '...' : 'Remove'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-summary">
              <div className="summary-header">
                <h2>Order Summary</h2>
              </div>
              
              <div className="summary-details">
                <div className="summary-row">
                  <span>Items ({cartSummary.total_items}):</span>
                  <span>${cartSummary.total_amount.toFixed(2)}</span>
                </div>
                <div className="summary-row">
                  <span>Shipping:</span>
                  <span>$9.99</span>
                </div>
                <div className="summary-row">
                  <span>Tax (estimated):</span>
                  <span>${(cartSummary.total_amount * 0.08).toFixed(2)}</span>
                </div>
                <div className="summary-row total">
                  <span>Total:</span>
                  <span>${(cartSummary.total_amount + 9.99 + (cartSummary.total_amount * 0.08)).toFixed(2)}</span>
                </div>
              </div>

              <div className="checkout-actions">
                <button
                  className="btn btn-primary checkout-btn"
                  onClick={proceedToCheckout}
                  disabled={cartItems.length === 0}
                >
                  Proceed to Checkout
                </button>
                <button
                  className="btn btn-secondary continue-shopping-btn"
                  onClick={() => navigate('/')}
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
