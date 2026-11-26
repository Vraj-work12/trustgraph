import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar, AppShell } from './components/Layout';
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute';

import { LandingPage }          from './pages/LandingPage';
import { RegisterPage }         from './pages/RegisterPage';
import { LoginPage }            from './pages/LoginPage';
import { ForgotPasswordPage }   from './pages/ForgotPasswordPage';
import { AnalyzePage }          from './pages/AnalyzePage';
import { VerifyRecruiterPage }  from './pages/VerifyRecruiterPage';
import { OfferLetterPage }      from './pages/OfferLetterPage';
import { ReportPage }           from './pages/ReportPage';
import { CommunityReportsPage } from './pages/CommunityReportsPage';
import { DashboardPage }        from './pages/DashboardPage';
import { ProfilePage }          from './pages/ProfilePage';
import { AdminPanel }           from './pages/AdminPanel';
import { AnalysisDetailPage }   from './pages/AnalysisDetailPage';
import { Trusty }               from './components/Trusty';
import { AboutPage }            from './pages/AboutPage';
import { DocumentationPage }    from './pages/DocumentationPage';
import { ChangelogPage }        from './pages/ChangelogPage';
import { ContactPage }          from './pages/ContactPage';
import { PrivacyPolicyPage }    from './pages/PrivacyPolicyPage';
import { TermsOfServicePage }   from './pages/TermsOfServicePage';
import { SecurityPage }         from './pages/SecurityPage';
import { GDPRPage }             from './pages/GDPRPage';

import './styles/global.css';

const AuthedPage = ({ children }) => (
  <ProtectedRoute>
    <AppShell>{children}</AppShell>
  </ProtectedRoute>
);

const AdminPage = ({ children }) => (
  <AdminRoute>
    <AppShell>{children}</AppShell>
  </AdminRoute>
);

export const App = () => (
  <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
    <AuthProvider>
      <Navbar />
      <Routes>
        {/* Public */}
        <Route path="/"                  element={<LandingPage />} />
        <Route path="/login"             element={<LoginPage />} />
        <Route path="/register"          element={<RegisterPage />} />
        <Route path="/forgot-password"   element={<ForgotPasswordPage />} />
        <Route path="/community-reports" element={<CommunityReportsPage />} />
        <Route path="/about"            element={<AboutPage />} />
        <Route path="/documentation"    element={<DocumentationPage />} />
        <Route path="/changelog"        element={<ChangelogPage />} />
        <Route path="/contact"          element={<ContactPage />} />
        <Route path="/privacy-policy"   element={<PrivacyPolicyPage />} />
        <Route path="/terms-of-service" element={<TermsOfServicePage />} />
        <Route path="/security"         element={<SecurityPage />} />
        <Route path="/gdpr"             element={<GDPRPage />} />

        {/* Authenticated — with sidebar */}
        <Route path="/analyze"          element={<AuthedPage><AnalyzePage /></AuthedPage>} />
        <Route path="/verify-recruiter" element={<AuthedPage><VerifyRecruiterPage /></AuthedPage>} />
        <Route path="/offer-letter"     element={<AuthedPage><OfferLetterPage /></AuthedPage>} />
        <Route path="/report"           element={<AuthedPage><ReportPage /></AuthedPage>} />
        <Route path="/dashboard"        element={<AuthedPage><DashboardPage /></AuthedPage>} />
        <Route path="/profile"          element={<AuthedPage><ProfilePage /></AuthedPage>} />

        {/* Admin */}
        <Route path="/analysis/:id"  element={<AuthedPage><AnalysisDetailPage /></AuthedPage>} />

        {/* Admin */}
        <Route path="/admin" element={<AdminPage><AdminPanel /></AdminPage>} />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <Trusty />
    </AuthProvider>
  </Router>
);

export default App;
