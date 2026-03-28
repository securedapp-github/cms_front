import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Auth Components and Pages
import { ProtectedRoute, OnboardingRoute, PublicRoute } from './components/auth/RouteGuards';
import DashboardLayout from './layouts/DashboardLayout';
import Login from './pages/Login';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import Tenant from './pages/Tenant';
import Consents from './pages/Consents';
import Purposes from './pages/Purposes';
import PolicyVersions from './pages/PolicyVersions';
import AuditLogs from './pages/AuditLogs';
import APIKeys from './pages/APIKeys';
import Webhooks from './pages/Webhooks';
import DSRRequests from './pages/DSRRequests';
import Apps from './pages/apps';
import DataCatalog from './pages/DataCatalog';
import { Toaster } from 'react-hot-toast';

import RedirectConsent from './pages/consent/RedirectConsent';
import ConsentResult from './pages/consent/ConsentResult';

function App() {
  return (
    <>
      <Toaster position="top-right" />
      <BrowserRouter>
        <Routes>
          {/* Consent Flow Pages */}
          <Route path="/consent/redirect" element={<RedirectConsent />} />
          <Route path="/consent/result" element={<ConsentResult />} />

          {/* Auth routes (Only unauthenticated users) */}
          <Route element={<PublicRoute />}>
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Navigate to="/" replace />} />
          </Route>

          {/* Onboarding route (Only users needing onboarding) */}
          <Route element={<OnboardingRoute />}>
            <Route path="/onboarding" element={<Onboarding />} />
          </Route>

          {/* Protected SaaS routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/consents" element={<Consents />} />
              <Route path="/purposes" element={<Purposes />} />
              <Route path="/policy-versions" element={<PolicyVersions />} />
              <Route path="/clients" element={<Clients />} />
              <Route path="/audit-logs" element={<AuditLogs />} />
              <Route path="/api-keys" element={<APIKeys />} />
              <Route path="/tenant" element={<Tenant />} />
              <Route path="/webhooks" element={<Webhooks />} />
              <Route path="/dsr" element={<DSRRequests />} />
              <Route path="/apps" element={<Apps />} />
              <Route path="/data-catalog" element={<DataCatalog />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}


export default App;
