import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import Logo from '../components/Logo';

const Spinner = () => (
  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
);

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [errors, setErrors]     = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading]   = useState(false);

  const validate = () => {
    const e = {};
    if (!formData.username.trim()) e.username = 'Username or email is required';
    if (!formData.password.trim()) e.password = 'Password is required';
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(p => ({ ...p, [name]: value }));
    if (errors[name]) setErrors(p => ({ ...p, [name]: '' }));
    setApiError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const ve = validate();
    if (Object.keys(ve).length) { setErrors(ve); return; }
    setLoading(true);
    try {
      await login(formData);
      navigate('/profile');
    } catch (err) {
      setApiError(err.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-app-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="chat-card p-8">
          {/* Header with Logo */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-brand-soft rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-soft border border-sky-100">
              <Logo className="w-10 h-10" />
            </div>
            <h1 className="text-2xl font-bold text-msg-charcoal">
              Welcome to <span className="text-brand">NexTalk</span>
            </h1>
            <p className="text-textSecondary text-sm mt-1">
              Connect instantly. Talk seamlessly.
            </p>
          </div>

          {/* API Error */}
          {apiError && (
            <div className="mb-5 px-4 py-3 bg-red-50 border border-red-100 rounded-btn">
              <p className="text-red-500 text-sm">{apiError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-msg-charcoal mb-1.5">
                Username or Email
              </label>
              <input
                type="text" name="username"
                value={formData.username} onChange={handleChange}
                className={`chat-input ${errors.username ? 'border-red-300 bg-red-50' : ''}`}
                placeholder="Enter your username or email"
              />
              {errors.username && <p className="mt-1 text-xs text-red-500">{errors.username}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-msg-charcoal mb-1.5">
                Password
              </label>
              <input
                type="password" name="password"
                value={formData.password} onChange={handleChange}
                className={`chat-input ${errors.password ? 'border-red-300 bg-red-50' : ''}`}
                placeholder="Enter your password"
              />
              {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
            </div>

            <button type="submit" disabled={loading}
              className="btn-primary w-full flex items-center justify-center space-x-2 mt-2">
              {loading ? <><Spinner /><span>Signing in…</span></> : <span>Sign In</span>}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-textSecondary">
            Don't have an account?{' '}
            <Link to="/register" className="text-brand font-semibold hover:text-brand-hover">
              Sign up
            </Link>
          </p>
        </div>

        {/* Tagline footer */}
        <p className="text-center text-xs text-textSecondary mt-6">
          NexTalk · Connect instantly. Talk seamlessly.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
