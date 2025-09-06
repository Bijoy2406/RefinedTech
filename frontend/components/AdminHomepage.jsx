import { useState, useEffect } from 'react';
import axios from 'axios';
import '../css/AdminHomepage.css';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8000';

export default function AdminHomepage() {
    const [currentUser, setCurrentUser] = useState(null);
    const [pendingSellers, setPendingSellers] = useState([]);
    const [pendingAdmins, setPendingAdmins] = useState([]);
    const [pendingBuyers, setPendingBuyers] = useState([]);
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [userDetails, setUserDetails] = useState(null);
    const [actionLoading, setActionLoading] = useState(null);
    const [stats, setStats] = useState({
        totalUsers: 0,
        pendingCount: 0,
        approvedCount: 0,
        rejectedCount: 0
    });

    // Check if current user is Super Admin (first admin or has special permission)
    const isSuperAdmin = () => {
        return currentUser && (
            currentUser.id === 1 || // First admin is super admin
            currentUser.admin_username === 'superadmin' ||
            currentUser.email === 'admin@refinedtech.com'
        );
    };

    useEffect(() => {
        fetchCurrentUser();
        fetchPendingUsers();
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

    const fetchPendingUsers = async () => {
        try {
            const token = localStorage.getItem('rt_token');
            setLoading(true);
            
            const response = await axios.get(`${API_BASE}/api/admin/pending-users`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const pendingUsers = response.data.pending_users || [];
            
            // Separate users by role
            setPendingSellers(pendingUsers.filter(user => user.role === 'Seller'));
            setPendingBuyers(pendingUsers.filter(user => user.role === 'Buyer'));
            setPendingAdmins(pendingUsers.filter(user => user.role === 'Admin'));
            
        } catch (error) {
            console.error('Error fetching pending users:', error);
            setError('Failed to fetch pending users');
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('rt_token');
            const [usersResponse, pendingResponse] = await Promise.all([
                axios.get(`${API_BASE}/api/admin/users`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get(`${API_BASE}/api/admin/pending-users`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);

            const users = usersResponse.data.users || [];
            const pending = pendingResponse.data.pending_users || [];

            setStats({
                totalUsers: users.length + pending.length,
                pendingCount: pending.length,
                approvedCount: users.length,
                rejectedCount: 0 // You might want to add this to your backend
            });
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const fetchUserDetails = async (user) => {
        try {
            const token = localStorage.getItem('rt_token');
            setSelectedUser(user);
            
            const role = user.role.toLowerCase();
            const response = await axios.get(`${API_BASE}/api/admin/users/${role}/${user.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUserDetails(response.data.user);
        } catch (error) {
            console.error('Error fetching user details:', error);
            setError('Failed to fetch user details');
        }
    };

    const handleApprove = async (user) => {
        try {
            const token = localStorage.getItem('rt_token');
            setActionLoading(`approve-${user.id}`);
            
            const role = user.role.toLowerCase();
            await axios.put(`${API_BASE}/api/admin/users/${role}/${user.id}/approve`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Remove from pending lists
            if (user.role === 'Seller') {
                setPendingSellers(prev => prev.filter(u => u.id !== user.id));
            } else if (user.role === 'Admin') {
                setPendingAdmins(prev => prev.filter(u => u.id !== user.id));
            } else if (user.role === 'Buyer') {
                setPendingBuyers(prev => prev.filter(u => u.id !== user.id));
            }

            // Refresh stats
            fetchStats();
            
        } catch (error) {
            console.error('Error approving user:', error);
            setError('Failed to approve user');
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async (user) => {
        try {
            const token = localStorage.getItem('rt_token');
            setActionLoading(`reject-${user.id}`);
            
            const role = user.role.toLowerCase();
            await axios.put(`${API_BASE}/api/admin/users/${role}/${user.id}/reject`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Remove from pending lists
            if (user.role === 'Seller') {
                setPendingSellers(prev => prev.filter(u => u.id !== user.id));
            } else if (user.role === 'Admin') {
                setPendingAdmins(prev => prev.filter(u => u.id !== user.id));
            } else if (user.role === 'Buyer') {
                setPendingBuyers(prev => prev.filter(u => u.id !== user.id));
            }

            // Refresh stats
            fetchStats();
            
        } catch (error) {
            console.error('Error rejecting user:', error);
            setError('Failed to reject user');
        } finally {
            setActionLoading(null);
        }
    };

import { useState, useEffect } from 'react';
import axios from 'axios';
import '../css/AdminHomepage.css';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8000';

export default function AdminHomepage() {
    const [currentUser, setCurrentUser] = useState(null);
    const [pendingSellers, setPendingSellers] = useState([]);
    const [pendingAdmins, setPendingAdmins] = useState([]);
    const [pendingBuyers, setPendingBuyers] = useState([]);
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [userDetails, setUserDetails] = useState(null);
    const [actionLoading, setActionLoading] = useState(null);
    const [stats, setStats] = useState({
        totalUsers: 0,
        pendingCount: 0,
        approvedCount: 0,
        rejectedCount: 0
    });

    // Check if current user is Super Admin (first admin or has special permission)
    const isSuperAdmin = () => {
        return currentUser && (
            currentUser.id === 1 || // First admin is super admin
            currentUser.admin_username === 'superadmin' ||
            currentUser.email === 'admin@refinedtech.com'
        );
    };

    useEffect(() => {
        fetchCurrentUser();
        fetchPendingUsers();
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

    const fetchPendingUsers = async () => {
        try {
            const token = localStorage.getItem('rt_token');
            setLoading(true);
            
            const response = await axios.get(`${API_BASE}/api/admin/pending-users`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const pendingUsers = response.data.pending_users || [];
            
            // Separate users by role
            setPendingSellers(pendingUsers.filter(user => user.role === 'Seller'));
            setPendingBuyers(pendingUsers.filter(user => user.role === 'Buyer'));
            setPendingAdmins(pendingUsers.filter(user => user.role === 'Admin'));
            
        } catch (error) {
            console.error('Error fetching pending users:', error);
            setError('Failed to fetch pending users');
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('rt_token');
            const [usersResponse, pendingResponse] = await Promise.all([
                axios.get(`${API_BASE}/api/admin/users`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get(`${API_BASE}/api/admin/pending-users`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);

            const users = usersResponse.data.users || [];
            const pending = pendingResponse.data.pending_users || [];

            setStats({
                totalUsers: users.length + pending.length,
                pendingCount: pending.length,
                approvedCount: users.length,
                rejectedCount: 0 // You might want to add this to your backend
            });
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const fetchUserDetails = async (user) => {
        try {
            const token = localStorage.getItem('rt_token');
            setSelectedUser(user);
            
            const role = user.role.toLowerCase();
            const response = await axios.get(`${API_BASE}/api/admin/users/${role}/${user.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUserDetails(response.data.user);
        } catch (error) {
            console.error('Error fetching user details:', error);
            setError('Failed to fetch user details');
        }
    };

    const handleApprove = async (user) => {
        try {
            const token = localStorage.getItem('rt_token');
            setActionLoading(`approve-${user.id}`);
            
            const role = user.role.toLowerCase();
            await axios.put(`${API_BASE}/api/admin/users/${role}/${user.id}/approve`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Remove from pending lists
            if (user.role === 'Seller') {
                setPendingSellers(prev => prev.filter(u => u.id !== user.id));
            } else if (user.role === 'Admin') {
                setPendingAdmins(prev => prev.filter(u => u.id !== user.id));
            } else if (user.role === 'Buyer') {
                setPendingBuyers(prev => prev.filter(u => u.id !== user.id));
            }

            // Refresh stats
            fetchStats();
            
        } catch (error) {
            console.error('Error approving user:', error);
            setError('Failed to approve user');
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async (user) => {
        try {
            const token = localStorage.getItem('rt_token');
            setActionLoading(`reject-${user.id}`);
            
            const role = user.role.toLowerCase();
            await axios.put(`${API_BASE}/api/admin/users/${role}/${user.id}/reject`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Remove from pending lists
            if (user.role === 'Seller') {
                setPendingSellers(prev => prev.filter(u => u.id !== user.id));
            } else if (user.role === 'Admin') {
                setPendingAdmins(prev => prev.filter(u => u.id !== user.id));
            } else if (user.role === 'Buyer') {
                setPendingBuyers(prev => prev.filter(u => u.id !== user.id));
            }

            // Refresh stats
            fetchStats();
            
        } catch (error) {
            console.error('Error rejecting user:', error);
            setError('Failed to reject user');
        } finally {
            setActionLoading(null);
        }
    };

    const renderUserCard = (user) => (
        <div key={user.id} className="user-card">
            <div className="user-card-header">
                <div className="user-info">
                    <div className="user-avatar">
                        <span className="avatar-text">{user.name?.charAt(0)?.toUpperCase() || 'U'}</span>
                        <div className="avatar-status"></div>
                    </div>
                    <div className="user-details">
                        <h4 className="user-name">{user.name}</h4>
                        <p className="user-email">{user.email}</p>
                        <span className={`user-role role-${user.role.toLowerCase()}`}>
                            <span className="role-icon">
                                {user.role === 'Seller' ? '🏪' : user.role === 'Buyer' ? '🛒' : '⚙️'}
                            </span>
                            {user.role}
                        </span>
                    </div>
                </div>
                <div className="user-meta">
                    <div className="application-date">
                        <span className="date-label">Applied</span>
                        <span className="date-value">{new Date(user.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="priority-indicator">
                        <span className="priority-dot"></span>
                        <span className="priority-text">Pending Review</span>
                    </div>
                </div>
            </div>
            
            <div className="user-card-body">
                <div className="user-additional-info">
                    <div className="info-item">
                        <span className="info-icon">🌍</span>
                        <span className="info-text">{user.country || 'N/A'}</span>
                    </div>
                    <div className="info-item">
                        <span className="info-icon">📞</span>
                        <span className="info-text">{user.phone_number || 'N/A'}</span>
                    </div>
                    {user.role === 'Seller' && user.shop_username && (
                        <div className="info-item">
                            <span className="info-icon">🏪</span>
                            <span className="info-text">{user.shop_username}</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="user-card-footer">
                <div className="user-actions">
                    <button 
                        className="btn btn-details"
                        onClick={() => fetchUserDetails(user)}
                    >
                        <span className="btn-icon">👁️</span>
                        <span className="btn-text">View Details</span>
                    </button>
                    <button 
                        className="btn btn-approve"
                        onClick={() => handleApprove(user)}
                        disabled={actionLoading === `approve-${user.id}`}
                    >
                        <span className="btn-icon">✅</span>
                        <span className="btn-text">
                            {actionLoading === `approve-${user.id}` ? 'Approving...' : 'Approve'}
                        </span>
                    </button>
                    <button 
                        className="btn btn-reject"
                        onClick={() => handleReject(user)}
                        disabled={actionLoading === `reject-${user.id}`}
                    >
                        <span className="btn-icon">❌</span>
                        <span className="btn-text">
                            {actionLoading === `reject-${user.id}` ? 'Rejecting...' : 'Reject'}
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );

    const renderStatsCard = (title, value, icon, color, trend = null) => (
        <div className={`stats-card ${color}`}>
            <div className="stats-card-content">
                <div className="stats-header">
                    <div className="stats-icon">
                        <span className="icon-bg"></span>
                        <span className="icon-text">{icon}</span>
                    </div>
                    {trend && (
                        <div className={`stats-trend ${trend.type}`}>
                            <span className="trend-icon">{trend.type === 'up' ? '📈' : '📉'}</span>
                            <span className="trend-value">{trend.value}%</span>
                        </div>
                    )}
                </div>
                <div className="stats-content">
                    <h3 className="stats-value">{value}</h3>
                    <p className="stats-title">{title}</p>
                </div>
            </div>
            <div className="stats-background">
                <div className="stats-bg-shape"></div>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="admin-homepage loading-state">
                <div className="loading-container">
                    <div className="loading-spinner">
                        <div className="spinner">
                            <div className="spinner-inner"></div>
                        </div>
                        <div className="loading-content">
                            <h3>Loading Dashboard</h3>
                            <p>Please wait while we fetch your data...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-homepage">
            <div className="admin-header">
                <div className="header-background">
                    <div className="background-gradient"></div>
                    <div className="background-pattern"></div>
                </div>
                <div className="header-content">
                    <div className="header-left">
                        <h1 className="dashboard-title">
                            <span className="title-icon">⚡</span>
                            Admin Dashboard
                        </h1>
                        <p className="dashboard-subtitle">Manage your platform with ease and efficiency</p>
                    </div>
                    <div className="header-right">
                        <div className="admin-info">
                            <div className="admin-welcome">
                                <span className="welcome-text">Welcome back,</span>
                                <span className="admin-name">{currentUser?.name || 'Admin'}</span>
                            </div>
                            {isSuperAdmin() && (
                                <div className="super-admin-badge">
                                    <span className="badge-icon">👑</span>
                                    <span className="badge-text">Super Admin</span>
                                </div>
                            )}
                        </div>
                        <div className="header-actions">
                            <button className="header-btn notification-btn">
                                <span className="btn-icon">🔔</span>
                                <span className="notification-count">{stats.pendingCount}</span>
                            </button>
                            <button className="header-btn refresh-btn" onClick={() => {fetchPendingUsers(); fetchStats();}}>
                                <span className="btn-icon">🔄</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {error && (
                <div className="error-banner">
                    <div className="error-content">
                        <span className="error-icon">⚠️</span>
                        <span className="error-message">{error}</span>
                    </div>
                    <button className="error-close" onClick={() => setError(null)}>
                        <span>×</span>
                    </button>
                </div>
            )}

            <div className="dashboard-tabs">
                <div className="tabs-container">
                    <button 
                        className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
                        onClick={() => setActiveTab('overview')}
                    >
                        <span className="tab-icon">📊</span>
                        <span className="tab-text">Overview</span>
                    </button>
                    <button 
                        className={`tab ${activeTab === 'sellers' ? 'active' : ''}`}
                        onClick={() => setActiveTab('sellers')}
                    >
                        <span className="tab-icon">🏪</span>
                        <span className="tab-text">Sellers</span>
                        {pendingSellers.length > 0 && (
                            <span className="tab-badge">{pendingSellers.length}</span>
                        )}
                    </button>
                    <button 
                        className={`tab ${activeTab === 'admins' ? 'active' : ''}`}
                        onClick={() => setActiveTab('admins')}
                    >
                        <span className="tab-icon">⚙️</span>
                        <span className="tab-text">Admins</span>
                        {pendingAdmins.length > 0 && (
                            <span className="tab-badge">{pendingAdmins.length}</span>
                        )}
                    </button>
                    {isSuperAdmin() && (
                        <button 
                            className={`tab ${activeTab === 'buyers' ? 'active' : ''}`}
                            onClick={() => setActiveTab('buyers')}
                        >
                            <span className="tab-icon">🛒</span>
                            <span className="tab-text">Buyers</span>
                            {pendingBuyers.length > 0 && (
                                <span className="tab-badge">{pendingBuyers.length}</span>
                            )}
                        </button>
                    )}
                    <div className="tab-indicator"></div>
                </div>
            </div>

            <div className="dashboard-content">
                {activeTab === 'overview' && (
                    <div className="overview-section">
                        <div className="section-header">
                            <h2 className="section-title">Dashboard Overview</h2>
                            <p className="section-subtitle">Monitor your platform's key metrics and pending approvals</p>
                        </div>

                        <div className="stats-grid">
                            {renderStatsCard('Total Users', stats.totalUsers, '👥', 'blue', {type: 'up', value: 12})}
                            {renderStatsCard('Pending Approval', stats.pendingCount, '⏳', 'orange', {type: 'down', value: 5})}
                            {renderStatsCard('Approved Users', stats.approvedCount, '✅', 'green', {type: 'up', value: 8})}
                            {renderStatsCard('Active Sellers', pendingSellers.length, '🏪', 'purple', {type: 'up', value: 15})}
                        </div>

                        <div className="quick-actions">
                            <div className="section-header">
                                <h3 className="section-title">Quick Actions</h3>
                                <p className="section-subtitle">Jump to the most important tasks</p>
                            </div>
                            <div className="action-cards">
                                <div className="action-card sellers-card" onClick={() => setActiveTab('sellers')}>
                                    <div className="action-background">
                                        <div className="action-bg-shape"></div>
                                    </div>
                                    <div className="action-content">
                                        <div className="action-icon">
                                            <span className="icon-bg"></span>
                                            <span className="icon-text">🏪</span>
                                        </div>
                                        <div className="action-info">
                                            <h4 className="action-title">Review Sellers</h4>
                                            <p className="action-subtitle">{pendingSellers.length} pending approval</p>
                                            <div className="action-stats">
                                                <span className="stat-item">
                                                    <span className="stat-icon">⏰</span>
                                                    <span className="stat-text">Urgent</span>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="action-arrow">→</div>
                                </div>

                                <div className="action-card admins-card" onClick={() => setActiveTab('admins')}>
                                    <div className="action-background">
                                        <div className="action-bg-shape"></div>
                                    </div>
                                    <div className="action-content">
                                        <div className="action-icon">
                                            <span className="icon-bg"></span>
                                            <span className="icon-text">⚙️</span>
                                        </div>
                                        <div className="action-info">
                                            <h4 className="action-title">Review Admins</h4>
                                            <p className="action-subtitle">{pendingAdmins.length} pending approval</p>
                                            <div className="action-stats">
                                                <span className="stat-item">
                                                    <span className="stat-icon">🔒</span>
                                                    <span className="stat-text">Secure</span>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="action-arrow">→</div>
                                </div>

                                {isSuperAdmin() && (
                                    <div className="action-card buyers-card" onClick={() => setActiveTab('buyers')}>
                                        <div className="action-background">
                                            <div className="action-bg-shape"></div>
                                        </div>
                                        <div className="action-content">
                                            <div className="action-icon">
                                                <span className="icon-bg"></span>
                                                <span className="icon-text">🛒</span>
                                            </div>
                                            <div className="action-info">
                                                <h4 className="action-title">Review Buyers</h4>
                                                <p className="action-subtitle">{pendingBuyers.length} pending approval</p>
                                                <div className="action-stats">
                                                    <span className="stat-item">
                                                        <span className="stat-icon">👑</span>
                                                        <span className="stat-text">Super Admin Only</span>
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="action-arrow">→</div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="recent-activity">
                            <div className="section-header">
                                <h3 className="section-title">Recent Activity</h3>
                                <p className="section-subtitle">Latest platform activities and user registrations</p>
                            </div>
                            <div className="activity-timeline">
                                <div className="activity-item">
                                    <div className="activity-icon">🏪</div>
                                    <div className="activity-content">
                                        <h4>New Seller Registration</h4>
                                        <p>3 new sellers registered today</p>
                                        <span className="activity-time">2 hours ago</span>
                                    </div>
                                </div>
                                <div className="activity-item">
                                    <div className="activity-icon">✅</div>
                                    <div className="activity-content">
                                        <h4>User Approved</h4>
                                        <p>John Doe's seller application approved</p>
                                        <span className="activity-time">4 hours ago</span>
                                    </div>
                                </div>
                                <div className="activity-item">
                                    <div className="activity-icon">⚙️</div>
                                    <div className="activity-content">
                                        <h4>System Update</h4>
                                        <p>Platform maintenance completed successfully</p>
                                        <span className="activity-time">6 hours ago</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'sellers' && (
                    <div className="users-section">
                        <div className="section-header">
                            <h2 className="section-title">Pending Seller Requests</h2>
                            <p className="section-subtitle">Review and approve seller applications to grow your marketplace</p>
                            <div className="section-actions">
                                <button className="section-btn filter-btn">
                                    <span className="btn-icon">🔍</span>
                                    <span className="btn-text">Filter</span>
                                </button>
                                <button className="section-btn sort-btn">
                                    <span className="btn-icon">📊</span>
                                    <span className="btn-text">Sort</span>
                                </button>
                            </div>
                        </div>
                        {pendingSellers.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-illustration">
                                    <div className="empty-icon">🏪</div>
                                    <div className="empty-shapes">
                                        <div className="shape shape-1"></div>
                                        <div className="shape shape-2"></div>
                                        <div className="shape shape-3"></div>
                                    </div>
                                </div>
                                <h3 className="empty-title">No pending seller requests</h3>
                                <p className="empty-subtitle">All seller applications have been processed. New requests will appear here.</p>
                                <button className="empty-action" onClick={() => {fetchPendingUsers(); fetchStats();}}>
                                    <span className="btn-icon">🔄</span>
                                    <span className="btn-text">Refresh</span>
                                </button>
                            </div>
                        ) : (
                            <div className="users-grid">
                                {pendingSellers.map(renderUserCard)}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'buyers' && isSuperAdmin() && (
                    <div className="users-section">
                        <div className="section-header">
                            <h2 className="section-title">Pending Buyer Requests</h2>
                            <p className="section-subtitle">Review and approve buyer applications</p>
                            <div className="super-admin-notice">
                                <span className="notice-icon">🔐</span>
                                <span className="notice-text">Super Admin Access Required</span>
                            </div>
                        </div>
                        {pendingBuyers.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-illustration">
                                    <div className="empty-icon">🛒</div>
                                    <div className="empty-shapes">
                                        <div className="shape shape-1"></div>
                                        <div className="shape shape-2"></div>
                                        <div className="shape shape-3"></div>
                                    </div>
                                </div>
                                <h3 className="empty-title">No pending buyer requests</h3>
                                <p className="empty-subtitle">All buyer applications have been processed. New requests will appear here.</p>
                                <button className="empty-action" onClick={() => {fetchPendingUsers(); fetchStats();}}>
                                    <span className="btn-icon">🔄</span>
                                    <span className="btn-text">Refresh</span>
                                </button>
                            </div>
                        ) : (
                            <div className="users-grid">
                                {pendingBuyers.map(renderUserCard)}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'admins' && (
                    <div className="users-section">
                        <div className="section-header">
                            <h2 className="section-title">Pending Admin Requests</h2>
                            <p className="section-subtitle">Review and approve admin applications with enhanced security</p>
                        </div>
                        {pendingAdmins.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-illustration">
                                    <div className="empty-icon">⚙️</div>
                                    <div className="empty-shapes">
                                        <div className="shape shape-1"></div>
                                        <div className="shape shape-2"></div>
                                        <div className="shape shape-3"></div>
                                    </div>
                                </div>
                                <h3 className="empty-title">No pending admin requests</h3>
                                <p className="empty-subtitle">All admin applications have been processed. New requests will appear here.</p>
                                <button className="empty-action" onClick={() => {fetchPendingUsers(); fetchStats();}}>
                                    <span className="btn-icon">🔄</span>
                                    <span className="btn-text">Refresh</span>
                                </button>
                            </div>
                        ) : (
                            <div className="users-grid">
                                {pendingAdmins.map(renderUserCard)}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Enhanced User Details Modal */}
            {selectedUser && (
                <div className="modal-overlay" onClick={() => setSelectedUser(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <div className="modal-title-section">
                                <h3 className="modal-title">User Details</h3>
                                <span className="modal-subtitle">Complete user information and verification details</span>
                            </div>
                            <button className="modal-close" onClick={() => setSelectedUser(null)}>
                                <span>×</span>
                            </button>
                        </div>
                        <div className="modal-body">
                            {userDetails ? (
                                <div className="user-details">
                                    <div className="detail-header">
                                        <div className="detail-avatar">
                                            <span className="avatar-text">{userDetails.name?.charAt(0)?.toUpperCase() || 'U'}</span>
                                        </div>
                                        <div className="detail-info">
                                            <h4 className="detail-name">{userDetails.name}</h4>
                                            <p className="detail-email">{userDetails.email}</p>
                                            <span className={`detail-role role-${userDetails.role?.toLowerCase()}`}>
                                                {userDetails.role}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="detail-sections">
                                        <div className="detail-section">
                                            <h5 className="section-title">Personal Information</h5>
                                            <div className="detail-grid">
                                                <div className="detail-row">
                                                    <label>Country:</label>
                                                    <span>{userDetails.country || 'N/A'}</span>
                                                </div>
                                                <div className="detail-row">
                                                    <label>Phone:</label>
                                                    <span>{userDetails.phone_number || 'N/A'}</span>
                                                </div>
                                                {userDetails.date_of_birth && (
                                                    <div className="detail-row">
                                                        <label>Date of Birth:</label>
                                                        <span>{userDetails.date_of_birth}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {userDetails.role === 'Seller' && (
                                            <div className="detail-section">
                                                <h5 className="section-title">Business Information</h5>
                                                <div className="detail-grid">
                                                    <div className="detail-row">
                                                        <label>Shop Username:</label>
                                                        <span>{userDetails.shop_username || 'N/A'}</span>
                                                    </div>
                                                    <div className="detail-row">
                                                        <label>Business Address:</label>
                                                        <span>{userDetails.business_address || 'N/A'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {userDetails.role === 'Admin' && (
                                            <div className="detail-section">
                                                <h5 className="section-title">Admin Information</h5>
                                                <div className="detail-grid">
                                                    <div className="detail-row">
                                                        <label>Admin Username:</label>
                                                        <span>{userDetails.admin_username || 'N/A'}</span>
                                                    </div>
                                                    <div className="detail-row">
                                                        <label>ID Proof Reference:</label>
                                                        <span>{userDetails.id_proof_reference || 'N/A'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <div className="detail-section">
                                            <h5 className="section-title">Application Details</h5>
                                            <div className="detail-grid">
                                                <div className="detail-row">
                                                    <label>Applied Date:</label>
                                                    <span>{new Date(userDetails.created_at).toLocaleString()}</span>
                                                </div>
                                                <div className="detail-row">
                                                    <label>Status:</label>
                                                    <span className="status-pending">Pending Review</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="modal-actions">
                                        <button 
                                            className="modal-btn btn-approve"
                                            onClick={() => {
                                                handleApprove(selectedUser);
                                                setSelectedUser(null);
                                            }}
                                            disabled={actionLoading === `approve-${selectedUser.id}`}
                                        >
                                            <span className="btn-icon">✅</span>
                                            <span className="btn-text">Approve User</span>
                                        </button>
                                        <button 
                                            className="modal-btn btn-reject"
                                            onClick={() => {
                                                handleReject(selectedUser);
                                                setSelectedUser(null);
                                            }}
                                            disabled={actionLoading === `reject-${selectedUser.id}`}
                                        >
                                            <span className="btn-icon">❌</span>
                                            <span className="btn-text">Reject User</span>
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="loading-details">
                                    <div className="loading-spinner">
                                        <div className="spinner">
                                            <div className="spinner-inner"></div>
                                        </div>
                                    </div>
                                    <p>Loading user details...</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
