import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLoader from '../components/AppLoader';
import { useAuth } from '../context/AuthContext';

const AuthCallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const { handleGoogleCallback } = useAuth();
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const processCallback = async () => {
      const success = await handleGoogleCallback();
      setIsProcessing(false);
      if (success) {
        navigate('/dashboard', { replace: true });
      } else {
        navigate('/login', { replace: true });
      }
    };

    void processCallback();
  }, [handleGoogleCallback, navigate]);

  return <>{isProcessing ? <AppLoader /> : null}</>;
};

export default AuthCallbackPage;
