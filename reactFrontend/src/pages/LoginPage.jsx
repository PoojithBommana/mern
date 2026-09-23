import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthShell from '../components/AuthShell';
import Button from '../components/Button';
import { Banner, Field } from '../components/ui';
import { useToast } from '../context/ToastContext';

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(formData.email, formData.password);
      toast('Logged in. Go to Services to create a service.', {
        to: '/dashboard/services',
        action: 'Create a service',
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell>
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Welcome back</h2>
        <p className="mt-1.5 text-sm text-slate-500">Log in to manage your bookings</p>
      </div>

      {error && (
        <div className="mb-5">
          <Banner>{error}</Banner>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Field
          label="Email"
          icon="mail"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="you@example.com"
          required
        />
        <Field
          label="Password"
          icon="lock"
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          placeholder="••••••••"
          required
        />
        <Button type="submit" fullWidth size="lg" loading={loading} className="mt-2">
          Log in
          <span aria-hidden="true">→</span>
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Need an account?{' '}
        <Link to="/register" className="font-semibold text-violet-600 hover:text-violet-700">
          Register
        </Link>
      </p>
    </AuthShell>
  );
};

export default LoginPage;
