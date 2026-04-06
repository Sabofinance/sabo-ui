import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../assets/css/ProfilePage.css';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { accountApi } from '../../lib/api';

interface UserDisplay {
  name: string;
  username: string;
  email: string;
  phone: string;
  joined: string;
  avatar: string;
  kycStatus: string;
  isSuspended: boolean;
}

const ProfilePage: React.FC = () => {
  const { user: authUser, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [user, setUser] = useState<UserDisplay>({
    name: '',
    username: '',
    email: '',
    phone: '',
    joined: '',
    avatar: '',
    kycStatus: 'unverified',
    isSuspended: false,
  });

  const pinSet = Boolean(authUser?.transaction_pin_set);

  useEffect(() => {
    if (authUser) {
      setUser({
        name: authUser.name || "",
        username: authUser.username || "",
        email: authUser.email || "",
        phone: authUser.phone || authUser.phoneNumber || "",
        joined: authUser.created_at || authUser.createdAt
          ? new Date(authUser.created_at || authUser.createdAt).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })
          : "N/A",
        avatar: authUser.profile_picture_url
          ? `${authUser.profile_picture_url}?t=${authUser.updated_at || Date.now()}`
          : `https://i.pravatar.cc/300?u=${authUser.id || "user"}`,
        kycStatus: authUser.kyc_status || 'unverified',
        isSuspended: !!authUser.is_suspended,
      });
    }
  }, [authUser]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset the input so the same file can be re-selected later
    if (fileInputRef.current) fileInputRef.current.value = '';

    const MAX_SIZE_MB = 10;
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      toast.error(`File is too large. Maximum size is ${MAX_SIZE_MB} MB.`);
      return;
    }
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (JPG, PNG, etc.).');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      await accountApi.updateProfilePicture(formData);
      toast.success("Profile picture updated");
      await refreshUser();
    } catch (err: any) {
      toast.error(err?.message || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // In a real app, you'd call an API here
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } else {
      setIsEditing(true);
    }
  };

  if (!authUser) return null;

  return (
    <main className="profile-page">
      <div className="page-header">
        <h1 className="page-title">Profile Settings</h1>
        <p className="page-subtitle">Manage your personal information and account security.</p>
      </div>

      <div className="combined-profile-card">
        <div className="profile-header">
          <div className="avatar-wrapper-large">
            <img
              src={user.avatar}
              alt={user.name}
              className="profile-avatar-large"
              style={{ opacity: uploading ? 0.5 : 1, transition: 'opacity 0.2s' }}
            />
            {uploading && (
              <div style={{
                position: 'absolute', inset: 0, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(10,30,40,0.35)',
              }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#C8F032" strokeWidth="2.5" strokeLinecap="round" style={{ animation: 'spin 0.8s linear infinite' }}>
                  <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                  <path d="M12 2a10 10 0 0 1 10 10" />
                </svg>
              </div>
            )}
            <button className="avatar-edit-btn" onClick={() => fileInputRef.current?.click()} disabled={uploading} title="Change profile picture">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
            </button>
            <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*" onChange={handleFileUpload} />
          </div>

          <div className="profile-header-info">
            <h2 className="profile-name">{user.name}</h2>
            <p className="profile-email">@{user.username} • {user.email}</p>
            <div className="profile-badges">
              <span className={`badge ${user.kycStatus === 'verified' ? 'verified' : ''}`}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                {user.kycStatus === 'verified' ? 'Identity Verified' : 'Unverified Account'}
              </span>
              {pinSet && (
                <span className="badge verified">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  PIN Secured
                </span>
              )}
              {user.isSuspended && (
                <span className="badge" style={{ background: 'rgba(231, 76, 60, 0.1)', color: '#e74c3c', borderColor: 'rgba(231, 76, 60, 0.3)' }}>
                  Suspended
                </span>
              )}
            </div>
          </div>

          <button className="edit-toggle-btn" onClick={handleEditToggle}>
            {isEditing ? 'Save Changes' : 'Edit Profile'}
          </button>
        </div>

        <div className="personal-info-section">
          <div className="form-section">
            <h3 className="section-title">Personal Information</h3>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={user.name} 
                  disabled={!isEditing}
                  onChange={(e) => setUser({...user, name: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Username</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={user.username} 
                  disabled={!isEditing}
                  onChange={(e) => setUser({...user, username: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input 
                  type="email" 
                  className="form-input" 
                  value={user.email} 
                  disabled
                />
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input 
                  type="tel" 
                  className="form-input" 
                  value={user.phone} 
                  disabled={!isEditing}
                  onChange={(e) => setUser({...user, phone: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Joined Date</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={user.joined} 
                  disabled
                />
              </div>
              <div className="form-group">
                <label className="form-label">KYC Status</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={user.kycStatus.toUpperCase()} 
                  disabled
                  style={{ color: user.kycStatus === 'verified' ? 'var(--sabo-green)' : 'inherit' }}
                />
              </div>
            </div>
          </div>
          
          <div className="form-section" style={{ borderTop: '1px solid var(--border-light)', paddingTop: '30px' }}>
            <h3 className="section-title">Security Settings</h3>
            <div className="form-grid">
              <div className="form-group">
                <button 
                  className="wbtn wbtn-buy" 
                  style={{ width: 'auto', padding: '12px 24px', fontSize: '14px' }}
                  onClick={() => navigate('/dashboard/transaction-pin')}
                >
                  {pinSet ? 'Change Transaction PIN' : 'Set Transaction PIN'}
                </button>
              </div>
              <div className="form-group">
                <button 
                  className="wbtn wbtn-buy" 
                  style={{ width: 'auto', padding: '12px 24px', fontSize: '14px', background: 'transparent', border: '1px solid var(--sabo-lime)', color: 'var(--sabo-dark)' }}
                  onClick={() => navigate('/forgot-password')}
                >
                  Change Password
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ProfilePage;