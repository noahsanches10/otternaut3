import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { Auth } from './pages/Auth';
import { Layout } from './components/layout/Layout';
import { Home } from './pages/Home';
import { Leads } from './pages/Leads';
import { Campaigns } from './pages/Campaigns';
import { Messages } from './pages/Messages';
import { Profile } from './pages/Profile';
import { Integrations } from './pages/Integrations';
import { Customers } from './pages/Customers';

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { session, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

function App() {
  const { session, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/auth" 
          element={session ? <Navigate to="/" replace /> : <Auth />} 
        />
        <Route path="/" element={
          <RequireAuth>
            <Layout />
          </RequireAuth>
        }>
          <Route index element={<Home />} />
          <Route path="leads" element={<Leads />} />
          <Route path="customers" element={<Customers />} />
          <Route path="campaigns" element={<Campaigns />} />
          <Route path="messages" element={<Messages />} />
          <Route path="analytics" element={<div>Analytics Coming Soon</div>} />
          <Route path="profile" element={<Profile />} />
          <Route path="integrations" element={<Integrations />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;