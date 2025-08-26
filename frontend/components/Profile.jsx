import { useState, useEffect } from 'react';
import axios from 'axios';
import '../css/Profile.css';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8000';

export default function Profile({ onClose, onProfileUpdate }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [showPictureUpload, setShowPictureUpload] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [passwordData, setPasswordData] = useState({
        current_password: '',
        new_password: '',
        confirm_password: ''
    });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [updating, setUpdating] = useState(false);
    const [uploadingPicture, setUploadingPicture] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem('rt_token');
            const response = await axios.get(`${API_BASE}/api/profile`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUser(response.data.user);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching profile:', error);
            setLoading(false);
        }
    };

    const handlePasswordChange = (e) => {
        setPasswordData({
            ...passwordData,
            [e.target.name]: e.target.value
        });
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setUpdating(true);

        try {
            const token = localStorage.getItem('rt_token');
            await axios.put(`${API_BASE}/api/profile/password`, passwordData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setMessage('Password updated successfully!');
            setPasswordData({
                current_password: '',
                new_password: '',
                confirm_password: ''
            });
            setShowPasswordForm(false);
        } catch (error) {
            if (error.response?.data?.errors) {
                const errors = Object.values(error.response.data.errors).flat();
                setError(errors.join(', '));
            } else if (error.response?.data?.error) {
                setError(error.response.data.error);
            } else {
                setError('Failed to update password. Please try again.');
            }
        } finally {
            setUpdating(false);
        }
    };

    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            if (!file.type.match(/^image\/(jpeg|jpg|png|gif)$/)) {
                setError('Please select a valid image file (JPEG, PNG, or GIF).');
                return;
            }

            // Validate file size (5MB limit)
            if (file.size > 5 * 1024 * 1024) {
                setError('Image size should be less than 5MB.');
                return;
            }

            setSelectedImage(file);
            
            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target.result);
            };
            reader.readAsDataURL(file);
            setError('');
        }
    };

    const handlePictureUpload = async () => {
        if (!selectedImage) {
            setError('Please select an image first.');
            return;
        }

        setUploadingPicture(true);
        setError('');
        setMessage('');

        try {
            const token = localStorage.getItem('rt_token');
            const reader = new FileReader();
            
            reader.onload = async (e) => {
                const base64Image = e.target.result;
                
                try {
                    const response = await axios.put(`${API_BASE}/api/profile/picture`, {
                        profile_picture: base64Image
                    }, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    
                    setUser(response.data.user);
                    setMessage('Profile picture updated successfully!');
                    setShowPictureUpload(false);
                    setSelectedImage(null);
                    setImagePreview(null);
                    
                    // Update user in localStorage and parent component
                    localStorage.setItem('rt_user', JSON.stringify(response.data.user));
                    if (onProfileUpdate) {
                        onProfileUpdate(response.data.user);
                    }
                } catch (error) {
                    if (error.response?.data?.error) {
                        setError(error.response.data.error);
                    } else {
                        setError('Failed to upload profile picture. Please try again.');
                    }
                } finally {
                    setUploadingPicture(false);
                }
            };
            
            reader.readAsDataURL(selectedImage);
        } catch (error) {
            setError('Failed to process image. Please try again.');
            setUploadingPicture(false);
        }
    };

    const handleRemovePicture = async () => {
        if (!window.confirm('Are you sure you want to remove your profile picture?')) {
            return;
        }

        setUploadingPicture(true);
        setError('');
        setMessage('');

        try {
            const token = localStorage.getItem('rt_token');
            const response = await axios.delete(`${API_BASE}/api/profile/picture`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setUser(response.data.user);
            setMessage('Profile picture removed successfully!');
            
            // Update user in localStorage and parent component
            localStorage.setItem('rt_user', JSON.stringify(response.data.user));
            if (onProfileUpdate) {
                onProfileUpdate(response.data.user);
            }
        } catch (error) {
            if (error.response?.data?.error) {
                setError(error.response.data.error);
            } else {
                setError('Failed to remove profile picture. Please try again.');
            }
        } finally {
            setUploadingPicture(false);
        }
    };

    if (loading) {
        return (
            <div className="profile-overlay">
                <div className="profile-modal">
                    <div className="loading">Loading profile...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="profile-overlay" onClick={onClose}>
            <div className="profile-modal" onClick={e => e.stopPropagation()}>
                <div className="profile-header">
                    <h2>My Profile</h2>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>
                
                <div className="profile-content">
                    {user && (
                        <div className="user-info">
                            <div className="profile-picture-section">
                                <div className="profile-picture-container">
                                    {user.profile_picture ? (
                                        <img 
                                            src={user.profile_picture} 
                                            alt="Profile" 
                                            className="profile-picture"
                                        />
                                    ) : (
                                        <div className="profile-picture-placeholder">
                                            <span>👤</span>
                                        </div>
                                    )}
                                </div>
                                <div className="profile-picture-actions">
                                    {!showPictureUpload ? (
                                        <div className="picture-buttons">
                                            <button 
                                                className="btn secondary picture-btn"
                                                onClick={() => setShowPictureUpload(true)}
                                            >
                                                {user.profile_picture ? 'Change Picture' : 'Add Picture'}
                                            </button>
                                            {user.profile_picture && (
                                                <button 
                                                    className="btn outline remove-btn"
                                                    onClick={handleRemovePicture}
                                                    disabled={uploadingPicture}
                                                >
                                                    Remove
                                                </button>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="picture-upload-section">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageSelect}
                                                className="file-input"
                                                id="profile-picture-input"
                                            />
                                            <label htmlFor="profile-picture-input" className="file-label">
                                                Choose Image (Max 5MB)
                                            </label>
                                            {imagePreview && (
                                                <div className="image-preview">
                                                    <img src={imagePreview} alt="Preview" />
                                                </div>
                                            )}
                                            <div className="upload-actions">
                                                <button 
                                                    className="btn outline"
                                                    onClick={() => {
                                                        setShowPictureUpload(false);
                                                        setSelectedImage(null);
                                                        setImagePreview(null);
                                                        setError('');
                                                    }}
                                                >
                                                    Cancel
                                                </button>
                                                <button 
                                                    className="btn primary"
                                                    onClick={handlePictureUpload}
                                                    disabled={!selectedImage || uploadingPicture}
                                                >
                                                    {uploadingPicture ? 'Uploading...' : 'Upload'}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            <div className="user-details">
                                <div className="info-group">
                                    <label>Name:</label>
                                    <span>{user.name}</span>
                                </div>
                                <div className="info-group">
                                    <label>Email:</label>
                                    <span>{user.email}</span>
                                </div>
                                <div className="info-group">
                                    <label>Role:</label>
                                    <span className={`role-badge ${user.role.toLowerCase()}`}>
                                        {user.role}
                                    </span>
                                </div>
                                <div className="info-group">
                                    <label>Status:</label>
                                    <span className={`status-badge ${user.status}`}>
                                        {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                                    </span>
                                </div>
                                <div className="info-group">
                                    <label>Member Since:</label>
                                    <span>{new Date(user.created_at).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {message && <div className="success-message">{message}</div>}
                    {error && <div className="error-message">{error}</div>}

                    <div className="profile-actions">
                        {!showPasswordForm ? (
                            <button 
                                className="btn primary"
                                onClick={() => setShowPasswordForm(true)}
                            >
                                Change Password
                            </button>
                        ) : (
                            <div className="password-form">
                                <h3>Change Password</h3>
                                <form onSubmit={handlePasswordSubmit}>
                                    <div className="form-group">
                                        <input
                                            type="password"
                                            name="current_password"
                                            placeholder="Current Password"
                                            value={passwordData.current_password}
                                            onChange={handlePasswordChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <input
                                            type="password"
                                            name="new_password"
                                            placeholder="New Password (min. 6 characters)"
                                            value={passwordData.new_password}
                                            onChange={handlePasswordChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <input
                                            type="password"
                                            name="confirm_password"
                                            placeholder="Confirm New Password"
                                            value={passwordData.confirm_password}
                                            onChange={handlePasswordChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-actions">
                                        <button 
                                            type="button" 
                                            className="btn outline"
                                            onClick={() => {
                                                setShowPasswordForm(false);
                                                setPasswordData({
                                                    current_password: '',
                                                    new_password: '',
                                                    confirm_password: ''
                                                });
                                                setError('');
                                                setMessage('');
                                            }}
                                        >
                                            Cancel
                                        </button>
                                        <button 
                                            type="submit" 
                                            className="btn primary"
                                            disabled={updating}
                                        >
                                            {updating ? 'Updating...' : 'Update Password'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
