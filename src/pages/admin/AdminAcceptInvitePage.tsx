import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { adminApi } from '../../lib/api';
import { Header } from '../../components/Header';
import { toast } from 'react-toastify';
import '../../assets/css/AuthPage.css';

const AdminAcceptInvitePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      setError('Invalid invite link. Missing token.');
      setLoading(false);
      return;
    }

    // const accept = async () => {
    //   try {
    //     const res = await adminApi.acceptInvite(token);
    //     if (res.success) {
    //       toast.success('Invite accepted! You can now log in.');
    //       navigate('/admin/login');
    //     } else {
    //       setError(res.error?.message || 'Failed to accept invite.');
    //     }
    //   } catch (err: any) {
    //     setError(err?.message || 'An unexpected error occurred.');
    //   } finally {
    //     setLoading(false);
    //   }
    // };

    // void accept();
  }, [token, navigate]);

  return (
    <>
      <Header />
      <div className="auth-page">
        <div className="auth-main" style={{ justifyContent: 'center' }}>
          <div className="auth-form-section" style={{ width: '100%', maxWidth: 450 }}>
            <div className="auth-form-wrapper" style={{ textAlign: 'center' }}>
              <h2 className="auth-title">Admin Invite</h2>
              
              {loading && (
                <div style={{ padding: '40px 0' }}>
                  <div className="spinner" style={{ margin: '0 auto 20px' }} />
                  <p>Processing your invitation...</p>
                </div>
              )}

              {error && (
                <div style={{ marginTop: 20 }}>
                  <div style={{ color: '#dc2626', background: '#fee2e2', padding: 20, borderRadius: 16, marginBottom: 20 }}>
                    {error}
                  </div>
                  <button className="auth-btn" onClick={() => navigate('/admin/login')}>
                    Go to Admin Login
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminAcceptInvitePage;