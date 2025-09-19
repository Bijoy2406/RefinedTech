import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../App.jsx';
import axios from 'axios';
import '../css/Orders.css';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8000';

export default function Orders() {
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (user.role !== 'Buyer') {
      navigate('/');
      return;
    }

    fetchOrders();
  }, [user, navigate]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('rt_token');
      const response = await axios.get(`${API_BASE}/api/orders/buyer`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setOrders(response.data.orders);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderDetails = async (orderId) => {
    try {
      setDetailsLoading(true);
      const token = localStorage.getItem('rt_token');
      const response = await axios.get(`${API_BASE}/api/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setSelectedOrder(response.data.order);
        setShowOrderDetails(true);
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
      setError('Failed to load order details');
    } finally {
      setDetailsLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const statusColors = {
      'pending': '#ffc107',
      'confirmed': '#17a2b8', 
      'processing': '#007bff',
      'shipped': '#fd7e14',
      'delivered': '#28a745',
      'cancelled': '#dc3545',
      'refunded': '#6c757d'
    };
    return statusColors[status] || '#6c757d';
  };

  const getPaymentStatusColor = (status) => {
    const statusColors = {
      'pending': '#ffc107',
      'paid': '#28a745',
      'failed': '#dc3545',
      'refunded': '#6c757d',
      'partial_refund': '#fd7e14'
    };
    return statusColors[status] || '#6c757d';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price) => {
    return `৳${parseFloat(price).toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="orders-page">
        <div className="loading">
          <div className="loading-spinner"></div>
          Loading your orders...
        </div>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <div className="orders-container">
        <div className="orders-header">
          <h1>My Orders</h1>
          <div className="orders-actions">
            <Link to="/buyer" className="btn btn-outline">
              Back to Dashboard
            </Link>
          </div>
        </div>

        {error && (
          <div className="error-message">
            {error}
            <button onClick={() => setError('')} className="close-error">×</button>
          </div>
        )}

        {orders.length === 0 ? (
          <div className="empty-orders">
            <div className="empty-orders-icon">📦</div>
            <h2>No orders yet</h2>
            <p>When you place your first order, it will appear here.</p>
            <Link to="/buyer" className="btn btn-primary">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="orders-content">
            <div className="orders-summary">
              <div className="summary-card">
                <div className="summary-number">{orders.length}</div>
                <div className="summary-label">Total Orders</div>
              </div>
              <div className="summary-card">
                <div className="summary-number">
                  {orders.filter(order => order.status === 'delivered').length}
                </div>
                <div className="summary-label">Delivered</div>
              </div>
              <div className="summary-card">
                <div className="summary-number">
                  {orders.filter(order => order.status === 'pending' || order.status === 'processing').length}
                </div>
                <div className="summary-label">In Progress</div>
              </div>
            </div>

            <div className="orders-list">
              {orders.map((order) => (
                <div key={order.id} className="order-card">
                  <div className="order-header">
                    <div className="order-number">
                      <strong>Order #{order.order_number}</strong>
                    </div>
                    <div className="order-date">
                      {formatDate(order.created_at)}
                    </div>
                  </div>

                  <div className="order-body">
                    <div className="order-info">
                      <div className="order-status">
                        <span 
                          className="status-badge"
                          style={{ backgroundColor: getStatusColor(order.status) }}
                        >
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                        <span 
                          className="payment-status-badge"
                          style={{ backgroundColor: getPaymentStatusColor(order.payment_status) }}
                        >
                          {order.payment_status.replace('_', ' ').charAt(0).toUpperCase() + order.payment_status.replace('_', ' ').slice(1)}
                        </span>
                      </div>

                      <div className="order-details">
                        <div className="order-amount">
                          <strong>{formatPrice(order.final_amount)}</strong>
                        </div>
                        <div className="order-items">
                          {order.items_count} item(s) • Seller: {order.seller_name}
                        </div>
                        {order.tracking_number && (
                          <div className="tracking-info">
                            📦 Tracking: {order.tracking_number}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="order-preview">
                      {order.items.slice(0, 3).map((item, index) => (
                        <div key={index} className="item-preview">
                          {item.product_image_url ? (
                            <img 
                              src={`${API_BASE}${item.product_image_url}`} 
                              alt={item.product_title}
                              className="item-image"
                            />
                          ) : (
                            <div className="item-placeholder">📱</div>
                          )}
                          <div className="item-info">
                            <div className="item-title">{item.product_title}</div>
                            <div className="item-details">
                              Qty: {item.quantity} × {formatPrice(item.unit_price)}
                            </div>
                          </div>
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <div className="more-items">
                          +{order.items.length - 3} more items
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="order-actions">
                    <button 
                      className="btn btn-outline btn-small"
                      onClick={() => fetchOrderDetails(order.id)}
                      disabled={detailsLoading}
                    >
                      {detailsLoading ? 'Loading...' : 'View Details'}
                    </button>
                    {order.status === 'delivered' && (
                      <button className="btn btn-primary btn-small">
                        Order Again
                      </button>
                    )}
                    {(order.status === 'pending' || order.status === 'confirmed') && (
                      <button className="btn btn-secondary btn-small">
                        Cancel Order
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Order Details Modal */}
        {showOrderDetails && selectedOrder && (
          <div className="modal-overlay" onClick={() => setShowOrderDetails(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Order Details - #{selectedOrder.order_number}</h2>
                <button 
                  className="modal-close"
                  onClick={() => setShowOrderDetails(false)}
                >
                  ×
                </button>
              </div>

              <div className="modal-body">
                <div className="order-details-grid">
                  <div className="details-section">
                    <h3>Order Information</h3>
                    <div className="details-item">
                      <span>Status:</span>
                      <span 
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(selectedOrder.status) }}
                      >
                        {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                      </span>
                    </div>
                    <div className="details-item">
                      <span>Payment Status:</span>
                      <span 
                        className="payment-status-badge"
                        style={{ backgroundColor: getPaymentStatusColor(selectedOrder.payment_status) }}
                      >
                        {selectedOrder.payment_status.replace('_', ' ').charAt(0).toUpperCase() + selectedOrder.payment_status.replace('_', ' ').slice(1)}
                      </span>
                    </div>
                    <div className="details-item">
                      <span>Payment Method:</span>
                      <span>{selectedOrder.payment_method.replace('_', ' ').charAt(0).toUpperCase() + selectedOrder.payment_method.replace('_', ' ').slice(1)}</span>
                    </div>
                    {selectedOrder.tracking_number && (
                      <div className="details-item">
                        <span>Tracking Number:</span>
                        <span>{selectedOrder.tracking_number}</span>
                      </div>
                    )}
                  </div>

                  <div className="details-section">
                    <h3>Shipping Address</h3>
                    <div className="address-block">
                      <div>{selectedOrder.shipping_address.line1}</div>
                      {selectedOrder.shipping_address.line2 && (
                        <div>{selectedOrder.shipping_address.line2}</div>
                      )}
                      <div>
                        {selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state} {selectedOrder.shipping_address.postal_code}
                      </div>
                      <div>{selectedOrder.shipping_address.country}</div>
                      {selectedOrder.shipping_address.phone && (
                        <div>Phone: {selectedOrder.shipping_address.phone}</div>
                      )}
                    </div>
                  </div>

                  <div className="details-section">
                    <h3>Order Items</h3>
                    <div className="order-items-list">
                      {selectedOrder.items.map((item, index) => (
                        <div key={index} className="order-item-detail">
                          {item.product_image_url ? (
                            <img 
                              src={`${API_BASE}${item.product_image_url}`} 
                              alt={item.product_title}
                              className="item-detail-image"
                            />
                          ) : (
                            <div className="item-detail-placeholder">📱</div>
                          )}
                          <div className="item-detail-info">
                            <div className="item-detail-title">{item.product_title}</div>
                            <div className="item-detail-price">
                              {item.quantity} × {formatPrice(item.unit_price)} = {formatPrice(item.total_price)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="details-section">
                    <h3>Order Summary</h3>
                    <div className="order-summary">
                      <div className="summary-row">
                        <span>Subtotal:</span>
                        <span>{formatPrice(selectedOrder.total_amount)}</span>
                      </div>
                      <div className="summary-row">
                        <span>Shipping:</span>
                        <span>{formatPrice(selectedOrder.shipping_cost)}</span>
                      </div>
                      <div className="summary-row">
                        <span>Tax:</span>
                        <span>{formatPrice(selectedOrder.tax_amount)}</span>
                      </div>
                      <div className="summary-row total">
                        <span><strong>Total:</strong></span>
                        <span><strong>{formatPrice(selectedOrder.final_amount)}</strong></span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}