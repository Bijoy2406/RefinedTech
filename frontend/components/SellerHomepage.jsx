import { useState, useEffect } from 'react';
import axios from 'axios';
import '../css/SellerHomepage.css';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8000';

export default function SellerHomepage() {
    const [currentUser, setCurrentUser] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [showAddProduct, setShowAddProduct] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [stats, setStats] = useState({
        totalProducts: 0,
        activeProducts: 0,
        soldProducts: 0,
        totalRevenue: 0,
        viewsCount: 0
    });

    // Product form state
    const [productForm, setProductForm] = useState({
        title: '',
        description: '',
        category: '',
        subcategory: '',
        brand: '',
        model: '',
        condition_grade: '',
        condition_description: '',
        price: '',
        original_price: '',
        discount_percentage: '',
        quantity_available: 1,
        warranty_period: '',
        return_policy: '',
        shipping_weight: '',
        dimensions: '',
        color: '',
        storage_capacity: '',
        ram_memory: '',
        processor: '',
        operating_system: '',
        battery_health: '',
        screen_size: '',
        connectivity: '',
        included_accessories: '',
        defects_issues: '',
        purchase_date: '',
        usage_duration: '',
        reason_for_selling: '',
        tags: '',
        is_featured: false,
        is_urgent_sale: false,
        negotiable: true,
        minimum_price: '',
        location_city: '',
        location_state: '',
        shipping_options: ''
    });

    const categories = [
        'Smartphones', 'Laptops', 'Tablets', 'Desktop Computers', 
        'Gaming', 'Smart Watches', 'Audio & Headphones', 'Cameras', 
        'Accessories', 'Other Electronics'
    ];

    const conditionGrades = [
        { value: 'like-new', label: 'Like New ⭐', description: 'Excellent condition with minimal signs of use' },
        { value: 'excellent', label: 'Excellent ✨', description: 'Great condition with minor cosmetic wear' },
        { value: 'good', label: 'Good 👍', description: 'Good condition with noticeable wear but functions well' },
        { value: 'fair', label: 'Fair 👌', description: 'Fair condition with significant wear but functions properly' }
    ];

    useEffect(() => {
        fetchCurrentUser();
        fetchProducts();
        fetchStats();
    }, []);

    const fetchCurrentUser = async () => {
        try {
            const token = localStorage.getItem('rt_token');
            const response = await axios.get(`${API_BASE}/api/user`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCurrentUser(response.data);
        } catch (error) {
            console.error('Error fetching current user:', error);
        }
    };

    const fetchProducts = async () => {
        try {
            const token = localStorage.getItem('rt_token');
            setLoading(true);
            
            const response = await axios.get(`${API_BASE}/api/seller/products`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setProducts(response.data.products || []);
        } catch (error) {
            console.error('Error fetching products:', error);
            setError('Failed to fetch products');
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('rt_token');
            const response = await axios.get(`${API_BASE}/api/seller/stats`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setStats(response.data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const handleFormChange = (e) => {
        const { name, value, type, checked } = e.target;
        setProductForm(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        // Auto-calculate discount percentage
        if (name === 'price' || name === 'original_price') {
            const price = name === 'price' ? parseFloat(value) : parseFloat(productForm.price);
            const originalPrice = name === 'original_price' ? parseFloat(value) : parseFloat(productForm.original_price);
            
            if (price && originalPrice && originalPrice > price) {
                const discount = ((originalPrice - price) / originalPrice * 100).toFixed(2);
                setProductForm(prev => ({ ...prev, discount_percentage: discount }));
            }
        }
    };

    const handleSubmitProduct = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('rt_token');
            setLoading(true);

            const endpoint = editingProduct 
                ? `${API_BASE}/api/seller/products/${editingProduct.id}`
                : `${API_BASE}/api/seller/products`;
            
            const method = editingProduct ? 'PUT' : 'POST';

            const response = await axios({
                method,
                url: endpoint,
                data: productForm,
                headers: { Authorization: `Bearer ${token}` }
            });

            setSuccess(editingProduct ? 'Product updated successfully!' : 'Product added successfully!');
            setShowAddProduct(false);
            setEditingProduct(null);
            resetForm();
            fetchProducts();
            fetchStats();
        } catch (error) {
            console.error('Error saving product:', error);
            setError(error.response?.data?.message || 'Failed to save product');
        } finally {
            setLoading(false);
        }
    };

    const handleEditProduct = (product) => {
        setProductForm(product);
        setEditingProduct(product);
        setShowAddProduct(true);
    };

    const handleDeleteProduct = async (productId) => {
        if (!confirm('Are you sure you want to delete this product?')) return;

        try {
            const token = localStorage.getItem('rt_token');
            await axios.delete(`${API_BASE}/api/seller/products/${productId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setSuccess('Product deleted successfully!');
            fetchProducts();
            fetchStats();
        } catch (error) {
            console.error('Error deleting product:', error);
            setError('Failed to delete product');
        }
    };

    const resetForm = () => {
        setProductForm({
            title: '', description: '', category: '', subcategory: '', brand: '', model: '',
            condition_grade: '', condition_description: '', price: '', original_price: '',
            discount_percentage: '', quantity_available: 1, warranty_period: '', return_policy: '',
            shipping_weight: '', dimensions: '', color: '', storage_capacity: '', ram_memory: '',
            processor: '', operating_system: '', battery_health: '', screen_size: '',
            connectivity: '', included_accessories: '', defects_issues: '', purchase_date: '',
            usage_duration: '', reason_for_selling: '', tags: '', is_featured: false,
            is_urgent_sale: false, negotiable: true, minimum_price: '', location_city: '',
            location_state: '', shipping_options: ''
        });
    };

    const renderStatsCard = (title, value, icon, color, subtitle = '') => (
        <div className={`stats-card ${color}`}>
            <div className="stats-icon">{icon}</div>
            <div className="stats-content">
                <h3>{value}</h3>
                <p>{title}</p>
                {subtitle && <span className="stats-subtitle">{subtitle}</span>}
            </div>
        </div>
    );

    const renderProductCard = (product) => (
        <div key={product.id} className="product-card">
            <div className="product-image">
                {product.images && product.images.length > 0 ? (
                    <img src={product.images[0]} alt={product.title} />
                ) : (
                    <div className="no-image">📷</div>
                )}
                <div className={`product-status status-${product.status}`}>
                    {product.status}
                </div>
            </div>
            <div className="product-info">
                <h4>{product.title}</h4>
                <p className="product-brand">{product.brand} {product.model}</p>
                <div className="product-condition">
                    <span className={`condition-badge condition-${product.condition_grade}`}>
                        {product.condition_grade?.replace('-', ' ')}
                    </span>
                </div>
                <div className="product-pricing">
                    <span className="current-price">${product.price}</span>
                    {product.original_price && (
                        <span className="original-price">${product.original_price}</span>
                    )}
                    {product.discount_percentage && (
                        <span className="discount">{product.discount_percentage}% OFF</span>
                    )}
                </div>
                <div className="product-meta">
                    <span>Views: {product.views_count || 0}</span>
                    <span>❤️ {product.favorites_count || 0}</span>
                    <span>Qty: {product.quantity_available}</span>
                </div>
                <div className="product-actions">
                    <button 
                        className="btn btn-edit"
                        onClick={() => handleEditProduct(product)}
                    >
                        Edit
                    </button>
                    <button 
                        className="btn btn-delete"
                        onClick={() => handleDeleteProduct(product.id)}
                    >
                        Delete
                    </button>
                    <button className="btn btn-boost">
                        Boost
                    </button>
                </div>
            </div>
        </div>
    );

    if (loading && products.length === 0) {
        return (
            <div className="seller-homepage loading-state">
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Loading seller dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="seller-homepage">
            <div className="seller-header">
                <div className="header-content">
                    <h1>Seller Dashboard</h1>
                    <div className="seller-info">
                        <span className="welcome-text">
                            Welcome back, {currentUser?.name || 'Seller'}
                        </span>
                        <span className="shop-username">
                            @{currentUser?.shop_username}
                        </span>
                    </div>
                </div>
                <button 
                    className="btn btn-primary add-product-btn"
                    onClick={() => {
                        setShowAddProduct(true);
                        setEditingProduct(null);
                        resetForm();
                    }}
                >
                    ➕ Add New Product
                </button>
            </div>

            {error && (
                <div className="alert alert-error">
                    <span>⚠️ {error}</span>
                    <button onClick={() => setError(null)}>×</button>
                </div>
            )}

            {success && (
                <div className="alert alert-success">
                    <span>✅ {success}</span>
                    <button onClick={() => setSuccess(null)}>×</button>
                </div>
            )}

            <div className="seller-tabs">
                <button 
                    className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
                    onClick={() => setActiveTab('overview')}
                >
                    📊 Overview
                </button>
                <button 
                    className={`tab ${activeTab === 'products' ? 'active' : ''}`}
                    onClick={() => setActiveTab('products')}
                >
                    📦 My Products ({products.length})
                </button>
                <button 
                    className={`tab ${activeTab === 'analytics' ? 'active' : ''}`}
                    onClick={() => setActiveTab('analytics')}
                >
                    📈 Analytics
                </button>
                <button 
                    className={`tab ${activeTab === 'settings' ? 'active' : ''}`}
                    onClick={() => setActiveTab('settings')}
                >
                    ⚙️ Settings
                </button>
            </div>

            <div className="seller-content">
                {activeTab === 'overview' && (
                    <div className="overview-section">
                        <div className="stats-grid">
                            {renderStatsCard('Total Products', stats.totalProducts, '📦', 'blue')}
                            {renderStatsCard('Active Products', stats.activeProducts, '✅', 'green')}
                            {renderStatsCard('Sold Products', stats.soldProducts, '💰', 'orange')}
                            {renderStatsCard('Total Views', stats.viewsCount, '👁️', 'purple')}
                        </div>

                        <div className="quick-actions">
                            <h3>Quick Actions</h3>
                            <div className="action-cards">
                                <div className="action-card" onClick={() => {
                                    setShowAddProduct(true);
                                    setEditingProduct(null);
                                    resetForm();
                                }}>
                                    <div className="action-icon">➕</div>
                                    <div className="action-content">
                                        <h4>Add New Product</h4>
                                        <p>List a new product for sale</p>
                                    </div>
                                </div>
                                <div className="action-card" onClick={() => setActiveTab('products')}>
                                    <div className="action-icon">📦</div>
                                    <div className="action-content">
                                        <h4>Manage Products</h4>
                                        <p>Edit, delete or boost your listings</p>
                                    </div>
                                </div>
                                <div className="action-card" onClick={() => setActiveTab('analytics')}>
                                    <div className="action-icon">📈</div>
                                    <div className="action-content">
                                        <h4>View Analytics</h4>
                                        <p>Track performance and sales</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'products' && (
                    <div className="products-section">
                        <div className="section-header">
                            <h2>My Products</h2>
                            <p>Manage your product listings</p>
                        </div>
                        {products.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-icon">📦</div>
                                <h3>No products yet</h3>
                                <p>Start by adding your first product</p>
                                <button 
                                    className="btn btn-primary"
                                    onClick={() => {
                                        setShowAddProduct(true);
                                        setEditingProduct(null);
                                        resetForm();
                                    }}
                                >
                                    Add First Product
                                </button>
                            </div>
                        ) : (
                            <div className="products-grid">
                                {products.map(renderProductCard)}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'analytics' && (
                    <div className="analytics-section">
                        <div className="section-header">
                            <h2>Analytics & Performance</h2>
                            <p>Track your sales and product performance</p>
                        </div>
                        <div className="analytics-content">
                            <p>Analytics dashboard coming soon...</p>
                        </div>
                    </div>
                )}

                {activeTab === 'settings' && (
                    <div className="settings-section">
                        <div className="section-header">
                            <h2>Seller Settings</h2>
                            <p>Manage your seller preferences</p>
                        </div>
                        <div className="settings-content">
                            <p>Settings panel coming soon...</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Add/Edit Product Modal */}
            {showAddProduct && (
                <div className="modal-overlay" onClick={() => setShowAddProduct(false)}>
                    <div className="modal-content product-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
                            <button className="modal-close" onClick={() => setShowAddProduct(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            <form onSubmit={handleSubmitProduct} className="product-form">
                                {/* Basic Information */}
                                <div className="form-section">
                                    <h4>Basic Information</h4>
                                    <div className="form-grid">
                                        <div className="form-group">
                                            <label>Product Title *</label>
                                            <input
                                                type="text"
                                                name="title"
                                                value={productForm.title}
                                                onChange={handleFormChange}
                                                required
                                                placeholder="e.g., iPhone 12 Pro 128GB"
                                            />
                                        </div>
                                        <div className="form-group span-2">
                                            <label>Description</label>
                                            <textarea
                                                name="description"
                                                value={productForm.description}
                                                onChange={handleFormChange}
                                                rows={3}
                                                placeholder="Describe your product in detail..."
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Category *</label>
                                            <select
                                                name="category"
                                                value={productForm.category}
                                                onChange={handleFormChange}
                                                required
                                            >
                                                <option value="">Select Category</option>
                                                {categories.map(cat => (
                                                    <option key={cat} value={cat}>{cat}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label>Brand *</label>
                                            <input
                                                type="text"
                                                name="brand"
                                                value={productForm.brand}
                                                onChange={handleFormChange}
                                                required
                                                placeholder="e.g., Apple, Samsung, HP"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Model *</label>
                                            <input
                                                type="text"
                                                name="model"
                                                value={productForm.model}
                                                onChange={handleFormChange}
                                                required
                                                placeholder="e.g., MacBook Pro 13-inch"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Condition & Pricing */}
                                <div className="form-section">
                                    <h4>Condition & Pricing</h4>
                                    <div className="form-grid">
                                        <div className="form-group">
                                            <label>Condition Grade *</label>
                                            <select
                                                name="condition_grade"
                                                value={productForm.condition_grade}
                                                onChange={handleFormChange}
                                                required
                                            >
                                                <option value="">Select Condition</option>
                                                {conditionGrades.map(grade => (
                                                    <option key={grade.value} value={grade.value}>
                                                        {grade.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="form-group span-2">
                                            <label>Condition Description</label>
                                            <textarea
                                                name="condition_description"
                                                value={productForm.condition_description}
                                                onChange={handleFormChange}
                                                rows={2}
                                                placeholder="Describe the condition in detail..."
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Selling Price *</label>
                                            <input
                                                type="number"
                                                name="price"
                                                value={productForm.price}
                                                onChange={handleFormChange}
                                                required
                                                step="0.01"
                                                min="0"
                                                placeholder="0.00"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Original Price</label>
                                            <input
                                                type="number"
                                                name="original_price"
                                                value={productForm.original_price}
                                                onChange={handleFormChange}
                                                step="0.01"
                                                min="0"
                                                placeholder="0.00"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Discount %</label>
                                            <input
                                                type="number"
                                                name="discount_percentage"
                                                value={productForm.discount_percentage}
                                                onChange={handleFormChange}
                                                step="0.01"
                                                min="0"
                                                max="100"
                                                readOnly
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Technical Specifications */}
                                <div className="form-section">
                                    <h4>Technical Specifications</h4>
                                    <div className="form-grid">
                                        <div className="form-group">
                                            <label>Storage Capacity</label>
                                            <input
                                                type="text"
                                                name="storage_capacity"
                                                value={productForm.storage_capacity}
                                                onChange={handleFormChange}
                                                placeholder="e.g., 256GB, 1TB"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>RAM Memory</label>
                                            <input
                                                type="text"
                                                name="ram_memory"
                                                value={productForm.ram_memory}
                                                onChange={handleFormChange}
                                                placeholder="e.g., 8GB, 16GB"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Processor</label>
                                            <input
                                                type="text"
                                                name="processor"
                                                value={productForm.processor}
                                                onChange={handleFormChange}
                                                placeholder="e.g., Intel i7, M1 Chip"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Operating System</label>
                                            <input
                                                type="text"
                                                name="operating_system"
                                                value={productForm.operating_system}
                                                onChange={handleFormChange}
                                                placeholder="e.g., iOS 15, Windows 11"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Screen Size</label>
                                            <input
                                                type="text"
                                                name="screen_size"
                                                value={productForm.screen_size}
                                                onChange={handleFormChange}
                                                placeholder="e.g., 13.3 inches"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Color</label>
                                            <input
                                                type="text"
                                                name="color"
                                                value={productForm.color}
                                                onChange={handleFormChange}
                                                placeholder="e.g., Space Gray, Silver"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Additional Details */}
                                <div className="form-section">
                                    <h4>Additional Details</h4>
                                    <div className="form-grid">
                                        <div className="form-group">
                                            <label>Battery Health</label>
                                            <input
                                                type="text"
                                                name="battery_health"
                                                value={productForm.battery_health}
                                                onChange={handleFormChange}
                                                placeholder="e.g., 95%, Good"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Warranty Period</label>
                                            <input
                                                type="text"
                                                name="warranty_period"
                                                value={productForm.warranty_period}
                                                onChange={handleFormChange}
                                                placeholder="e.g., 6 months, 1 year"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Quantity Available</label>
                                            <input
                                                type="number"
                                                name="quantity_available"
                                                value={productForm.quantity_available}
                                                onChange={handleFormChange}
                                                min="1"
                                                placeholder="1"
                                            />
                                        </div>
                                        <div className="form-group span-2">
                                            <label>Included Accessories</label>
                                            <textarea
                                                name="included_accessories"
                                                value={productForm.included_accessories}
                                                onChange={handleFormChange}
                                                rows={2}
                                                placeholder="List what's included (charger, cables, case, etc.)"
                                            />
                                        </div>
                                        <div className="form-group span-2">
                                            <label>Known Defects/Issues</label>
                                            <textarea
                                                name="defects_issues"
                                                value={productForm.defects_issues}
                                                onChange={handleFormChange}
                                                rows={2}
                                                placeholder="Describe any known issues or defects"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Sales Options */}
                                <div className="form-section">
                                    <h4>Sales Options</h4>
                                    <div className="form-grid">
                                        <div className="form-group checkbox-group">
                                            <label>
                                                <input
                                                    type="checkbox"
                                                    name="negotiable"
                                                    checked={productForm.negotiable}
                                                    onChange={handleFormChange}
                                                />
                                                Price is negotiable
                                            </label>
                                        </div>
                                        <div className="form-group checkbox-group">
                                            <label>
                                                <input
                                                    type="checkbox"
                                                    name="is_urgent_sale"
                                                    checked={productForm.is_urgent_sale}
                                                    onChange={handleFormChange}
                                                />
                                                Urgent sale
                                            </label>
                                        </div>
                                        {productForm.negotiable && (
                                            <div className="form-group">
                                                <label>Minimum Price</label>
                                                <input
                                                    type="number"
                                                    name="minimum_price"
                                                    value={productForm.minimum_price}
                                                    onChange={handleFormChange}
                                                    step="0.01"
                                                    min="0"
                                                    placeholder="Lowest acceptable price"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="form-actions">
                                    <button type="button" onClick={() => setShowAddProduct(false)}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-primary">
                                        {editingProduct ? 'Update Product' : 'Add Product'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

 //comment0
 //comment1
 //comment2
 //comment3
 //comment4
 //comment5
 //comment6
 //comment7
 //hi
 //hi
 //hi
 //hi
 
