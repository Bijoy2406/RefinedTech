import { useState, useEffect } from 'react';
import axios from 'axios';
import '../css/Dashboard.css';
const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8000';

export default function Dashboard() {
    const [users, setUsers] = useState([]);
    const [pendingUsers, setPendingUsers] = useState([]);
    const [activeTab, setActiveTab] = useState('users');
    const [removingUserId, setRemovingUserId] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('rt_token');

        if (activeTab === 'users') {
            axios.get(`${API_BASE}/api/admin/users`, { headers: { Authorization: `Bearer ${token}` } })
                .then(response => {
                    setUsers(response.data);
                })
                .catch(error => console.error('Error fetching users:', error));
        } else {
            axios.get(`${API_BASE}/api/admin/pending-users`, { headers: { Authorization: `Bearer ${token}` } })
                .then(response => {
                    setPendingUsers(response.data);
                })
                .catch(error => console.error('Error fetching pending users:', error));
        }
    }, [activeTab]);

    const handleApprove = (id) => {
        const token = localStorage.getItem('rt_token');
        setRemovingUserId(id);
        axios.put(`${API_BASE}/api/admin/users/${id}/approve`, {}, { headers: { Authorization: `Bearer ${token}` } })
            .then(() => {
                setTimeout(() => {
                    setPendingUsers(pendingUsers.filter(user => user.id !== id));
                    setRemovingUserId(null);
                }, 500); // Corresponds to animation duration
            })
            .catch(error => {
                console.error('Error approving user:', error);
                setRemovingUserId(null);
            });
    };

    const handleReject = (id) => {
        const token = localStorage.getItem('rt_token');
        setRemovingUserId(id);
        axios.put(`${API_BASE}/api/admin/users/${id}/reject`, {}, { headers: { Authorization: `Bearer ${token}` } })
            .then(() => {
                setTimeout(() => {
                    setPendingUsers(pendingUsers.filter(user => user.id !== id));
                    setRemovingUserId(null);
                }, 500); // Corresponds to animation duration
            })
            .catch(error => {
                console.error('Error rejecting user:', error);
                setRemovingUserId(null);
            });
    };

    return (
        <div className="dashboard-container">
            <h1>Admin Dashboard</h1>
            <div className="tabs">
                <button onClick={() => setActiveTab('users')} className={activeTab === 'users' ? 'active' : ''}>Users</button>
                <button onClick={() => setActiveTab('pending')} className={activeTab === 'pending' ? 'active' : ''}>Pending Approvals</button>
            </div>
            {activeTab === 'users' ? (
                <div>
                    <ul className="user-list">
                        {users.map(user => (
                            <li key={user.id}>
                                <div className="user-info">
                                    <span className="name">{user.name}</span>
                                    <span className="email">{user.email}</span>
                                    <span className="role">{user.role}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            ) : (
                <div>
                    <ul className="pending-list">
                        {pendingUsers.map(user => (
                            <li key={user.id} className={removingUserId === user.id ? 'fade-out' : ''}>
                                <div className="user-info">
                                    <span className="name">{user.name}</span>
                                    <span className="email">{user.email}</span>
                                    <span className="role">{user.role}</span>
                                </div>
                                <div className="action-buttons">
                                    <button onClick={() => handleApprove(user.id)} className="approve-btn">Approve</button>
                                    <button onClick={() => handleReject(user.id)} className="reject-btn">Reject</button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
