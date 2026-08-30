import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Layout/Navbar.jsx';
import ProtectedRoute from './components/Layout/ProtectedRoute.jsx';
import LandingPage from './pages/index.jsx';
import LoginPage from './pages/login.jsx';
import RegisterPage from './pages/register.jsx';
import ChatPage from './pages/chat/index.jsx';
import AdminDocumentsPage from './pages/admin/documents.jsx';
import AdminAnalyticsPage from './pages/admin/analytics.jsx';
import { useAuthStore } from './store/authStore.js';
import { useThemeStore } from './store/themeStore.js';

export default function App() {
  const { fetchMe, token } = useAuthStore();
  const { initTheme } = useThemeStore();

  useEffect(() => {
    initTheme();
  }, [initTheme]);

  useEffect(() => {
    if (token) {
      fetchMe();
    }
  }, [token, fetchMe]);

  return (
    <Router>
      <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex flex-col font-sans selection:bg-sky-500 selection:text-white">
        <Navbar />
        <div className="flex-1">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected Student Chat Routes */}
            <Route
              path="/chat"
              element={
                <ProtectedRoute>
                  <ChatPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/chat/:id"
              element={
                <ProtectedRoute>
                  <ChatPage />
                </ProtectedRoute>
              }
            />

            {/* Protected Admin Routes */}
            <Route
              path="/admin/documents"
              element={
                <ProtectedRoute adminOnly={true}>
                  <AdminDocumentsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/analytics"
              element={
                <ProtectedRoute adminOnly={true}>
                  <AdminAnalyticsPage />
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}
