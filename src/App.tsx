import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AppLoader from './components/AppLoader';
import ProtectedRoute from './context/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';
import { useAuth } from './context/AuthContext';
import VerifyOtpPage from './pages/VerifyOtpPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

/* ── Public Pages ── */
const HomePage        = lazy(() => import('./pages/HomePage').then(m => ({ default: m.HomePage })));
const AboutPage       = lazy(() => import('./pages/AboutPage').then(m => ({ default: m.AboutPage })));
const FeaturesPage    = lazy(() => import('./pages/FeaturesPage').then(m => ({ default: m.FeaturesPage })));
const FaqPage         = lazy(() => import('./pages/FaqPage').then(m => ({ default: m.FaqPage })));
const ContactPage     = lazy(() => import('./pages/ContactPage').then(m => ({ default: m.ContactPage })));
const LoginPage       = lazy(() => import('./pages/LoginPage'));
const SignupPage      = lazy(() => import('./pages/SignupPage'));

/* ── New Public Pages ── */
const SabitMarketPage = lazy(() => import('./pages/SabitMarketPage'));
const SaboBusinessPage= lazy(() => import('./pages/SaboBusinessPage'));

/* ── Dashboard Pages ── */
const DashboardPage   = lazy(() => import('./pages/dashboard/DashboardPage'));
const ActiveSabitPage = lazy(() => import('./pages/dashboard/ActiveSabitPage'));
const MySabitPage     = lazy(() => import('./pages/dashboard/MySabitPage'));
const HistoryPage     = lazy(() => import('./pages/dashboard/HistoryPage'));
const ChatPage        = lazy(() => import('./pages/dashboard/ChatPage'));
const ProfilePage     = lazy(() => import('./pages/dashboard/ProfilePage'));
const SettingsPage    = lazy(() => import('./pages/dashboard/SettingsPage'));
const TransactionPage = lazy(() => import('./pages/dashboard/TransactionPage'));

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <>{children}</>;
};

function App() {
  return (
    <Router>
      <Suspense fallback={<AppLoader />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/"          element={<HomePage />}         />
          <Route path="/about"     element={<AboutPage />}        />
          <Route path="/features"  element={<FeaturesPage />}     />
          <Route path="/faq"       element={<FaqPage />}          />
          <Route path="/contact"   element={<ContactPage />}      />
          <Route path="/login"     element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/signup"    element={<PublicRoute><SignupPage /></PublicRoute>} />
          <Route path="/verify-otp" element={<PublicRoute><VerifyOtpPage /></PublicRoute>} />
          <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />
          <Route path="/reset-password"  element={<PublicRoute><ResetPasswordPage /></PublicRoute>} />
          <Route path="/p2p"       element={<SabitMarketPage />}  />
          <Route path="/business"  element={<SaboBusinessPage />} />

          {/* Dashboard Routes (Protected) */}
          <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route index element={<DashboardPage />} />
            <Route path="active-sabits"   element={<ActiveSabitPage />} />
            <Route path="my-sabits"       element={<MySabitPage />}     />
            <Route path="history"         element={<HistoryPage />}     />
            <Route path="chat"            element={<ChatPage />}        />
            <Route path="profile"         element={<ProfilePage />}     />
            <Route path="settings"        element={<SettingsPage />}    />
            <Route path="transaction/:id" element={<TransactionPage />} />
          </Route>
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;