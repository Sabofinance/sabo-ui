import React, { useEffect, useState, useRef } from 'react';
import type { ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../assets/css/ProfilePage.css';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { walletsApi } from '../../lib/api';
import { accountApi } from '../../lib/api/account.api';

interface Wallet {
  currency: string;
  balance: number;
  symbol: string;
  flag: string;
  accountNumber: string;
  accountName: string;
  bank?: string;
  cardNumber: string;
  expiry: string;
}

interface User {
  firstName: string;
  lastName: string;
  displayName: string;
  email: string;
  phone: string;
  dob: string;
  address: string;
  city: string;
  country: string;
  postalCode: string;
  joined: string;
  avatar: string;
  kycVerified: boolean;
}

const ProfilePage: React.FC = () => {
  const { user: authUser, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'profile' | 'account'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [visibleAccounts, setVisibleAccounts] = useState<{ [key: string]: boolean }>({});

  const [usernameEditing, setUsernameEditing] = useState(false);
  const [usernameValue, setUsernameValue] = useState<string>('');
  const [usernameError, setUsernameError] = useState<string>('');
  const [usernameSaving, setUsernameSaving] = useState<boolean>(false);

  const [user, setUser] = useState<User>({
    firstName: '',
    lastName: '',
    displayName: '',
    email: '',
    phone: '',
    dob: '',
    address: '',
    city: '',
    country: '',
    postalCode: '',
    joined: '',
    avatar: 'https://i.pravatar.cc/300?u=user',
    kycVerified: false,
  });

  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [walletLoading, setWalletLoading] = useState(true);
  const [walletError, setWalletError] = useState('');

  const pinSet = Boolean(authUser?.transaction_pin_set);
  const USERNAME_REGEX = /^[A-Za-z0-9_]+$/;
  const USERNAME_MIN = 3;
  const USERNAME_MAX = 30;

  useEffect(() => {
    if (authUser) {
      setUser({
        firstName: authUser.firstName || '',
        lastName: authUser.lastName || '',
        displayName: authUser.name || `${authUser.firstName || ''} ${authUser.lastName || ''}`.trim() || 'User',
        email: authUser.email || '',
        phone: authUser.phoneNumber || '',
        dob: '',
        address: '',
        city: '',
        country: '',
        postalCode: '',
        joined: authUser.createdAt ? new Date(authUser.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '',
        avatar: 'https://i.pravatar.cc/300?u=' + (authUser.id || 'user'),
        kycVerified: Boolean(authUser.isEmailVerified && authUser.isPhoneVerified), // Improved logic
      });
    }
  }, [authUser]);

  useEffect(() => {
    if (!authUser) return;
    const next = authUser.username || authUser.name || `${authUser.firstName || ''} ${authUser.lastName || ''}`.trim();
    setUsernameValue(next);
  }, [authUser]);

  useEffect(() => {
    const loadWallets = async () => {
      setWalletLoading(true);
      setWalletError('');
      try {
        const response = await walletsApi.list();
        if (response.success && Array.isArray(response.data)) {
          setWallets(response.data.map((wallet: Record<string, unknown>) => ({
            currency: String(wallet.currency || 'NGN'),
            balance: Number(wallet.balance || 0),
            symbol: String(wallet.symbol || '₦'),
            flag: String(wallet.flag || '🏦'),
            accountNumber: String(wallet.accountNumber || ''),
            accountName: String(wallet.accountName || user.displayName),
            bank: String(wallet.bank || ''),
            cardNumber: String(wallet.cardNumber || ''),
            expiry: String(wallet.expiry || ''),
          })));
        } else if (!response.success) {
          setWalletError(response.error?.message || 'Failed to load wallets');
        }
      } catch (err: any) {
        setWalletError('An unexpected error occurred while loading wallets');
      } finally {
        setWalletLoading(false);
      }
    };
    if (authUser) {
      void loadWallets();
    }
  }, [authUser, user.displayName]);

  const formatNumber = (num: number): string =>
    new Intl.NumberFormat('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num);

  const maskAccount = (acc: string): string => {
    if (acc.length <= 4) return acc;
    return '*'.repeat(acc.length - 4) + acc.slice(-4);
  };

  const toggleAccountVisibility = (currency: string) => {
    setVisibleAccounts(prev => ({ ...prev, [currency]: !prev[currency] }));
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setUser(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUser(prev => ({ ...prev, avatar: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    setIsEditing(false);
    // Keep this UI silent; saving is local-only unless wired to backend.
  };

  return (
    <div className="dashboard-wrapper">
      <main className="profile-page">
            {!pinSet && (
              <div
                style={{
                  marginBottom: 18,
                  padding: "14px 16px",
                  borderRadius: 18,
                  background: "#fff7e6",
                  border: "1px solid #fde68a",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 12,
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <div style={{ fontWeight: 900, marginBottom: 4 }}>Transaction PIN required</div>
                  <div style={{ color: "#6b7280", fontSize: 13 }}>Set your PIN to place bids and initiate trades.</div>
                </div>
                <button className="btn-primary" style={{ width: "auto" }} onClick={() => navigate("/dashboard/transaction-pin")}>
                  Set PIN
                </button>
              </div>
            )}
            <div className="page-header">
              <h1 className="page-title">Profile</h1>
              <p className="page-subtitle">Manage your personal information and view your cards</p>
            </div>

            {/* Tab Switcher */}
            <div className="tab-switcher">
              <button
                className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
                onClick={() => setActiveTab('profile')}
              >
                Profile
              </button>
              <button
                className={`tab-button ${activeTab === 'account' ? 'active' : ''}`}
                onClick={() => setActiveTab('account')}
              >
                Account
              </button>
            </div>

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="combined-profile-card">
                {/* Profile Header */}
                <div className="profile-header">
                  <div className="avatar-wrapper-large">
                    <img 
                      src={user.avatar} 
                      alt={user.displayName} 
                      className="profile-avatar-large" 
                    />
                    
                    <button 
                      className="avatar-edit-btn" 
                      onClick={handleAvatarClick}
                      aria-label="Change profile picture"
                    >
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path 
                          d="M21 8.5C21 7.67157 20.3284 7 19.5 7H17.5L15.5 4H8.5L6.5 7H4.5C3.67157 7 3 7.67157 3 8.5V18.5C3 19.3284 3.67157 20 4.5 20H19.5C20.3284 20 21 19.3284 21 18.5V8.5Z" 
                          fill="#0A1E28" 
                          stroke="#0A1E28" 
                          strokeWidth="1.5"
                        />
                        <circle 
                          cx="12" 
                          cy="13.5" 
                          r="3.3" 
                          fill="#C8F032" 
                          stroke="#0A1E28" 
                          strokeWidth="1.8"
                        />
                        <circle 
                          cx="17.5" 
                          cy="9" 
                          r="1.1" 
                          fill="#0A1E28" 
                        />
                      </svg>
                    </button>

                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleAvatarChange}
                      accept="image/*"
                      style={{ display: 'none' }}
                    />
                  </div>

                  <div className="profile-header-info">
                    <h2 className="profile-name">{user.displayName}</h2>
                    <p className="profile-email">{user.email}</p>
                    <div className="profile-badges">
                      {user.kycVerified && (
                        <span className="badge verified">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                            <polyline points="22 4 12 14.01 9 11.01" />
                          </svg>
                          KYC Verified
                        </span>
                      )}
                      <span className="badge member-since">Member since {user.joined}</span>
                    </div>
                  </div>

                  <button 
                    className="edit-toggle-btn" 
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    {isEditing ? 'Cancel' : 'Edit Profile'}
                  </button>
                </div>

                {/* Personal Information Form */}
                <div className="personal-info-section">
                  <div className="form-section">
                    <h3 className="section-title">Basic Information</h3>
                    <div className="form-grid">
                      <div className="form-group">
                        <label htmlFor="firstName">First Name</label>
                        <input
                          type="text"
                          id="firstName"
                          name="firstName"
                          value={user.firstName}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          placeholder="Enter first name"
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="lastName">Last Name</label>
                        <input
                          type="text"
                          id="lastName"
                          name="lastName"
                          value={user.lastName}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          placeholder="Enter last name"
                        />
                      </div>
                      <div className="form-group full-width">
                        <label htmlFor="displayName">Display Name</label>
                        <input
                          type="text"
                          id="displayName"
                          name="displayName"
                          value={user.displayName}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          placeholder="How should we display your name?"
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="dob">Date of Birth</label>
                        <input
                          type="date"
                          id="dob"
                          name="dob"
                          value={user.dob}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-section">
                    <h3 className="section-title">Contact Details</h3>
                    <div className="form-grid">
                      <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={user.email}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          placeholder="email@example.com"
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="phone">Phone Number</label>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={user.phone}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          placeholder="+234 801 234 5678"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-section">
                    <h3 className="section-title">Address</h3>
                    <div className="form-grid">
                      <div className="form-group full-width">
                        <label htmlFor="address">Street Address</label>
                        <input
                          type="text"
                          id="address"
                          name="address"
                          value={user.address}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          placeholder="Enter your street address"
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="city">City</label>
                        <input
                          type="text"
                          id="city"
                          name="city"
                          value={user.city}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          placeholder="City"
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="country">Country</label>
                        <select
                          id="country"
                          name="country"
                          value={user.country}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                        >
                          <option value="Nigeria">Nigeria</option>
                          <option value="Ghana">Ghana</option>
                          <option value="Kenya">Kenya</option>
                          <option value="South Africa">South Africa</option>
                          <option value="United Kingdom">United Kingdom</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label htmlFor="postalCode">Postal Code</label>
                        <input
                          type="text"
                          id="postalCode"
                          name="postalCode"
                          value={user.postalCode}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          placeholder="Postal code"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Username Section (backend: PUT /account/username) */}
                  <div className="form-section" style={{ marginTop: 22 }}>
                    <h3 className="section-title">Username</h3>
                    {!usernameEditing ? (
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                        <div style={{ fontWeight: 900, fontSize: 16 }}>{usernameValue || "—"}</div>
                        <button className="btn-primary" style={{ width: "auto" }} onClick={() => { setUsernameEditing(true); setUsernameError(''); }}>
                          Edit username
                        </button>
                      </div>
                    ) : (
                      <div>
                        <div className="form-group">
                          <label style={{ display: "block", marginBottom: 6, fontWeight: 600, color: "#6b7280" }}>Choose a username</label>
                          <input
                            type="text"
                            value={usernameValue}
                            onChange={(e) => {
                              setUsernameValue(e.target.value);
                              setUsernameError('');
                            }}
                            style={{ width: "100%", padding: "12px 16px", borderRadius: 16, border: "1px solid #D1D5DB" }}
                            placeholder="Enter username"
                          />
                          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, color: "#6b7280", fontSize: 12 }}>
                            <span>Allowed: letters, numbers, underscores</span>
                            <span>{usernameValue.length}/{USERNAME_MAX}</span>
                          </div>
                        </div>

                        {usernameError && (
                          <div style={{ marginTop: 10, padding: "10px 12px", borderRadius: 16, background: "#fee2e2", border: "1px solid #fecaca", color: "#991b1b", fontWeight: 600 }}>
                            {usernameError}
                          </div>
                        )}

                        <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
                          <button
                            className="btn-primary"
                            type="button"
                            disabled={usernameSaving}
                            onClick={() => {
                              setUsernameEditing(false);
                              setUsernameError('');
                              const next = authUser?.username || authUser?.name || usernameValue;
                              setUsernameValue(next || '');
                            }}
                            style={{ background: "#fff", border: "1px solid #D1D5DB", color: "#0A1E28", boxShadow: "none" }}
                          >
                            Cancel
                          </button>
                          <button
                            className="btn-primary"
                            style={{ width: "auto" }}
                            type="button"
                            disabled={usernameSaving}
                            onClick={async () => {
                              const next = usernameValue.trim();
                              if (next.length < USERNAME_MIN || next.length > USERNAME_MAX) {
                                setUsernameError(`Username must be between ${USERNAME_MIN} and ${USERNAME_MAX} characters.`);
                                return;
                              }
                              if (!USERNAME_REGEX.test(next)) {
                                setUsernameError('Username can only contain letters, numbers, and underscores (no spaces).');
                                return;
                              }

                              setUsernameSaving(true);
                              try {
                                await accountApi.updateUsername(next);
                                toast.success('Username updated.');
                                await refreshUser();
                                setUsernameEditing(false);
                              } catch (err: any) {
                                const code = String(err?.code || '');
                                if (code === 'USERNAME_TAKEN') {
                                  setUsernameError('That username is already taken.');
                                  return;
                                }
                                setUsernameError(err?.message || 'Failed to update username.');
                              } finally {
                                setUsernameSaving(false);
                              }
                            }}
                          >
                            {usernameSaving ? 'Saving...' : 'Save'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {isEditing && (
                    <div className="form-actions">
                      <button className="btn-primary" onClick={handleSave}>Save Changes</button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Account Tab */}
            {activeTab === 'account' && (
              <div className="account-cards-section">
                <h3 className="section-title">Your Cards</h3>
                {walletLoading && (
                  <div style={{ padding: '40px 16px', textAlign: 'center', color: '#64748B' }}>
                    Loading your wallets...
                  </div>
                )}
                {walletError && (
                  <div style={{ padding: '16px', margin: '16px 0', background: '#fee2e2', border: '1px solid #fecaca', borderRadius: 8, color: '#991b1b' }}>
                    {walletError}
                  </div>
                )}
                {!walletLoading && !walletError && wallets.length === 0 && (
                  <div style={{ padding: '40px 16px', textAlign: 'center', color: '#64748B' }}>
                    No wallets found.
                  </div>
                )}
                {!walletLoading && !walletError && wallets.length > 0 && (
                <div className="atm-cards-container">
                  {wallets.map((wallet) => (
                    <div key={wallet.currency} className={`atm-card ${wallet.currency.toLowerCase()}`}>
                      <div className="card-chip">
                        <svg width="40" height="30" viewBox="0 0 40 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect x="4" y="4" width="32" height="22" rx="4" fill="#B8860B" />
                          <rect x="8" y="8" width="24" height="14" rx="2" fill="#DAA520" />
                          <line x1="12" y1="12" x2="28" y2="12" stroke="#8B691B" strokeWidth="1" />
                          <line x1="12" y1="16" x2="28" y2="16" stroke="#8B691B" strokeWidth="1" />
                        </svg>
                      </div>
                      <div className="card-flag">{wallet.flag}</div>
                      <div className="card-number">{wallet.cardNumber}</div>

                      <div className="account-row">
                        <span className="account-label">Account</span>
                        <span className="account-number">
                          {visibleAccounts[wallet.currency] ? wallet.accountNumber : maskAccount(wallet.accountNumber)}
                        </span>
                        <button
                          className="toggle-visibility-btn"
                          onClick={() => toggleAccountVisibility(wallet.currency)}
                          aria-label="Toggle account number visibility"
                        >
                          {visibleAccounts[wallet.currency] ? (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                          ) : (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                              <line x1="1" y1="1" x2="23" y2="23" />
                            </svg>
                          )}
                        </button>
                      </div>

                      <div className="card-details">
                        <span className="card-holder">{wallet.accountName}</span>
                        <span className="card-expiry">{wallet.expiry}</span>
                      </div>
                      <div className="card-balance">
                        <span className="balance-label">Balance</span>
                        <span className="balance-amount">{wallet.symbol}{formatNumber(wallet.balance)}</span>
                      </div>
                      <div className="card-brand">
                        <span>{wallet.bank}</span>
                      </div>
                    </div>
                  ))}
                </div>
                )}
              </div>
            )}
      </main>
    </div>
  );
};

export default ProfilePage;