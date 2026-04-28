import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { adminApi } from '../../lib/api';
import { Header } from '../../components/Header';
import { toast } from 'react-toastify';
import { Eye, EyeOff, Lock, User, Mail, CheckCircle, Phone } from 'lucide-react';
import '../../assets/css/AuthPage.css';
import maskImage from "../../assets/images/Mask group.png";

interface AdminSetupInviteInputs {
  name: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

const AdminAcceptInvitePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  
  const [isVerifying, setIsVerifying] = useState(true);
  const [invitedEmail, setInvitedEmail] = useState('');
  const [error, setError] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<AdminSetupInviteInputs>();
  const password = watch('password');

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setError('Invalid invite link. Missing token.');
        setIsVerifying(false);
        return;
      }

      try {
        const res = await adminApi.acceptInvite(token);
        if (res.success) {
          setInvitedEmail((res.data as { email?: string })?.email || '');
        } else {
          setError(res.error?.message || 'This invitation is invalid or has expired.');
        }
      } catch (err: any) {
        setError(err?.message || 'An unexpected error occurred while verifying your invitation.');
      } finally {
        setIsVerifying(false);
      }
    };

    void verifyToken();
  }, [token]);

  const onSubmit = async (data: AdminSetupInviteInputs) => {
    if (!token) return;
    
    try {
      const res = await adminApi.setupInvite({
        token,
        name: data.name,
        phone: data.phone,
        password: data.password
      });

      if (res.success) {
        toast.success('Account setup successful! You can now log in.');
        navigate('/admin/login');
      } else {
        toast.error(res.error?.message || 'Failed to complete setup.');
      }
    } catch (err: any) {
      toast.error(err?.message || 'An unexpected error occurred.');
    }
  };

  if (isVerifying) {
    return (
      <>
        <Header />
        <div className="auth-page">
          <div className="auth-main" style={{ justifyContent: 'center' }}>
            <div className="auth-form-section" style={{ width: '100%', maxWidth: 450 }}>
              <div className="auth-form-wrapper" style={{ textAlign: 'center' }}>
                <div className="spinner" style={{ margin: '0 auto 20px' }} />
                <p>Verifying your invitation...</p>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="auth-page">
        <div className="auth-main">
          <div className="auth-image-section">
            <img src={maskImage} alt="Background mask" className="auth-mask-bg" />
            <svg 
              viewBox="0 0 400 400" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg" 
              className="auth-image"
            >
              {/* Main Dashboard Panel */}
              <rect x="40" y="80" width="320" height="220" rx="16" fill="#0A1E28" />
              
              {/* Header Bar */}
              <path d="M40 96 C40 87.1634 47.1634 80 56 80 H344 C352.837 80 360 87.1634 360 96 V120 H40 V96 Z" fill="#112A38" />
              <circle cx="65" cy="100" r="6" fill="#FF5F56" />
              <circle cx="85" cy="100" r="6" fill="#FFBD2E" />
              <circle cx="105" cy="100" r="6" fill="#27C93F" />
              
              {/* Sidebar */}
              <rect x="60" y="140" width="60" height="140" rx="8" fill="#112A38" />
              <rect x="70" y="155" width="40" height="8" rx="4" fill="#C8F032" opacity="0.8" />
              <rect x="70" y="175" width="40" height="8" rx="4" fill="#ffffff" opacity="0.2" />
              <rect x="70" y="195" width="40" height="8" rx="4" fill="#ffffff" opacity="0.2" />
              <rect x="70" y="215" width="40" height="8" rx="4" fill="#ffffff" opacity="0.2" />
              
              {/* Chart Area */}
              <rect x="140" y="140" width="200" height="80" rx="8" fill="#112A38" />
              <path d="M150 200 L180 170 L210 185 L260 150 L320 175" stroke="#C8F032" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="180" cy="170" r="4" fill="#C8F032" />
              <circle cx="210" cy="185" r="4" fill="#C8F032" />
              <circle cx="260" cy="150" r="4" fill="#C8F032" />
              
              {/* Bottom Widgets */}
              <rect x="140" y="230" width="90" height="50" rx="8" fill="#112A38" />
              <rect x="150" y="245" width="40" height="6" rx="3" fill="#ffffff" opacity="0.3" />
              <rect x="150" y="260" width="60" height="6" rx="3" fill="#ffffff" opacity="0.1" />

              <rect x="250" y="230" width="90" height="50" rx="8" fill="#112A38" />
              <rect x="260" y="245" width="50" height="6" rx="3" fill="#ffffff" opacity="0.3" />
              <rect x="260" y="260" width="30" height="6" rx="3" fill="#ffffff" opacity="0.1" />

              {/* Shield / Security Overlay */}
              <g transform="translate(240, 190) scale(1.1)">
                <path d="M50 0 L90 18V45C90 70 72 93 50 100C27 93 10 70 10 45V18L50 0Z" fill="#C8F032" stroke="#0A1E28" strokeWidth="6" strokeLinejoin="round" />
                <path d="M35 48 L45 58 L65 35" stroke="#0A1E28" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
              </g>
            </svg>
          </div>

          <div className="auth-form-section">
            <div className="auth-form-wrapper">
              {error ? (
                <div style={{ textAlign: 'center' }}>
                  <h2 className="auth-title">Invitation Error</h2>
                  <div style={{ color: '#dc2626', background: '#fee2e2', padding: 20, borderRadius: 16, marginBottom: 20 }}>
                    {error}
                  </div>
                  <button className="auth-btn" onClick={() => navigate('/admin/login')}>
                    Go to Admin Login
                  </button>
                </div>
              ) : (
                <>
                  <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{ 
                      background: '#C8F032', 
                      width: '64px', 
                      height: '64px', 
                      borderRadius: '20px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      margin: '0 auto 16px',
                      color: '#0A1E28'
                    }}>
                      <CheckCircle size={32} />
                    </div>
                    <h2 className="auth-title">Complete Your Setup</h2>
                    <p className="auth-subtitle">Set your details to join the administrative team.</p>
                  </div>

                  <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
                    <div className="form-group">
                      <label className="form-label">Email Address</label>
                      <div style={{ position: 'relative' }}>
                        <Mail style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={18} />
                        <input 
                          type="email" 
                          value={invitedEmail} 
                          disabled 
                          className="form-input" 
                          style={{ paddingLeft: '48px', background: '#f8fafc', cursor: 'not-allowed' }}
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Full Name</label>
                      <div style={{ position: 'relative' }}>
                        <User style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={18} />
                        <input
                          type="text"
                          {...register('name', { required: 'Full name is required' })}
                          className={`form-input ${errors.name ? 'error' : ''}`}
                          placeholder="Enter your full name"
                          style={{ paddingLeft: '48px' }}
                        />
                      </div>
                      {errors.name && <span className="error-text">{errors.name.message}</span>}
                    </div>

                    <div className="form-group">
                      <label className="form-label">Phone Number</label>
                      <div style={{ position: 'relative' }}>
                        <Phone style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={18} />
                        <input
                          type="tel"
                          {...register('phone', { 
                            required: 'Phone number is required',
                            pattern: { value: /^\+?[1-9]\d{1,14}$/, message: 'Invalid phone number format' }
                          })}
                          className={`form-input ${errors.phone ? 'error' : ''}`}
                          placeholder="e.g. +2348000000000"
                          style={{ paddingLeft: '48px' }}
                        />
                      </div>
                      {errors.phone && <span className="error-text">{errors.phone.message}</span>}
                    </div>

                    <div className="form-group">
                      <label className="form-label">Password</label>
                      <div style={{ position: 'relative' }}>
                        <Lock style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={18} />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          {...register('password', { 
                            required: 'Password is required',
                            minLength: { value: 8, message: 'Password must be at least 8 characters' }
                          })}
                          className={`form-input ${errors.password ? 'error' : ''}`}
                          placeholder="Create a password"
                          style={{ paddingLeft: '48px' }}
                        />
                        <button 
                          type="button" 
                          onClick={() => setShowPassword(!showPassword)}
                          style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8' }}
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                      {errors.password && <span className="error-text">{errors.password.message}</span>}
                    </div>

                    <div className="form-group">
                      <label className="form-label">Confirm Password</label>
                      <div style={{ position: 'relative' }}>
                        <Lock style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={18} />
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          {...register('confirmPassword', { 
                            required: 'Please confirm your password',
                            validate: value => value === password || 'Passwords do not match'
                          })}
                          className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                          placeholder="Confirm your password"
                          style={{ paddingLeft: '48px' }}
                        />
                        <button 
                          type="button" 
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8' }}
                        >
                          {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                      {errors.confirmPassword && <span className="error-text">{errors.confirmPassword.message}</span>}
                    </div>

                    <button 
                      type="submit" 
                      className="auth-btn" 
                      disabled={isSubmitting}
                      style={{ marginTop: '12px' }}
                    >
                      {isSubmitting ? 'Setting up account...' : 'Complete Setup'}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminAcceptInvitePage;