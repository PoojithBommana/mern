import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { updateProfile } from '../apis/authApi';
import { getGoogleAuthURL } from '../apis/integrationApi';
import Button from '../components/Button';
import { Banner, Field, SvgIcon, TextArea } from '../components/ui';
import { ProfileIllustration } from '../components/illustrations';
import { bookingPageUrl } from '../utils/format';

const themes = [
  { id: 'emerald', name: 'Emerald', color: '#047857' },
  { id: 'indigo', name: 'Indigo', color: '#4f46e5' },
  { id: 'rose', name: 'Rose', color: '#e11d48' },
  { id: 'amber', name: 'Amber', color: '#f59e0b' },
  { id: 'slate', name: 'Slate', color: '#475569' },
];

const SettingsPage = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState({
    businessName: '',
    businessDescription: '',
    timezone: 'Asia/Kolkata',
    brandAccent: '#047857',
    brandTheme: 'emerald',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        businessName: user.businessName || '',
        businessDescription: user.businessDescription || '',
        timezone: user.timezone || 'Asia/Kolkata',
        brandAccent: user.brandAccent || '#047857',
        brandTheme: user.brandTheme || 'emerald',
      });
    }
  }, [user]);

  const publicUrl = bookingPageUrl(user?.slug);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const updated = await updateProfile(formData);
      updateUser(updated.user || updated);
      setMessage('Profile saved. Your public page is live.');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleConnect = async () => {
    try {
      const { authUrl } = await getGoogleAuthURL();
      window.location.href = authUrl;
    } catch {
      setError('Failed to connect Google Calendar');
    }
  };

  const copyLink = async () => {
    if (!publicUrl) return;
    await navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-start justify-between gap-6">
        <div>
          <p className="bm-kicker">Profile</p>
          <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-slate-900 md:text-[44px]">
            Shape your <span className="italic text-violet-500">public</span>
            <br />
            booking experience
          </h1>
          <p className="mt-3 max-w-xl text-slate-500">
            Personalize your booking page, connect your tools, and share your link with confidence.
          </p>
        </div>
        <ProfileIllustration />
      </div>

      {error && <Banner>{error}</Banner>}
      {message && <Banner type="success">{message}</Banner>}

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-5">
          <div className="bm-card p-6">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                <SvgIcon name="globe" className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Public booking link</h2>
                <p className="mt-0.5 text-sm text-slate-500">Share this page so customers can book you.</p>
              </div>
            </div>
            {publicUrl ? (
              <>
                <div className="mt-5 flex items-center gap-2 rounded-2xl border border-violet-100 bg-violet-50/70 py-2 pl-4 pr-2">
                  <p className="min-w-0 flex-1 truncate text-sm font-semibold text-violet-700">{publicUrl}</p>
                  <a
                    href={publicUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white bg-white text-slate-500 shadow-sm hover:text-violet-600"
                    title="Open booking page"
                  >
                    <SvgIcon name="external" className="h-4 w-4" />
                  </a>
                  <button
                    type="button"
                    onClick={copyLink}
                    className="flex h-9 shrink-0 items-center gap-1.5 rounded-xl bg-slate-900 px-3 text-xs font-semibold text-white hover:bg-slate-800"
                    title="Copy link"
                  >
                    <SvgIcon name={copied ? 'check' : 'copy'} className="h-4 w-4" />
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <p className="mt-3 flex items-center gap-2 text-sm font-medium text-emerald-600">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100">
                    <SvgIcon name="check" className="h-3 w-3" strokeWidth={2.4} />
                  </span>
                  Your link is live and ready to share.
                </p>
              </>
            ) : (
              <div className="mt-5">
                <Banner type="info">Save your profile to generate a booking link.</Banner>
              </div>
            )}
          </div>

          <div className="bm-card overflow-hidden">
            <div className="border-b border-slate-100 px-6 py-4">
              <h2 className="text-base font-bold text-slate-900">Connected tools</h2>
              <p className="mt-0.5 text-sm text-slate-500">Payments, calendar, and booking emails.</p>
            </div>
            <div className="divide-y divide-slate-100">
              <IntegrationRow
                icon="wallet"
                title="Stripe"
                connected
                body="Collect payments securely at checkout."
                action={<Link to="/dashboard/payments" className="text-sm font-semibold text-violet-600 hover:text-violet-700">View payments</Link>}
              />
              <IntegrationRow
                icon="calendar"
                title="Google Calendar"
                connected={Boolean(user?.googleCalendarConnected)}
                body="Confirmed bookings can sync to your calendar."
                action={
                  <button
                    type="button"
                    onClick={handleGoogleConnect}
                    className="rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800"
                  >
                    {user?.googleCalendarConnected ? 'Reconnect' : 'Connect'}
                  </button>
                }
              />
              <IntegrationRow
                icon="mail"
                title="Emails"
                connected
                body="Customers get OTP and booking updates by email."
              />
            </div>
          </div>
        </div>

        <div className="bm-card p-6">
          <div className="mb-6 flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
              <SvgIcon name="user" className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Business details</h2>
              <p className="text-sm text-slate-400">Update your profile info</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Field
              label="Business Name"
              icon="globe"
              value={formData.businessName}
              onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
              placeholder="Hexagon Digital Services"
              required
            />
            <TextArea
              label="Business Description"
              icon="file"
              value={formData.businessDescription}
              onChange={(e) => setFormData({ ...formData, businessDescription: e.target.value })}
              placeholder="Tell customers what you offer"
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold text-slate-700">Timezone</span>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex w-11 items-center justify-center text-slate-400">
                    <SvgIcon name="globe" className="h-[18px] w-[18px]" />
                  </span>
                  <select
                    value={formData.timezone}
                    onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                    className="bm-input"
                  >
                    <option value="Asia/Kolkata">Asia/Kolkata</option>
                    <option value="America/New_York">America/New_York</option>
                    <option value="Europe/London">Europe/London</option>
                    <option value="UTC">UTC</option>
                  </select>
                </div>
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold text-slate-700">Accent color</span>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={formData.brandAccent}
                    onChange={(e) => setFormData({ ...formData, brandAccent: e.target.value })}
                    className="h-12 w-12 cursor-pointer rounded-xl border border-slate-200 bg-white p-1"
                  />
                  <input
                    value={formData.brandAccent}
                    onChange={(e) => setFormData({ ...formData, brandAccent: e.target.value })}
                    className="bm-input !pl-4 font-mono text-sm"
                  />
                </div>
              </label>
            </div>

            <div>
              <p className="mb-2 text-sm font-semibold text-slate-700">Theme</p>
              <div className="flex flex-wrap gap-2">
                {themes.map((theme) => (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, brandTheme: theme.id, brandAccent: theme.color })
                    }
                    className={`flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold ${
                      formData.brandTheme === theme.id
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: theme.color }} />
                    {theme.name}
                  </button>
                ))}
              </div>
            </div>

            <Button type="submit" fullWidth size="lg" loading={loading}>
              <SvgIcon name="save" className="h-4 w-4" />
              Save profile
            </Button>
          </form>
        </div>
      </div>

      <div className="bm-card overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4">
          <p className="text-sm font-semibold text-violet-500">Customer view</p>
        </div>
        <div className="px-6 pb-6">
          <div
            className="overflow-hidden rounded-[28px] p-6"
            style={{ background: `linear-gradient(135deg, ${formData.brandAccent} 0%, #0f172a 80%)` }}
          >
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/70">Public preview</p>
            <h3 className="mt-2 text-3xl font-extrabold text-white">
              {formData.businessName || 'Your business'}
            </h3>
            <p className="mt-2 max-w-md text-sm text-white/80">
              {formData.businessDescription || 'Your public booking page will appear here.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const IntegrationRow = ({ icon, title, connected, body, action }) => (
  <div className="flex items-start gap-4 px-6 py-5">
    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
      connected ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
    }`}>
      <SvgIcon name={icon} className="h-5 w-5" />
    </div>
    <div className="min-w-0 flex-1">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="font-bold text-slate-900">{title}</h3>
        <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
          connected ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-700'
        }`}>
          {connected ? 'Connected' : 'Not connected'}
        </span>
      </div>
      <p className="mt-1 text-sm leading-relaxed text-slate-500">{body}</p>
    </div>
    {action && <div className="shrink-0 pt-0.5">{action}</div>}
  </div>
);

export default SettingsPage;
