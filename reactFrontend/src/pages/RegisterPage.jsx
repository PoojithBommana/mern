import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthShell from '../components/AuthShell';
import Button from '../components/Button';
import { Banner, Field } from '../components/ui';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    businessName: '',
    email: '',
    password: '',
    otp: '',
  });
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const { register, sendOTP } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleResendOTP = async () => {
    if (!formData.email) {
      setError('Enter your email first so we can send a code.');
      return;
    }
    setOtpLoading(true);
    setError('');
    try {
      await sendOTP(formData.email);
      setInfo(`We sent a 6-digit code to ${formData.email}`);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to send code');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await register({
        username: formData.name,
        email: formData.email,
        password: formData.password,
        businessName: formData.businessName,
        emailOtp: formData.otp,
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell>
      <div className="mb-7">
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Create account</h2>
        <p className="mt-1.5 text-sm text-slate-500">Set up your business in minutes</p>
      </div>

      {error && (
        <div className="mb-4">
          <Banner>{error}</Banner>
        </div>
      )}
      {info && !error && (
        <div className="mb-4">
          <Banner type="success">{info}</Banner>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Field
          label="Name"
          icon="user"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Your full name"
          required
        />
        <Field
          label="Business Name"
          icon="building"
          name="businessName"
          value={formData.businessName}
          onChange={handleChange}
          placeholder="Your business name"
          required
        />
        <Field
          label="Email"
          icon="mail"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="you@example.com"
          required
        />

        <div className="rounded-2xl border border-violet-100 bg-violet-50/70 p-3">
          <p className="mb-2 text-sm font-semibold text-violet-700">Email verification code</p>
          <div className="flex gap-2">
            <input
              name="otp"
              value={formData.otp}
              onChange={handleChange}
              maxLength={6}
              placeholder="Enter 6-digit code"
              className="bm-input !pl-4 flex-1 bg-white"
              required
            />
            <button
              type="button"
              onClick={handleResendOTP}
              disabled={otpLoading}
              className="shrink-0 rounded-xl border border-violet-100 bg-white px-3 text-sm font-semibold text-violet-700 hover:bg-violet-50 disabled:opacity-50"
            >
              {otpLoading ? 'Sending…' : 'Resend code'}
            </button>
          </div>
        </div>

        <Field
          label="Password"
          icon="lock"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="••••••••"
          minLength={6}
          required
        />

        <Button type="submit" fullWidth size="lg" loading={loading}>
          Create account
          <span aria-hidden="true">→</span>
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-violet-600 hover:text-violet-700">
          Log in
        </Link>
      </p>
    </AuthShell>
  );
};

export default RegisterPage;
