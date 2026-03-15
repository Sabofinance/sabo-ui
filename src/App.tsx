import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import AppLoader from './components/AppLoader';

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
          <Route path="/login"     element={<LoginPage />}        />
          <Route path="/signup"    element={<SignupPage />}        />
          <Route path="/p2p"       element={<SabitMarketPage />}  />
          <Route path="/business"  element={<SaboBusinessPage />} />

          {/* Dashboard Routes */}
          <Route path="/dashboard"                 element={<DashboardPage />}   />
          <Route path="/dashboard/active-sabits"   element={<ActiveSabitPage />} />
          <Route path="/dashboard/my-sabits"       element={<MySabitPage />}     />
          <Route path="/dashboard/history"         element={<HistoryPage />}     />
          <Route path="/dashboard/chat"            element={<ChatPage />}        />
          <Route path="/dashboard/profile"         element={<ProfilePage />}     />
          <Route path="/dashboard/settings"        element={<SettingsPage />}    />
          <Route path="/dashboard/transaction/:id" element={<TransactionPage />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;