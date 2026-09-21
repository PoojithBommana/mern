import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAllServices } from '../apis/servicesApi';
import { getPaymentOverview } from '../apis/paymentApi';
import { getAllBookings } from '../apis/bookingsApi';
import { DashboardHeroArt } from '../components/illustrations';
import { Banner, SvgIcon } from '../components/ui';
import Button from '../components/Button';
import {
  bookingPageUrl,
  formatPaise,
  formatDatePretty,
  greetingForNow,
  initials,
} from '../utils/format';

const asList = (value) => (Array.isArray(value) ? value : value?.services || value?.bookings || []);

const LineChart = ({ series }) => {
  const width = 640;
  const height = 220;
  const pad = 28;
  const max = Math.max(1, ...series.map((p) => p.count));
  const points = series.map((p, i) => {
    const x = pad + (i / Math.max(1, series.length - 1)) * (width - pad * 2);
    const y = height - pad - (p.count / max) * (height - pad * 2);
    return { ...p, x, y };
  });
  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  const area = `${path} L${points.at(-1)?.x || pad},${height - pad} L${pad},${height - pad} Z`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-56 w-full">
      {[0, 1, 2, 3, 4].map((line) => (
        <line
          key={line}
          x1={pad}
          x2={width - pad}
          y1={pad + line * ((height - pad * 2) / 4)}
          y2={pad + line * ((height - pad * 2) / 4)}
          stroke="#eef0f6"
        />
      ))}
      <path d={area} fill="url(#chartFill)" />
      <path d={path} fill="none" stroke="#7c5cff" strokeWidth="3" strokeLinejoin="round" />
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="4" fill="#fff" stroke="#7c5cff" strokeWidth="2" />
          <title>{`${p.count} bookings on ${p.label}`}</title>
        </g>
      ))}
      <defs>
        <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7c5cff" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#7c5cff" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
};

