import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../App.jsx';
import axios from 'axios';
import '../css/Wishlist.css';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8000';

export default function Wishlist() {
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [removing, setRemoving] = useState({});

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (user.role !== 'Buyer') {
      navigate('/');
      return;
    }

    fetchWishlist();
  }, [user, navigate]);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('rt_token');
      const response = await axios.get(`${API_BASE}/api/wishlist`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setWishlistItems(response.data.wishlist.items);
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      setError('Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      setRemoving(prev => ({ ...prev, [productId]: true }));
      const token = localStorage.getItem('rt_token');
      const response = await axios.delete(`${API_BASE}/api/wishlist/${productId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setWishlistItems(prev => prev.filter(item => item.product_id !== productId));
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      setError('Failed to remove item from wishlist');
    } finally {
      setRemoving(prev => ({ ...prev, [productId]: false }));
    }
  };

  const addToCart = async (productId) => {
    try {
      const token = localStorage.getItem('rt_token');
      const response = await axios.post(`${API_BASE}/api/cart/add`, {
        product_id: productId,
        quantity: 1
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        alert('Product added to cart!');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add to cart');
    }
  };

  const moveToCart = async (productId) => {
    try {
      setRemoving(prev => ({ ...prev, [`move_${productId}`]: true }));
      const token = localStorage.getItem('rt_token');
      
      // Add to cart first
      const cartResponse = await axios.post(`${API_BASE}/api/cart/add`, {
        product_id: productId,
        quantity: 1
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (cartResponse.data.success) {
        // Remove from wishlist
        await axios.delete(`${API_BASE}/api/wishlist/remove/${productId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setWishlistItems(prev => prev.filter(item => item.product_id !== productId));
        alert('✅ Product moved to cart!');
      }
    } catch (error) {
      console.error('Error moving to cart:', error);
      alert('❌ Failed to move to cart');
    } finally {
      setRemoving(prev => ({ ...prev, [`move_${productId}`]: false }));
    }
  };

  const clearWishlist = async () => {
    if (!confirm('Are you sure you want to clear your entire wishlist?')) {
      return;
    }

    try {
      const token = localStorage.getItem('rt_token');
      const response = await axios.delete(`${API_BASE}/api/wishlist`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setWishlistItems([]);
      }
    } catch (error) {
      console.error('Error clearing wishlist:', error);
      setError('Failed to clear wishlist');
    }
  };

  if (loading) {
    return (
      <div className="wishlist-container">
        <div className="loading">Loading your wishlist...</div>
      </div>
    );
  }

  return (
    <div className="wishlist-container">
      <div className="wishlist-header">
        <h1>My Wishlist</h1>
        {wishlistItems.length > 0 && (
          <button 
            className="clear-wishlist-btn"
            onClick={clearWishlist}
          >
            Clear All
          </button>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      {wishlistItems.length === 0 ? (
        <div className="empty-wishlist">
          <div className="empty-icon">💝</div>
          <h2>Your wishlist is empty</h2>
          <p>Save items you love to buy them later</p>
          <Link to="/products" className="browse-products-btn">
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="wishlist-grid">
          {wishlistItems.map((item) => (
            <div key={item.id} className="wishlist-item">
              <div className="product-image">
                {item.main_image ? (
                  <img 
                    src={`${API_BASE}/storage/products/${item.main_image}`}
                    alt={item.title}
                    onError={(e) => {
                      e.target.src = '/placeholder-product.jpg';
                    }}
                  />
                ) : (
                  <div className="no-image">No Image</div>
                )}
                <button 
                  className="remove-btn"
                  onClick={() => removeFromWishlist(item.product_id)}
                  disabled={removing[item.product_id]}
                  title="Remove from wishlist"
                >
                  {removing[item.product_id] ? '...' : '×'}
                </button>
              </div>
              
              <div className="product-info">
                <h3 className="product-title">
                  <Link to={`/product/${item.product_id}`}>
                    {item.title}
                  </Link>
                </h3>
                
                <div className="product-price">${item.price}</div>
                
                <div className="product-condition">
                  Condition: <span className="condition-badge">{item.condition_grade}</span>
                </div>
                
                <div className="product-status">
                  Status: <span className={`status-badge ${item.status}`}>{item.status}</span>
                </div>
                
                <div className="wishlist-actions">
                  <button 
                    className="add-to-cart-btn"
                    onClick={() => addToCart(item.product_id)}
                    disabled={item.status !== 'active'}
                    title="Add to cart (keep in wishlist)"
                  >
                    🛒 Add to Cart
                  </button>
                  
                  <button 
                    className="move-to-cart-btn"
                    onClick={() => moveToCart(item.product_id)}
                    disabled={item.status !== 'active' || removing[`move_${item.product_id}`]}
                    title="Move to cart (remove from wishlist)"
                  >
                    {removing[`move_${item.product_id}`] ? '⏳' : '📦'} Move to Cart
                  </button>
                  
                  <Link 
                    to={`/product/${item.product_id}`}
                    className="view-product-btn"
                  >
                    👁️ View Details
                  </Link>
                </div>
                
                <div className="added-date">
                  Added on {new Date(item.added_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {wishlistItems.length > 0 && (
        <div className="wishlist-summary">
          <p>{wishlistItems.length} item{wishlistItems.length !== 1 ? 's' : ''} in your wishlist</p>
        </div>
      )}
    </div>
  );
}