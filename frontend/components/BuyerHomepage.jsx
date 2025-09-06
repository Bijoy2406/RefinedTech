import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../css/BuyerHomepage.css';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8000';

export default function BuyerHomepage() {
    const navigate = useNavigate();
    const [currentUser, setCurrentUser] = useState(null);
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showProductModal, setShowProductModal] = useState(false);

    // Filter states
    const [filters, setFilters] = useState({
        search: '',
        category: '',
        brand: '',
        condition: '',
        minPrice: '',
        maxPrice: '',
        sortBy: 'newest'
    });

    const categories = [
        'Smartphones', 'Laptops', 'Tablets', 'Desktop Computers', 
        'Gaming', 'Smart Watches', 'Audio & Headphones', 'Cameras', 
        'Accessories', 'Other Electronics'
    ];

    const conditions = [
        { value: 'like-new', label: 'Like New ⭐' },
        { value: 'excellent', label: 'Excellent ✨' },
        { value: 'good', label: 'Good 👍' },
        { value: 'fair', label: 'Fair 👌' }
    ];

    const sortOptions = [
        { value: 'newest', label: 'Newest First' },
        { value: 'oldest', label: 'Oldest First' },
        { value: 'price-low', label: 'Price: Low to High' },
        { value: 'price-high', label: 'Price: High to Low' },
        { value: 'popular', label: 'Most Popular' }
    ];

    useEffect(() => {
        fetchCurrentUser();
        fetchProducts();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [products, filters]);

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
            setLoading(true);
            const response = await axios.get(`${API_BASE}/api/products`);
            setProducts(response.data.products || []);
        } catch (error) {
            console.error('Error fetching products:', error);
            setError('Failed to fetch products');
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...products];

        // Search filter
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            filtered = filtered.filter(product =>
                product.title.toLowerCase().includes(searchLower) ||
                product.description?.toLowerCase().includes(searchLower) ||
                product.brand.toLowerCase().includes(searchLower) ||
                product.model.toLowerCase().includes(searchLower)
            );
        }

        // Category filter
        if (filters.category) {
            filtered = filtered.filter(product => product.category === filters.category);
        }

        // Brand filter
        if (filters.brand) {
            filtered = filtered.filter(product => 
                product.brand.toLowerCase().includes(filters.brand.toLowerCase())
            );
        }

        // Condition filter
        if (filters.condition) {
            filtered = filtered.filter(product => product.condition_grade === filters.condition);
        }

        // Price filters
        if (filters.minPrice) {
            filtered = filtered.filter(product => parseFloat(product.price) >= parseFloat(filters.minPrice));
        }
        if (filters.maxPrice) {
            filtered = filtered.filter(product => parseFloat(product.price) <= parseFloat(filters.maxPrice));
        }

        // Sorting
        switch (filters.sortBy) {
            case 'newest':
                filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                break;
            case 'oldest':
                filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
                break;
            case 'price-low':
                filtered.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
                break;
            case 'price-high':
                filtered.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
                break;
            case 'popular':
                filtered.sort((a, b) => (b.views_count || 0) - (a.views_count || 0));
                break;
            default:
                break;
        }

        setFilteredProducts(filtered);
    };

    const handleFilterChange = (filterName, value) => {
        setFilters(prev => ({
            ...prev,
            [filterName]: value
        }));
    };

    const clearFilters = () => {
        setFilters({
            search: '',
            category: '',
            brand: '',
            condition: '',
            minPrice: '',
            maxPrice: '',
            sortBy: 'newest'
        });
    };

    const handleProductClick = async (product) => {
        try {
            // Increment view count
            await axios.get(`${API_BASE}/api/products/${product.id}`);
            
            setSelectedProduct(product);
            setShowProductModal(true);
        } catch (error) {
            console.error('Error viewing product:', error);
            setSelectedProduct(product);
            setShowProductModal(true);
        }
    };

    const getConditionBadgeClass = (condition) => {
        const classes = {
            'like-new': 'condition-like-new',
            'excellent': 'condition-excellent',
            'good': 'condition-good',
            'fair': 'condition-fair'
        };
        return classes[condition] || 'condition-fair';
    };

    const formatPrice = (price) => {
        return `$${parseFloat(price).toFixed(2)}`;
    };

    const calculateSavings = (price, originalPrice) => {
        if (!originalPrice || originalPrice <= price) return null;
        const savings = originalPrice - price;
        const percentage = ((savings / originalPrice) * 100).toFixed(0);
        return { amount: savings, percentage };
    };

    const renderProductCard = (product) => {
        const savings = calculateSavings(product.price, product.original_price);
        
        return (
            <div 
                key={product.id} 
                className="product-card"
                onClick={() => handleProductClick(product)}
            >
                <div className="product-image">
                    {product.images && product.images.length > 0 ? (
                        <img src={product.images[0]} alt={product.title} />
                    ) : (
                        <div className="no-image">📷</div>
                    )}
                    {product.is_featured && (
                        <div className="featured-badge">⭐ Featured</div>
                    )}
                    {product.is_urgent_sale && (
                        <div className="urgent-badge">🔥 Urgent</div>
                    )}
                    {savings && (
                        <div className="discount-badge">-{savings.percentage}%</div>
                    )}
                </div>
                
                <div className="product-info">
                    <h4 className="product-title">{product.title}</h4>
                    <p className="product-brand">{product.brand} {product.model}</p>
                    
                    <div className="condition-info">
                        <span className={`condition-badge ${getConditionBadgeClass(product.condition_grade)}`}>
                            {product.condition_grade?.replace('-', ' ')}
                        </span>
                    </div>

                    <div className="price-info">
                        <span className="current-price">{formatPrice(product.price)}</span>
                        {product.original_price && product.original_price > product.price && (
                            <span className="original-price">{formatPrice(product.original_price)}</span>
                        )}
                    </div>

                    <div className="product-meta">
                        <span className="location">📍 {product.location_city}, {product.location_state}</span>
                        <span className="views">👁️ {product.views_count || 0} views</span>
                    </div>

                    <div className="seller-info">
                        <span>Sold by: {product.seller?.shop_username || 'Seller'}</span>
                    </div>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="buyer-homepage loading-state">
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Loading products...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="buyer-homepage">
            {/* Header */}
            <div className="buyer-header">
                <div className="header-content">
                    <h1>Discover Refurbished Tech</h1>
                    <p>Welcome back, {currentUser?.name || 'Buyer'}! Find great deals on quality refurbished electronics.</p>
                </div>
                <div className="header-stats">
                    <div className="stat">
                        <span className="stat-number">{products.length}</span>
                        <span className="stat-label">Products Available</span>
                    </div>
                    <div className="stat">
                        <span className="stat-number">{filteredProducts.length}</span>
                        <span className="stat-label">Matching Your Search</span>
                    </div>
                </div>
            </div>

            {error && (
                <div className="alert alert-error">
                    <span>⚠️ {error}</span>
                    <button onClick={() => setError(null)}>×</button>
                </div>
            )}

            {/* Filters Section */}
            <div className="filters-section">
                <div className="filters-header">
                    <h3>🔍 Filter Products</h3>
                    <button className="clear-filters-btn" onClick={clearFilters}>
                        Clear All Filters
                    </button>
                </div>
                
                <div className="filters-grid">
                    {/* Search */}
                    <div className="filter-group">
                        <label>Search</label>
                        <input
                            type="text"
                            placeholder="Search products, brands, models..."
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                        />
                    </div>

                    {/* Category */}
                    <div className="filter-group">
                        <label>Category</label>
                        <select
                            value={filters.category}
                            onChange={(e) => handleFilterChange('category', e.target.value)}
                        >
                            <option value="">All Categories</option>
                            {categories.map(category => (
                                <option key={category} value={category}>{category}</option>
                            ))}
                        </select>
                    </div>

                    {/* Brand */}
                    <div className="filter-group">
                        <label>Brand</label>
                        <input
                            type="text"
                            placeholder="Filter by brand..."
                            value={filters.brand}
                            onChange={(e) => handleFilterChange('brand', e.target.value)}
                        />
                    </div>

                    {/* Condition */}
                    <div className="filter-group">
                        <label>Condition</label>
                        <select
                            value={filters.condition}
                            onChange={(e) => handleFilterChange('condition', e.target.value)}
                        >
                            <option value="">All Conditions</option>
                            {conditions.map(condition => (
                                <option key={condition.value} value={condition.value}>
                                    {condition.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Price Range */}
                    <div className="filter-group">
                        <label>Min Price</label>
                        <input
                            type="number"
                            placeholder="$0"
                            value={filters.minPrice}
                            onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                        />
                    </div>

                    <div className="filter-group">
                        <label>Max Price</label>
                        <input
                            type="number"
                            placeholder="$10000"
                            value={filters.maxPrice}
                            onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                        />
                    </div>

                    {/* Sort By */}
                    <div className="filter-group">
                        <label>Sort By</label>
                        <select
                            value={filters.sortBy}
                            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                        >
                            {sortOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Products Grid */}
            <div className="products-section">
                <div className="section-header">
                    <h2>Available Products</h2>
                    <p>Showing {filteredProducts.length} of {products.length} products</p>
                </div>

                {filteredProducts.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">🔍</div>
                        <h3>No products found</h3>
                        <p>Try adjusting your filters or search terms</p>
                        <button className="btn btn-primary" onClick={clearFilters}>
                            Clear Filters
                        </button>
                    </div>
                ) : (
                    <div className="products-grid">
                        {filteredProducts.map(renderProductCard)}
                    </div>
                )}
            </div>

            {/* Product Detail Modal */}
            {showProductModal && selectedProduct && (
                <div className="modal-overlay" onClick={() => setShowProductModal(false)}>
                    <div className="modal-content product-detail-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{selectedProduct.title}</h3>
                            <button className="modal-close" onClick={() => setShowProductModal(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            <div className="product-detail-content">
                                <div className="product-images">
                                    {selectedProduct.images && selectedProduct.images.length > 0 ? (
                                        <img src={selectedProduct.images[0]} alt={selectedProduct.title} />
                                    ) : (
                                        <div className="no-image-large">📷</div>
                                    )}
                                </div>
                                
                                <div className="product-details">
                                    <div className="detail-section">
                                        <h4>Product Information</h4>
                                        <div className="detail-grid">
                                            <div><strong>Brand:</strong> {selectedProduct.brand}</div>
                                            <div><strong>Model:</strong> {selectedProduct.model}</div>
                                            <div><strong>Category:</strong> {selectedProduct.category}</div>
                                            <div><strong>Condition:</strong> 
                                                <span className={`condition-badge ${getConditionBadgeClass(selectedProduct.condition_grade)}`}>
                                                    {selectedProduct.condition_grade?.replace('-', ' ')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {selectedProduct.description && (
                                        <div className="detail-section">
                                            <h4>Description</h4>
                                            <p>{selectedProduct.description}</p>
                                        </div>
                                    )}

                                    <div className="detail-section">
                                        <h4>Specifications</h4>
                                        <div className="detail-grid">
                                            {selectedProduct.storage_capacity && <div><strong>Storage:</strong> {selectedProduct.storage_capacity}</div>}
                                            {selectedProduct.ram_memory && <div><strong>RAM:</strong> {selectedProduct.ram_memory}</div>}
                                            {selectedProduct.processor && <div><strong>Processor:</strong> {selectedProduct.processor}</div>}
                                            {selectedProduct.operating_system && <div><strong>OS:</strong> {selectedProduct.operating_system}</div>}
                                            {selectedProduct.screen_size && <div><strong>Screen:</strong> {selectedProduct.screen_size}</div>}
                                            {selectedProduct.color && <div><strong>Color:</strong> {selectedProduct.color}</div>}
                                            {selectedProduct.battery_health && <div><strong>Battery:</strong> {selectedProduct.battery_health}</div>}
                                        </div>
                                    </div>

                                    <div className="detail-section">
                                        <h4>Pricing & Availability</h4>
                                        <div className="price-details">
                                            <div className="current-price-large">{formatPrice(selectedProduct.price)}</div>
                                            {selectedProduct.original_price && selectedProduct.original_price > selectedProduct.price && (
                                                <div className="original-price-large">{formatPrice(selectedProduct.original_price)}</div>
                                            )}
                                            {selectedProduct.negotiable && (
                                                <div className="negotiable-info">💬 Price is negotiable</div>
                                            )}
                                        </div>
                                        <div><strong>Quantity Available:</strong> {selectedProduct.quantity_available}</div>
                                        {selectedProduct.warranty_period && <div><strong>Warranty:</strong> {selectedProduct.warranty_period}</div>}
                                    </div>

                                    <div className="detail-section">
                                        <h4>Seller Information</h4>
                                        <div><strong>Seller:</strong> {selectedProduct.seller?.shop_username || 'Seller'}</div>
                                        <div><strong>Location:</strong> {selectedProduct.location_city}, {selectedProduct.location_state}</div>
                                    </div>

                                    {selectedProduct.included_accessories && (
                                        <div className="detail-section">
                                            <h4>Included Accessories</h4>
                                            <p>{selectedProduct.included_accessories}</p>
                                        </div>
                                    )}

                                    {selectedProduct.defects_issues && (
                                        <div className="detail-section">
                                            <h4>Known Issues</h4>
                                            <p>{selectedProduct.defects_issues}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowProductModal(false)}>
                                Close
                            </button>
                            <button className="btn btn-primary">
                                💬 Contact Seller
                            </button>
                            <button className="btn btn-success">
                                🛒 Buy Now
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
