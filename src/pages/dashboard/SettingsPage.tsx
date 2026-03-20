import React, { useState } from 'react';
import type { ChangeEvent } from 'react';
import '../../assets/css/SettingsPage.css';
import authApi from '../../lib/api/auth.api';

const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'security' | 'notifications' | 'appearance'>('security');

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
            </div>
      </main>
    </div>
  );
};

export default SettingsPage;