import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import SearchPage from './pages/SearchPage';
import useAuth from './hooks/useAuth';

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Navigate to={isAuthenticated ? '/profile' : '/login'} replace />} />
        <Route path="/login" element={isAuthenticated ? <Navigate to="/profile" replace /> : <LoginPage />} />
        <Route path="/register" element={isAuthenticated ? <Navigate to="/profile" replace /> : <RegisterPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/search" element={<SearchPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
};

export default App;
