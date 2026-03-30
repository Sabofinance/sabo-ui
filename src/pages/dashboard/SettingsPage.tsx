import React, { useState } from 'react';
import type { ChangeEvent } from 'react';
import '../../assets/css/SettingsPage.css';
import authApi from '../../lib/api/auth.api';
import { accountApi } from '../../lib/api/account.api';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { refreshUser, logout } = useAuth();

  const [activeTab, setActiveTab] = useState<'security' | 'notifications' | 'appearance' | 'account'>('security');

  // Security states
  const [twoFactor, setTwoFactor] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: '',
  });

  // Notification states
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [marketingEmails, setMarketingEmails] = useState(false);

  // Appearance states
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('light');
  const [accentColor, setAccentColor] = useState('#C8F032');
  const [passwordMessage, setPasswordMessage] = useState('');

  // Email change flow (2-step)
  const [emailChangeStep, setEmailChangeStep] = useState<1 | 2>(1);
  const [pendingNewEmail, setPendingNewEmail] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [emailPassword, setEmailPassword] = useState('');
  const [emailOtp, setEmailOtp] = useState('');
  const [emailChanging, setEmailChanging] = useState(false);
  const [emailChangeError, setEmailChangeError] = useState('');

  // Account deletion flow (2-step)
  const [deleteStep, setDeleteStep] = useState<1 | 2>(1);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteOtp, setDeleteOtp] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage('');
    if (!passwordData.current || !passwordData.new || passwordData.new !== passwordData.confirm) {
      setPasswordMessage('Please provide valid password details.');
      return;
    }
    const response = await authApi.changePassword({
      currentPassword: passwordData.current,
      newPassword: passwordData.new,
    });
    setPasswordMessage(response.success ? 'Password updated successfully.' : (response.error?.message || 'Failed to update password.'));
  };

  const startEmailChange = async () => {
    setEmailChangeError('');
    if (!newEmail || !emailPassword) {
      setEmailChangeError('Please enter the new email and your current password.');
      return;
    }

    setEmailChanging(true);
    try {
      await accountApi.initiateEmailChange(newEmail, emailPassword);
      setPendingNewEmail(newEmail);
      setEmailOtp('');
      setEmailChangeStep(2);
      toast.success('OTP sent to your new email.');
    } catch (err: any) {
      setEmailChangeError(err?.message || 'Failed to initiate email change.');
    } finally {
      setEmailChanging(false);
    }
  };

  const confirmEmailChange = async () => {
    setEmailChangeError('');
    if (!pendingNewEmail) {
      setEmailChangeError('Missing email context. Please restart the flow.');
      return;
    }
    if (!emailOtp || emailOtp.replace(/\D/g, '').length !== 6) {
      setEmailChangeError('Please enter the 6-digit OTP.');
      return;
    }

    setEmailChanging(true);
    try {
      await accountApi.confirmEmailChange(pendingNewEmail, emailOtp);
      toast.success('Email updated successfully.');
      await refreshUser();
      setEmailChangeStep(1);
      setPendingNewEmail('');
      setNewEmail('');
      setEmailPassword('');
      setEmailOtp('');
    } catch (err: any) {
      setEmailChangeError(err?.message || 'Failed to confirm email change.');
    } finally {
      setEmailChanging(false);
    }
  };

  const startAccountDeletion = async () => {
    setDeleteError('');
    if (!deletePassword) {
      setDeleteError('Please enter your password to start deletion.');
      return;
    }

    setDeleting(true);
    try {
      await accountApi.initiateAccountDeletion(deletePassword);
      setDeleteOtp('');
      setDeleteStep(2);
      toast.success('OTP sent to your email.');
    } catch (err: any) {
      setDeleteError(err?.message || 'Failed to initiate account deletion.');
    } finally {
      setDeleting(false);
    }
  };

  const confirmAccountDeletion = async () => {
    setDeleteError('');
    if (!deletePassword) {
      setDeleteError('Missing password. Please restart.');
      return;
    }
    if (!deleteOtp || deleteOtp.replace(/\D/g, '').length !== 6) {
      setDeleteError('Please enter the 6-digit OTP.');
      return;
    }

    setDeleting(true);
    try {
      await accountApi.confirmAccountDeletion(deletePassword, deleteOtp);
      toast.success('Account deleted successfully.');
      await logout({ silent: true });
      navigate('/account-deleted');
    } catch (err: any) {
      setDeleteError(err?.message || 'Failed to confirm account deletion.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="dashboard-wrapper">
      <main className="settings-page">
            <div className="page-header">
              <h1 className="page-title">Settings</h1>
              <p className="page-subtitle">Manage your security, notifications, and preferences</p>
            </div>

            {/* Tab Switcher */}
            <div className="tab-switcher">
              <button
                className={`tab-button ${activeTab === 'security' ? 'active' : ''}`}
                onClick={() => setActiveTab('security')}
              >
                Security
              </button>
              <button
                className={`tab-button ${activeTab === 'notifications' ? 'active' : ''}`}
                onClick={() => setActiveTab('notifications')}
              >
                Notifications
              </button>
              <button
                className={`tab-button ${activeTab === 'appearance' ? 'active' : ''}`}
                onClick={() => setActiveTab('appearance')}
              >
                Appearance
              </button>
              <button
                className={`tab-button ${activeTab === 'account' ? 'active' : ''}`}
                onClick={() => setActiveTab('account')}
              >
                Account
              </button>
            </div>

            {/* Content based on active tab */}
            <div className="settings-card">
              {activeTab === 'security' && (
                <>
                  <h3 className="settings-card-title">Security</h3>

                  {/* Change Password Form */}
                  <form onSubmit={handlePasswordSubmit} className="password-form">
                    <h4 className="section-subtitle">Change Password</h4>
                    <div className="form-group">
                      <label htmlFor="current">Current Password</label>
                      <input
                        type="password"
                        id="current"
                        name="current"
                        value={passwordData.current}
                        onChange={handlePasswordChange}
                        placeholder="Enter current password"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="new">New Password</label>
                      <input
                        type="password"
                        id="new"
                        name="new"
                        value={passwordData.new}
                        onChange={handlePasswordChange}
                        placeholder="Enter new password"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="confirm">Confirm New Password</label>
                      <input
                        type="password"
                        id="confirm"
                        name="confirm"
                        value={passwordData.confirm}
                        onChange={handlePasswordChange}
                        placeholder="Confirm new password"
                      />
                    </div>
                    <button type="submit" className="btn-primary">Update Password</button>
                    {passwordMessage && <p>{passwordMessage}</p>}
                  </form>

                  {/* Two-Factor Authentication */}
                  <div className="settings-item">
                    <div className="item-info">
                      <span className="item-label">Two-Factor Authentication</span>
                      <span className="item-description">Add an extra layer of security to your account</span>
                    </div>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={twoFactor}
                        onChange={(e) => setTwoFactor(e.target.checked)}
                      />
                      <span className="slider round"></span>
                    </label>
                  </div>

                  {/* Active Sessions */}
                  <div className="settings-item">
                    <div className="item-info">
                      <span className="item-label">Active Sessions</span>
                      <span className="item-description">Manage devices where you're logged in</span>
                    </div>
                    <button className="action-btn">View</button>
                  </div>
                </>
              )}

              {activeTab === 'notifications' && (
                <>
                  <h3 className="settings-card-title">Notifications</h3>

                  <div className="settings-item">
                    <div className="item-info">
                      <span className="item-label">Email Notifications</span>
                      <span className="item-description">Receive transaction alerts and updates</span>
                    </div>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={emailNotifications}
                        onChange={(e) => setEmailNotifications(e.target.checked)}
                      />
                      <span className="slider round"></span>
                    </label>
                  </div>

                  <div className="settings-item">
                    <div className="item-info">
                      <span className="item-label">Push Notifications</span>
                      <span className="item-description">Real-time alerts in your browser</span>
                    </div>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={pushNotifications}
                        onChange={(e) => setPushNotifications(e.target.checked)}
                      />
                      <span className="slider round"></span>
                    </label>
                  </div>

                  <div className="settings-item">
                    <div className="item-info">
                      <span className="item-label">Marketing Emails</span>
                      <span className="item-description">Promotions and product updates</span>
                    </div>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={marketingEmails}
                        onChange={(e) => setMarketingEmails(e.target.checked)}
                      />
                      <span className="slider round"></span>
                    </label>
                  </div>
                </>
              )}

              {activeTab === 'appearance' && (
                <>
                  <h3 className="settings-card-title">Appearance</h3>

                  <div className="settings-item">
                    <div className="item-info">
                      <span className="item-label">Theme</span>
                      <span className="item-description">Choose your preferred color scheme</span>
                    </div>
                    <div className="theme-selector">
                      <button
                        className={`theme-btn ${theme === 'light' ? 'active' : ''}`}
                        onClick={() => setTheme('light')}
                      >
                        Light
                      </button>
                      <button
                        className={`theme-btn ${theme === 'dark' ? 'active' : ''}`}
                        onClick={() => setTheme('dark')}
                      >
                        Dark
                      </button>
                      <button
                        className={`theme-btn ${theme === 'system' ? 'active' : ''}`}
                        onClick={() => setTheme('system')}
                      >
                        System
                      </button>
                    </div>
                  </div>

                  <div className="settings-item">
                    <div className="item-info">
                      <span className="item-label">Accent Color</span>
                      <span className="item-description">Customize the highlight color</span>
                    </div>
                    <div className="color-picker">
                      <input
                        type="color"
                        value={accentColor}
                        onChange={(e) => setAccentColor(e.target.value)}
                      />
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'account' && (
                <>
                  <h3 className="settings-card-title">Account Settings</h3>

                  <div className="section-subtitle" style={{ marginTop: 10 }}>Email Change</div>
                  <div className="settings-item" style={{ border: 'none', padding: 0 }}>
                    <div style={{ width: '100%', paddingTop: 6 }}>
                      {emailChangeStep === 1 && (
                        <div>
                          <div className="form-group">
                            <label>New Email</label>
                            <input
                              type="email"
                              value={newEmail}
                              onChange={(e) => setNewEmail(e.target.value)}
                              placeholder="new@example.com"
                            />
                          </div>
                          <div className="form-group">
                            <label>Current Password</label>
                            <input
                              type="password"
                              value={emailPassword}
                              onChange={(e) => setEmailPassword(e.target.value)}
                              placeholder="Enter your password"
                            />
                          </div>
                          {emailChangeError && (
                            <div style={{ marginTop: 10, padding: '10px 12px', borderRadius: 16, background: '#fee2e2', border: '1px solid #fecaca', color: '#991b1b', fontWeight: 600 }}>
                              {emailChangeError}
                            </div>
                          )}
                          <button className="btn-primary" type="button" onClick={() => void startEmailChange()} disabled={emailChanging}>
                            {emailChanging ? 'Sending OTP...' : 'Continue'}
                          </button>
                        </div>
                      )}

                      {emailChangeStep === 2 && (
                        <div>
                          <div style={{ color: '#6b7280', fontSize: 14, marginBottom: 10 }}>
                            Enter the OTP sent to <strong>{pendingNewEmail}</strong>.
                          </div>
                          <div className="form-group">
                            <label>OTP</label>
                            <input
                              type="text"
                              inputMode="numeric"
                              value={emailOtp}
                              onChange={(e) => setEmailOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                              placeholder="Enter 6-digit OTP"
                            />
                          </div>
                          {emailChangeError && (
                            <div style={{ marginTop: 10, padding: '10px 12px', borderRadius: 16, background: '#fee2e2', border: '1px solid #fecaca', color: '#991b1b', fontWeight: 600 }}>
                              {emailChangeError}
                            </div>
                          )}
                          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                            <button
                              type="button"
                              className="action-btn"
                              disabled={emailChanging}
                              onClick={() => {
                                setEmailChangeStep(1);
                                setPendingNewEmail('');
                                setEmailOtp('');
                                setEmailChangeError('');
                              }}
                            >
                              Back
                            </button>
                            <button className="btn-primary" type="button" onClick={() => void confirmEmailChange()} disabled={emailChanging}>
                              {emailChanging ? 'Confirming...' : 'Confirm Email'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="section-subtitle" style={{ marginTop: 26 }}>Danger Zone</div>
                  <div style={{ paddingTop: 6 }}>
                    {deleteStep === 1 && (
                      <div>
                        <div style={{ fontWeight: 900, color: '#dc2626', marginBottom: 10 }}>Delete account</div>
                        <div style={{ color: '#6b7280', fontSize: 13, marginBottom: 14, lineHeight: 1.5 }}>
                          This will permanently delete your account. Funds and balances may be impacted.
                        </div>
                        <div className="form-group">
                          <label>Confirm with Password</label>
                          <input
                            type="password"
                            value={deletePassword}
                            onChange={(e) => setDeletePassword(e.target.value)}
                            placeholder="Enter your password"
                          />
                        </div>
                        {deleteError && (
                          <div style={{ marginTop: 10, padding: '10px 12px', borderRadius: 16, background: '#fee2e2', border: '1px solid #fecaca', color: '#991b1b', fontWeight: 600 }}>
                            {deleteError}
                          </div>
                        )}
                        <button className="btn-primary" type="button" onClick={() => void startAccountDeletion()} disabled={deleting}>
                          {deleting ? 'Sending OTP...' : 'Start deletion'}
                        </button>
                      </div>
                    )}

                    {deleteStep === 2 && (
                      <div>
                        <div style={{ fontWeight: 900, color: '#dc2626', marginBottom: 10 }}>Confirm OTP</div>
                        <div style={{ color: '#6b7280', fontSize: 13, marginBottom: 14 }}>
                          Enter the OTP sent to your email to confirm deletion.
                        </div>
                        <div className="form-group">
                          <label>OTP</label>
                          <input
                            type="text"
                            inputMode="numeric"
                            value={deleteOtp}
                            onChange={(e) => setDeleteOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            placeholder="Enter 6-digit OTP"
                          />
                        </div>
                        {deleteError && (
                          <div style={{ marginTop: 10, padding: '10px 12px', borderRadius: 16, background: '#fee2e2', border: '1px solid #fecaca', color: '#991b1b', fontWeight: 600 }}>
                            {deleteError}
                          </div>
                        )}
                        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                          <button
                            type="button"
                            className="action-btn"
                            disabled={deleting}
                            onClick={() => {
                              setDeleteStep(1);
                              setDeleteOtp('');
                              setDeleteError('');
                            }}
                          >
                            Back
                          </button>
                          <button className="btn-primary" type="button" onClick={() => void confirmAccountDeletion()} disabled={deleting}>
                            {deleting ? 'Deleting...' : 'Confirm deletion'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
      </main>
    </div>
  );
};

export default SettingsPage;