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

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    username: '', email: '', fullName: '', password: '', confirmPassword: '',
  });
  const [errors, setErrors]     = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading]   = useState(false);

  const validate = () => {
    const e = {};
    if (!formData.username.trim()) e.username = 'Username is required';
    else if (formData.username.length < 3 || formData.username.length > 20)
      e.username = 'Must be 3–20 characters';
    else if (!/^[a-zA-Z0-9_]+$/.test(formData.username))
      e.username = 'Letters, numbers and underscores only';

    if (!formData.email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      e.email = 'Enter a valid email';

    if (!formData.fullName.trim()) e.fullName = 'Full name is required';

    if (!formData.password) e.password = 'Password is required';
    else if (formData.password.length < 6) e.password = 'At least 6 characters';

    if (!formData.confirmPassword) e.confirmPassword = 'Confirm your password';
    else if (formData.password !== formData.confirmPassword)
      e.confirmPassword = 'Passwords do not match';

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
      const { confirmPassword, ...registerData } = formData;
      await register(registerData);
      navigate('/profile');
    } catch (err) {
      const data = err.response?.data;
      if (data && typeof data === 'object' && !data.message) setErrors(data);
      else setApiError(data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const field = (name) =>
    `chat-input ${errors[name] ? 'border-red-300 bg-red-50' : ''}`;

  return (
    <div className="min-h-screen bg-app-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="chat-card p-8">
          {/* Header with Logo */}
          <div className="text-center mb-7">
            <div className="w-16 h-16 bg-brand-soft rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-soft border border-sky-100">
              <Logo className="w-10 h-10" />
            </div>
            <h1 className="text-2xl font-bold text-msg-charcoal">
              Join <span className="text-brand">NexTalk</span>
            </h1>
            <p className="text-textSecondary text-sm mt-1">
              Connect instantly. Talk seamlessly.
            </p>
          </div>

          {apiError && (
            <div className="mb-5 px-4 py-3 bg-red-50 border border-red-100 rounded-btn">
              <p className="text-red-500 text-sm">{apiError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Row: username + fullName */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-msg-charcoal mb-1.5">Username</label>
                <input type="text" name="username" value={formData.username}
                  onChange={handleChange} className={field('username')} placeholder="john_doe" />
                {errors.username && <p className="mt-1 text-xs text-red-500">{errors.username}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-msg-charcoal mb-1.5">Full Name</label>
                <input type="text" name="fullName" value={formData.fullName}
                  onChange={handleChange} className={field('fullName')} placeholder="John Doe" />
                {errors.fullName && <p className="mt-1 text-xs text-red-500">{errors.fullName}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-msg-charcoal mb-1.5">Email</label>
              <input type="email" name="email" value={formData.email}
                onChange={handleChange} className={field('email')} placeholder="john@example.com" />
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-msg-charcoal mb-1.5">Password</label>
              <input type="password" name="password" value={formData.password}
                onChange={handleChange} className={field('password')} placeholder="Min. 6 characters" />
              {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-msg-charcoal mb-1.5">Confirm Password</label>
              <input type="password" name="confirmPassword" value={formData.confirmPassword}
                onChange={handleChange} className={field('confirmPassword')} placeholder="Repeat password" />
              {errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword}</p>}
            </div>

            <button type="submit" disabled={loading}
              className="btn-primary w-full flex items-center justify-center space-x-2 !mt-6">
              {loading
                ? <><Spinner /><span>Creating account…</span></>
                : <span>Create Account</span>}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-textSecondary">
            Already have an account?{' '}
            <Link to="/login" className="text-brand font-semibold hover:text-brand-hover">
              Sign in
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-textSecondary mt-6">
          NexTalk · Connect instantly. Talk seamlessly.
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
