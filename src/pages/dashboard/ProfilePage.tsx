import React, { useState, useRef } from 'react';
import type { ChangeEvent } from 'react';
import '../../assets/css/ProfilePage.css';
import { useAuth } from '../../context/AuthContext';

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
  const { user: authUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'account'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [visibleAccounts, setVisibleAccounts] = useState<{ [key: string]: boolean }>({});

  const [user, setUser] = useState<User>({
    firstName: authUser?.firstName || 'Akingbade',
    lastName: authUser?.lastName || 'Adeniyi',
    displayName: authUser?.firstName ? `${authUser.firstName} ${authUser.lastName}` : 'Mrs. Akingbade',
    email: authUser?.email || 'akingbade@sabo.com',
    phone: authUser?.phoneNumber || '+234 801 234 5678',
    dob: '1985-06-15',
    address: '123 Sabo Road',
    city: 'Yaba',
    country: 'Nigeria',
    postalCode: '101245',
    joined: authUser?.createdAt ? new Date(authUser.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'January 2024',
    avatar: 'https://i.pravatar.cc/300?u=akingbade',
    kycVerified: true,
  });

  const [wallets] = useState<Wallet[]>([
    {
      currency: 'NGN',
      balance: 4950000.0,
      symbol: '₦',
      flag: '🇳🇬',
      accountNumber: '0123456789',
      accountName: 'Akingbade Adeniyi',
      bank: 'Sabo Bank',
      cardNumber: '**** **** **** 3456',
      expiry: '12/25',
    },
    {
      currency: 'GBP',
      balance: 1250.75,
      symbol: '£',
      flag: '🇬🇧',
      accountNumber: '9876543210',
      accountName: 'Akingbade Adeniyi',
      bank: 'Sabo Bank',
      cardNumber: '**** **** **** 7890',
      expiry: '09/24',
    },
  ]);

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
    console.log('Saved:', user);
  };

  return (
    <div className="dashboard-wrapper">
      <main className="profile-page">
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
              </div>
            )}
      </main>
    </div>
  );
};

export default ProfilePage;