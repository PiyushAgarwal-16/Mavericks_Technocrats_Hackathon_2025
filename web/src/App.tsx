// import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { HomePage } from './pages/HomePage';
import { VerifyPage } from './pages/VerifyPage';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { AdminPage } from './pages/AdminPage';
import { DownloadPage } from './pages/DownloadPage';
import { ComparePage } from './pages/ComparePage';
import { AwarenessPage } from './pages/AwarenessPage';
import { RewardsPage } from './pages/RewardsPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/verify" element={<VerifyPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/download" element={<DownloadPage />} />
          <Route path="/compare" element={<ComparePage />} />
          <Route path="/awareness" element={<AwarenessPage />} />
          <Route path="/rewards" element={<RewardsPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute requireAdmin>
                <AdminPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