const Donut = ({ confirmed, rescheduled, cancelled }) => {
  const total = Math.max(1, confirmed + rescheduled + cancelled);
  const segs = [
    { value: confirmed, color: '#7c5cff' },
    { value: rescheduled, color: '#fb923c' },
    { value: cancelled, color: '#f43f5e' },
  ];
  let offset = 0;
  const circumference = 2 * Math.PI * 36;

  return (
    <div className="relative h-40 w-40">
      <svg viewBox="0 0 100 100" className="-rotate-90">
        <circle cx="50" cy="50" r="36" fill="none" stroke="#eef0f6" strokeWidth="12" />
        {segs.map((seg, i) => {
          const length = (seg.value / total) * circumference;
          const circle = (
            <circle
              key={i}
              cx="50"
              cy="50"
              r="36"
              fill="none"
              stroke={seg.color}
              strokeWidth="12"
              strokeDasharray={`${length} ${circumference - length}`}
              strokeDashoffset={-offset}
              strokeLinecap="round"
            />
          );
          offset += length;
          return circle;
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <p className="text-3xl font-extrabold text-slate-900">{confirmed + rescheduled + cancelled}</p>
        <p className="text-xs font-semibold text-slate-400">Total</p>
      </div>
    </div>
  );
};

const DashboardHome = () => {
  const { user } = useAuth();
  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [paymentData, setPaymentData] = useState(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [servicesData, bookingsData, paymentInfo] = await Promise.all([
        getAllServices().catch(() => []),
        getAllBookings({}).catch(() => []),
        getPaymentOverview().catch(() => null),
      ]);
      setServices(asList(servicesData));
      setBookings(asList(bookingsData));
      setPaymentData(paymentInfo);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const publicUrl = bookingPageUrl(user?.slug);
  const stats = {
    totalServices: services.length,
    activeServices: services.filter((s) => s.isActive !== false).length,
    walletBalance: paymentData?.wallet?.available || 0,
  };

  const copyLink = async () => {
    if (!publicUrl) return;
    await navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  const chartSeries = useMemo(() => {
    const days = Array.from({ length: 31 }, (_, i) => {
      const date = new Date();
      date.setDate(i + 1);
      const key = date.toISOString().slice(0, 10);
      return { label: key, day: i + 1, count: 0 };
    });
    bookings.forEach((booking) => {
      const day = Number(String(booking.date || booking.createdAt || '').slice(8, 10));
      if (day >= 1 && day <= 31) days[day - 1].count += 1;
    });
    return days;
  }, [bookings]);

  const statusCounts = useMemo(() => ({
    confirmed: bookings.filter((b) => b.status === 'confirmed' && !b.isRescheduled).length,
    rescheduled: bookings.filter((b) => b.isRescheduled).length,
    cancelled: bookings.filter((b) => b.status === 'cancelled').length,
  }), [bookings]);

  const topServices = useMemo(() => {
    const counts = {};
    bookings.forEach((booking) => {
      const name = booking.serviceId?.name || 'Service';
      counts[name] = (counts[name] || 0) + 1;
    });
    const max = Math.max(1, ...Object.values(counts), 1);
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([name, count]) => ({ name, count, pct: Math.round((count / max) * 100) }));
  }, [bookings]);

  const upcoming = bookings
    .filter((b) => b.status === 'confirmed' || b.status === 'pending')
    .slice(0, 3);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-11 w-11 animate-spin rounded-full border-4 border-violet-100 border-t-violet-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
          {greetingForNow()} <span className="inline-block">👋</span>
        </h1>
        <p className="mt-1 text-slate-500">Here&apos;s what&apos;s happening with your business today.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          ['Add services', '/dashboard/services'],
          ['Set availability', '/dashboard/availability'],
          ['Payment details', '/dashboard/payments'],
        ].map(([label, href]) => (
          <Link
            key={href}
            to={href}
            className="rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-600 shadow-sm hover:border-violet-200 hover:text-violet-700"
          >
            {label}
          </Link>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="bm-card p-5">
          <p className="text-sm font-medium text-slate-500">Total Services</p>
          <p className="mt-2 text-4xl font-extrabold text-slate-900">{stats.totalServices}</p>
          <Link to="/dashboard/services" className="mt-3 inline-block text-sm font-semibold text-violet-600">
            Manage Services →
          </Link>
        </div>
        <div className="bm-card p-5">
          <p className="text-sm font-medium text-slate-500">Active Services</p>
          <p className="mt-2 text-4xl font-extrabold text-slate-900">{stats.activeServices}</p>
        </div>
        <div className="bm-card p-5">
          <p className="text-sm font-medium text-slate-500">Wallet Balance</p>
          <p className="mt-2 text-4xl font-extrabold text-slate-900">{formatPaise(stats.walletBalance)}</p>
          <Link to="/dashboard/payments" className="mt-3 inline-block text-sm font-semibold text-violet-600">
            View Payments →
          </Link>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.4fr_0.9fr]">
        <div className="bm-card overflow-hidden p-8">
          <div className="flex items-center justify-between gap-6">
            <div>
              <h2 className="text-4xl font-extrabold leading-tight tracking-tight text-slate-900">
                Grow your
                <br />
                practice.
                <br />
                Impact more
                <br />
                lives.
              </h2>
              <Link to="/dashboard/profile">
                <Button className="mt-6 rounded-full" variant="secondary">
                  Setup booking page →
                </Button>
              </Link>
            </div>
            <DashboardHeroArt />
          </div>
        </div>

        <div className="bm-card p-6">
          <h3 className="text-lg font-bold text-slate-900">Public booking link</h3>
          <p className="mt-1 text-sm text-slate-500">Share your link and start getting bookings instantly.</p>
          {publicUrl ? (
            <>
              <div className="mt-5 flex items-center gap-2 rounded-2xl border border-slate-100 bg-slate-50 py-2 pl-4 pr-2">
                <p className="min-w-0 flex-1 truncate text-sm font-medium text-violet-600">{publicUrl}</p>
                <button
                  type="button"
                  onClick={copyLink}
                  className="flex h-9 shrink-0 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 hover:border-violet-200 hover:text-violet-700"
                  title="Copy link"
                >
                  <SvgIcon name={copied ? 'check' : 'copy'} className="h-4 w-4" />
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
              <p className="mt-5 text-sm font-semibold text-slate-600">Share your link</p>
              <div className="mt-3 flex gap-2">
                {[
                  ['#25D366', 'WhatsApp'],
                  ['#E1306C', 'Instagram'],
                  ['#1877F2', 'Facebook'],
                  ['#EA4335', 'Gmail'],
                ].map(([color, label]) => (
                  <a
                    key={label}
                    href={
                      label === 'WhatsApp'
                        ? `https://wa.me/?text=${encodeURIComponent(publicUrl)}`
                        : `mailto:?subject=Book with me&body=${encodeURIComponent(publicUrl)}`
                    }
                    target="_blank"
                    rel="noreferrer"
                    className="h-10 w-10 rounded-full"
                    style={{ background: color }}
                    title={label}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="mt-5">
              <Banner type="info">Save profile to generate your booking link.</Banner>
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.4fr_0.8fr]">
        <div className="bm-card p-6">
          <LineChart series={chartSeries} />
        </div>
        <div className="bm-card flex items-center gap-6 p-6">
          <Donut {...statusCounts} />
          <div className="space-y-3 text-sm">
            <Legend color="#7c5cff" label="Confirmed" value={statusCounts.confirmed} total={bookings.length} />
            <Legend color="#fb923c" label="Rescheduled" value={statusCounts.rescheduled} total={bookings.length} />
            <Legend color="#f43f5e" label="Cancelled" value={statusCounts.cancelled} total={bookings.length} />
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="bm-card p-6">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">Top Services</h3>
            <Link to="/dashboard/services" className="text-sm font-semibold text-slate-400 hover:text-violet-600">
              View all
            </Link>
          </div>
          {topServices.length === 0 ? (
            <p className="text-sm text-slate-400">No bookings yet.</p>
          ) : (
            <div className="space-y-4">
              {topServices.map((service) => (
                <div key={service.name}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <div>
                      <p className="font-semibold text-slate-800">{service.name}</p>
                      <p className="text-xs text-slate-400">{service.count} bookings</p>
                    </div>
                    <span className="text-xs font-bold text-slate-400">{service.pct}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-violet-500" style={{ width: `${service.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bm-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">Earnings Overview</h3>
            <span className="rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-500">Daily</span>
          </div>
          <p className="text-4xl font-extrabold text-slate-900">{formatPaise(paymentData?.wallet?.earned)}</p>
          <p className="mt-1 text-sm font-medium text-emerald-500">Available {formatPaise(paymentData?.wallet?.available)}</p>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="bm-card p-6">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">Upcoming Bookings</h3>
            <Link to="/dashboard/bookings" className="text-sm font-semibold text-slate-400 hover:text-violet-600">
              View all
            </Link>
          </div>
          {upcoming.length === 0 ? (
            <p className="text-sm text-slate-400">No upcoming bookings.</p>
          ) : (
            <div className="space-y-4">
              {upcoming.map((booking) => (
                <div key={booking._id} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-100 text-sm font-bold text-violet-700">
                      {initials(booking.customerName)}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">{booking.customerName}</p>
                      <p className="text-xs text-slate-400">{booking.serviceId?.name || 'Service'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium text-slate-500">
                      {formatDatePretty(booking.date)} · {booking.startTime}
                    </p>
                    <span className="mt-1 inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-600">
                      Confirmed
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bm-card p-6">
          <h3 className="mb-5 text-lg font-bold text-slate-900">Integrations</h3>
          <div className="space-y-4">
            <IntegrationRow
              name="Google Calendar"
              connected={Boolean(user?.googleCalendarConnected)}
            />
            <IntegrationRow name="Gmail" connected />
          </div>
        </div>
      </div>
    </div>
  );
};

const Legend = ({ color, label, value, total }) => (
  <div className="flex items-center gap-2">
    <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
    <span className="w-24 text-slate-500">{label}</span>
    <span className="font-bold text-slate-800">{value}</span>
    <span className="text-slate-400">{total ? `${Math.round((value / Math.max(total, 1)) * 100)}%` : '0%'}</span>
  </div>
);

const IntegrationRow = ({ name, connected }) => (
  <div className="flex items-center justify-between rounded-2xl border border-slate-100 px-4 py-3">
    <p className="font-semibold text-slate-800">{name}</p>
    <span className={`text-xs font-bold ${connected ? 'text-emerald-600' : 'text-slate-400'}`}>
      {connected ? '✓ Connected' : 'Not connected'}
    </span>
  </div>
);

export default DashboardHome;
