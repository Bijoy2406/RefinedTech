import { useState, useEffect } from 'react';
import axios from 'axios';
import '../css/Profile.css';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8000';

export default function Profile({ onClose }) {
    const [user, setUser] = useState(null);
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [imageError, setImageError] = useState('');
    const [imagePreview, setImagePreview] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [passwordData, setPasswordData] = useState({
        current_password: '',
        new_password: '',
        confirm_password: ''
    });
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        fetchUserInfo();
        
        // Add escape key listener
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        
        document.addEventListener('keydown', handleEscape);
        
        // Prevent body scroll when modal is open
        document.body.style.overflow = 'hidden';
        
        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [onClose]);

    const fetchUserInfo = async () => {
        try {
            const token = localStorage.getItem('rt_token');
            
            if (!token) {
                console.error('No token found');
                onClose(); // Close modal and redirect to login
                return;
            }

            const response = await axios.get(`${API_BASE}/api/user`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const enriched = {
                ...response.data.user,
                profile_image_url: response.data.profile_image_url || null
            };
            setUser(enriched);
            if (enriched.profile_image_url) {
                // Add cache-busting param so latest uploaded image shows instead of cached first version
                setImagePreview(enriched.profile_image_url + '?t=' + Date.now());
            }
        } catch (error) {
            console.error('Error fetching user info:', error);
            
            // If unauthorized, clear token and close modal
            if (error.response?.status === 401) {
                console.log('Profile: 401 Unauthorized - clearing tokens');
                localStorage.removeItem('rt_token');
                localStorage.removeItem('rt_user');
                onClose(); // This will close the modal and might trigger a logout
                
                // Trigger a custom event to notify App component about authentication failure
                window.dispatchEvent(new CustomEvent('auth-failed'));
            }
        }
    };

    const handleImageSelect = (e) => {
        const file = e.target.files?.[0];
        setImageError('');
        if (!file) return;
        if (!/image\//.test(file.type)) {
            setImageError('Only image files allowed');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setImageError('Max size 5MB');
            return;
        }
        const reader = new FileReader();
        reader.onload = ev => {
            // local preview already data URL; append dummy param to differentiate across selections
            const base = ev.target.result;
            setImagePreview(typeof base === 'string' ? base.split('#')[0] + '#sel=' + Date.now() : base);
        };
        reader.readAsDataURL(file);
    setSelectedFile(file); // wait for explicit upload action
    };

    const uploadImage = async (fileParam) => {
        try {
            setUploadingImage(true);
            const token = localStorage.getItem('rt_token');
            let payload;
            let headers = { Authorization: `Bearer ${token}` };
            // If we have a File object but want base64, convert
            if (fileParam instanceof File) {
                const base64Data = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result);
                    reader.onerror = reject;
                    reader.readAsDataURL(fileParam);
                });
                payload = { base64Image: base64Data };
            } else if (typeof fileParam === 'string' && fileParam.startsWith('data:image/')) {
                payload = { base64Image: fileParam };
            } else {
                // fallback: attempt multipart
                const formData = new FormData();
                formData.append('image', fileParam);
                payload = formData;
                headers['Content-Type'] = 'multipart/form-data';
            }
            const { data } = await axios.post(`${API_BASE}/api/profile/image`, payload, { headers });
            setUser(u => ({ ...u, profile_image_url: data.profile_image_url }));
            if (data.profile_image_url) {
                const bustUrl = data.profile_image_url + '?t=' + Date.now();
                setImagePreview(bustUrl);
            }
        setSelectedFile(null);
        // Notify app to refresh navbar avatar immediately
        window.dispatchEvent(new CustomEvent('profile-image-updated', { detail: { url: data.profile_image_url + '?t=' + Date.now() } }));
        } catch (err) {
            setImageError(err.response?.data?.errors?.image?.[0] || 'Upload failed');
        } finally {
            setUploadingImage(false);
        }
    };

    const handlePasswordChange = (e) => {
        setPasswordData({
            ...passwordData,
            [e.target.name]: e.target.value
        });
        setPasswordError('');
        setPasswordSuccess('');
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setPasswordError('');
        setPasswordSuccess('');

        if (passwordData.new_password !== passwordData.confirm_password) {
            setPasswordError('New passwords do not match');
            setIsLoading(false);
            return;
        }

        try {
            const token = localStorage.getItem('rt_token');
            await axios.put(`${API_BASE}/api/profile/password`, passwordData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setPasswordSuccess('Password updated successfully!');
            setPasswordData({
                current_password: '',
                new_password: '',
                confirm_password: ''
            });
            
            // Hide password form after successful update
            setTimeout(() => {
                setShowPasswordForm(false);
                setPasswordSuccess('');
            }, 2000);

        } catch (error) {
            if (error.response?.data?.error) {
                setPasswordError(error.response.data.error);
            } else if (error.response?.data?.errors) {
                const errorMessages = Object.values(error.response.data.errors).flat();
                setPasswordError(errorMessages.join(', '));
            } else {
                setPasswordError('Failed to update password');
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (!user) {
        return (
            <div className="profile-overlay" onClick={onClose}>
                <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
                    <div className="profile-header">
                        <h2>Profile</h2>
                        <button className="close-btn" onClick={onClose}>&times;</button>
                    </div>
                    <div className="profile-loading">Loading...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="profile-overlay" onClick={onClose}>
            <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
                <div className="profile-header">
                    <h2>Profile</h2>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>
                
                <div className="profile-content">
                    <div className="profile-avatar-section">
                        <div className="avatar-wrapper">
                            {imagePreview ? (
                                <img src={imagePreview} alt="Profile" className="profile-avatar" />
                            ) : (
                                <div className="avatar-placeholder">{user.name?.[0] || '?'}</div>
                            )}
                            <label className="avatar-upload-btn">
                                <input type="file" accept="image/*" onChange={handleImageSelect} hidden />
                                {uploadingImage ? 'Uploading...' : 'Change'}
                            </label>
                        </div>
                        {selectedFile && !uploadingImage && (
                            <button
                                className="btn upload-avatar-btn"
                                style={{ marginTop: '10px' }}
                                onClick={() => uploadImage(selectedFile)}
                            >
                                Upload
                            </button>
                        )}
                        {uploadingImage && (
                            <div className="uploading-indicator" style={{marginTop:'10px', fontSize:'0.8rem', color:'var(--text-secondary)'}}>
                                Uploading image...
                            </div>
                        )}
                        {imageError && <div className="error-message" style={{marginTop:'8px'}}>{imageError}</div>}
                        <p className="avatar-hint">JPG/PNG/GIF/WEBP up to 5MB.</p>
                    </div>
                    <div className="profile-info">
                        <div className="info-item">
                            <label>Name:</label>
                            <span>{user.name}</span>
                        </div>
                        <div className="info-item">
                            <label>Email:</label>
                            <span>{user.email}</span>
                        </div>
                        <div className="info-item">
                            <label>Role:</label>
                            <span className="role-badge">{user.role}</span>
                        </div>
                        <div className="info-item">
                            <label>Status:</label>
                            <span className={`status-badge ${user.status?.toLowerCase()}`}>
                                {user.status || 'Active'}
                            </span>
                        </div>
                        <div className="info-item">
                            <label>Member Since:</label>
                            <span>{new Date(user.created_at).toLocaleDateString()}</span>
                        </div>
                    </div>

                    <div className="profile-actions">
                        <button 
                            className="btn change-password-btn"
                            onClick={() => setShowPasswordForm(!showPasswordForm)}
                        >
                            {showPasswordForm ? 'Cancel' : 'Change Password'}
                        </button>
                    </div>

                    {showPasswordForm && (
                        <div className="password-form-section">
                            <h3>Change Password</h3>
                            <form onSubmit={handlePasswordSubmit}>
                                <div className="form-group">
                                    <label>Current Password:</label>
                                    <input
                                        type="password"
                                        name="current_password"
                                        value={passwordData.current_password}
                                        onChange={handlePasswordChange}
                                        required
                                        disabled={isLoading}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>New Password:</label>
                                    <input
                                        type="password"
                                        name="new_password"
                                        value={passwordData.new_password}
                                        onChange={handlePasswordChange}
                                        required
                                        minLength="6"
                                        disabled={isLoading}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Confirm New Password:</label>
                                    <input
                                        type="password"
                                        name="confirm_password"
                                        value={passwordData.confirm_password}
                                        onChange={handlePasswordChange}
                                        required
                                        minLength="6"
                                        disabled={isLoading}
                                    />
                                </div>

                                {passwordError && (
                                    <div className="error-message">{passwordError}</div>
                                )}
                                
                                {passwordSuccess && (
                                    <div className="success-message">{passwordSuccess}</div>
                                )}

                                <div className="form-actions">
                                    <button 
                                        type="submit" 
                                        className="btn update-btn"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? 'Updating...' : 'Update Password'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
