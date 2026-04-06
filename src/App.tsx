import React, { Suspense, lazy } from 'react';
import { NotificationProvider } from './context/NotificationContext';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AppLoader from './components/AppLoader';
import AdminProtectedRoute from './context/AdminProtectedRoute';
import UserProtectedRoute from './context/UserProtectedRoute';
import DashboardLayout from './components/DashboardLayout';
import { useAuth } from './context/AuthContext';
import TawkToWidget from './components/TawkToWidget';
import { useAdminAuth } from './context/AdminAuthContext';
import VerifyOtpPage from './pages/VerifyOtpPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

/* ── Public Pages ── */
const HomePage        = lazy(() => import('./pages/HomePage').then(m => ({ default: m.HomePage })));
const AboutPage       = lazy(() => import('./pages/AboutPage').then(m => ({ default: m.AboutPage })));
const FeaturesPage    = lazy(() => import('./pages/FeaturesPage').then(m => ({ default: m.FeaturesPage })));
const FaqPage         = lazy(() => import('./pages/FaqPage').then(m => ({ default: m.FaqPage })));
const ContactPage     = lazy(() => import('./pages/ContactPage').then(m => ({ default: m.ContactPage })));
const LoginPage       = lazy(() => import('./pages/LoginPage'));
const SignupPage      = lazy(() => import('./pages/SignupPage'));
const AccountDeletedPage = lazy(() => import('./pages/AccountDeletedPage'));

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
const WalletsPage     = lazy(() => import('./pages/dashboard/WalletsPage'));
const WalletDetailPage = lazy(() => import('./pages/dashboard/WalletDetailPage'));
const LedgerPage      = lazy(() => import('./pages/dashboard/LedgerPage'));
const DepositsPage    = lazy(() => import('./pages/dashboard/DepositsPage'));
const DepositDetailPage = lazy(() => import('./pages/dashboard/DepositDetailPage'));
const DepositPage     = lazy(() => import('./pages/dashboard/DepositPage'));
const DepositPendingPage = lazy(() => import('./pages/dashboard/DepositPendingPage'));
const WithdrawalsPage = lazy(() => import('./pages/dashboard/WithdrawalsPage'));
const WithdrawalDetailPage = lazy(() => import('./pages/dashboard/WithdrawalDetailPage'));
const BeneficiariesPage = lazy(() => import('./pages/dashboard/BeneficiariesPage'));
const ConversionsPage = lazy(() => import('./pages/dashboard/ConversionsPage'));
const TradesPage      = lazy(() => import('./pages/dashboard/TradesPage'));
const MyBidsPage = lazy(() => import("./pages/dashboard/MyBidsPage"));
const TradeDetailPage = lazy(() => import('./pages/dashboard/TradeDetailPage'));
const DisputesPage    = lazy(() => import('./pages/dashboard/DisputesPage'));
const NotificationsPage = lazy(() => import('./pages/dashboard/NotificationsPage'));
const KycPage         = lazy(() => import('./pages/dashboard/KycPage'));
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'));
const AdminUsersPage = lazy(() => import('./pages/admin/AdminUsersPage'));
const AdminUserDetailsPage = lazy(() => import('./pages/admin/AdminUserDetailsPage'));
const AdminKycPage = lazy(() => import('./pages/admin/AdminKycPage'));
const AdminDepositsPage = lazy(() => import('./pages/admin/AdminDepositsPage'));
const AdminWithdrawalsPage = lazy(() => import('./pages/admin/AdminWithdrawalsPage'));
const AdminDisputesPage = lazy(() => import('./pages/admin/AdminDisputesPage'));
// const AdminAnalyticsPage = lazy(() => import('./pages/admin/AdminAnalyticsPage'));
const AdminMetricsPage = lazy(() => import('./pages/admin/AdminMetricsPage'));
const AdminTransactionsPage = lazy(
  () => import('./pages/admin/AdminTransactionsPage'),
);
const AdminAdminsPage = lazy(() => import('./pages/admin/AdminAdminsPage'));
const AdminLogsPage = lazy(() => import('./pages/admin/AdminLogsPage'));
const AdminProfilePage = lazy(() => import('./pages/admin/AdminProfilePage'));
const TransactionPinPage = lazy(() => import('./pages/dashboard/TransactionPinPage'));

const AdminLoginPage = lazy(() => import('./pages/admin/AdminLoginPage'));
const AdminVerifyOtpPage = lazy(() => import('./pages/admin/AdminVerifyOtpPage'));
const AdminAcceptInvitePage = lazy(
  () => import("./pages/admin/AdminAcceptInvitePage"),
);

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { isAdminAuthenticated, isAdminLoading } = useAdminAuth();
  if (isLoading) return <AppLoader />;
  if (!isAuthenticated) return <>{children}</>;

  if (isAdminLoading) return <AppLoader />;
  if (isAdminAuthenticated) return <Navigate to="/dashboard/admin" replace />;

  const role = String(user?.role || '').toLowerCase();
  return <Navigate to={role === 'admin' ? '/dashboard/admin' : '/dashboard'} replace />;
};

const AdminPublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { isAdminAuthenticated, isAdminLoading } = useAdminAuth();

  if (isLoading || isAdminLoading) return <AppLoader />;
  if (isAdminAuthenticated) return <Navigate to="/dashboard/admin" replace />;

  return <>{children}</>;
};

function App() {
  return (
    <NotificationProvider>
      <TawkToWidget />
      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
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
          <Route path="/verify-email" element={<PublicRoute><VerifyEmailPage /></PublicRoute>} />
          <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />
          <Route path="/reset-password"  element={<PublicRoute><ResetPasswordPage /></PublicRoute>} />
          <Route path="/account-deleted" element={<PublicRoute><AccountDeletedPage /></PublicRoute>} />

          {/* Admin auth routes */}
          <Route path="/admin/login" element={<AdminPublicRoute><AdminLoginPage /></AdminPublicRoute>} />
          <Route path="/admin/verify-otp" element={<AdminPublicRoute><AdminVerifyOtpPage /></AdminPublicRoute>} />
          <Route path="/admin/accept-invite" element={<AdminPublicRoute><AdminAcceptInvitePage /></AdminPublicRoute>} />

          <Route path="/p2p"       element={<SabitMarketPage />}  />
          <Route path="/business"  element={<SaboBusinessPage />} />

          {/* Dashboard Routes (Protected) */}
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<UserProtectedRoute><DashboardPage /></UserProtectedRoute>} />
            <Route path="active-sabits"   element={<UserProtectedRoute><ActiveSabitPage /></UserProtectedRoute>} />
            <Route path="my-sabits"       element={<UserProtectedRoute><MySabitPage /></UserProtectedRoute>} />
            <Route path="history"         element={<UserProtectedRoute><HistoryPage /></UserProtectedRoute>} />
            <Route path="chat"            element={<UserProtectedRoute><ChatPage /></UserProtectedRoute>} />
            <Route path="profile"         element={<UserProtectedRoute><ProfilePage /></UserProtectedRoute>} />
            <Route path="settings"        element={<UserProtectedRoute><SettingsPage /></UserProtectedRoute>} />
            <Route path="transaction-pin" element={<UserProtectedRoute><TransactionPinPage /></UserProtectedRoute>} />
            <Route path="transaction/:id" element={<UserProtectedRoute><TransactionPage /></UserProtectedRoute>} />
            <Route path="wallets"         element={<UserProtectedRoute><WalletsPage /></UserProtectedRoute>} />
            <Route path="wallets/:currency" element={<UserProtectedRoute><WalletDetailPage /></UserProtectedRoute>} />
            <Route path="ledger"          element={<UserProtectedRoute><LedgerPage /></UserProtectedRoute>} />
            <Route path="deposits"        element={<UserProtectedRoute><DepositsPage /></UserProtectedRoute>} />
            <Route path="deposits/callback" element={<UserProtectedRoute><DepositDetailPage /></UserProtectedRoute>} />
            <Route path="deposits/:id"    element={<UserProtectedRoute><DepositDetailPage /></UserProtectedRoute>} />
            <Route path="deposit"         element={<UserProtectedRoute><DepositPage /></UserProtectedRoute>} />
            <Route path="deposit-pending" element={<UserProtectedRoute><DepositPendingPage /></UserProtectedRoute>} />
            <Route path="withdrawals"     element={<UserProtectedRoute><WithdrawalsPage /></UserProtectedRoute>} />
            <Route path="withdrawals/:id" element={<UserProtectedRoute><WithdrawalDetailPage /></UserProtectedRoute>} />
            <Route path="beneficiaries"   element={<UserProtectedRoute><BeneficiariesPage /></UserProtectedRoute>} />
            <Route path="conversions"     element={<UserProtectedRoute><ConversionsPage /></UserProtectedRoute>} />
            <Route path="trades"          element={<UserProtectedRoute><TradesPage /></UserProtectedRoute>} />
            <Route path="bids"            element={<UserProtectedRoute><MyBidsPage /></UserProtectedRoute>} />
            <Route path="trade/:id"       element={<UserProtectedRoute><TradeDetailPage /></UserProtectedRoute>} />
            <Route path="disputes"        element={<UserProtectedRoute><DisputesPage /></UserProtectedRoute>} />
            <Route path="notifications"   element={<UserProtectedRoute><NotificationsPage /></UserProtectedRoute>} />
            <Route path="kyc"             element={<UserProtectedRoute><KycPage /></UserProtectedRoute>} />
            <Route path="admin" element={<AdminProtectedRoute><AdminDashboardPage /></AdminProtectedRoute>} />
            <Route path="admin/users" element={<AdminProtectedRoute><AdminUsersPage /></AdminProtectedRoute>} />
            <Route path="admin/users/:id" element={<AdminProtectedRoute><AdminUserDetailsPage /></AdminProtectedRoute>} />
            <Route path="admin/kyc" element={<AdminProtectedRoute><AdminKycPage /></AdminProtectedRoute>} />
            <Route path="admin/deposits" element={<AdminProtectedRoute><AdminDepositsPage /></AdminProtectedRoute>} />
            <Route path="admin/withdrawals" element={<AdminProtectedRoute><AdminWithdrawalsPage /></AdminProtectedRoute>} />
            <Route path="admin/disputes" element={<AdminProtectedRoute><AdminDisputesPage /></AdminProtectedRoute>} />
            <Route path="admin/transactions" element={<AdminProtectedRoute><AdminTransactionsPage /></AdminProtectedRoute>} />
            {/* <Route path="admin/analytics" element={<AdminProtectedRoute><AdminAnalyticsPage /></AdminProtectedRoute>} /> */}
            <Route path="admin/analytics/metrics" element={<AdminProtectedRoute><AdminMetricsPage /></AdminProtectedRoute>} />
            <Route path="admin/profile" element={<AdminProtectedRoute><AdminProfilePage /></AdminProtectedRoute>} />
            <Route path="admin/admins" element={<AdminProtectedRoute allowedRoles={["super_admin"]}><AdminAdminsPage /></AdminProtectedRoute>} />
            <Route path="admin/logs" element={<AdminProtectedRoute allowedRoles={["super_admin"]}><AdminLogsPage /></AdminProtectedRoute>} />
          </Route>
          </Routes>
        </Suspense>
      </Router>
    </NotificationProvider>
  );
}

export default App;