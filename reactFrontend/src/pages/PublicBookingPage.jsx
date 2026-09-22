import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  getPublicBookingPage,
  getPublicServices,
  getAvailableSlots,
  requestBookingOTP,
  verifyBookingOTP,
  createBooking,
} from '../apis/publicBookingApi';
import { Logo, SvgIcon } from '../components/ui';
import { formatRupees, initials } from '../utils/format';

const AVATARS = [
  { id: 'A1', bg: '#FDE68A', face: '#F59E0B' },
  { id: 'A2', bg: '#FBCFE8', face: '#DB2777' },
  { id: 'A3', bg: '#DDD6FE', face: '#7C3AED' },
  { id: 'A4', bg: '#BFDBFE', face: '#2563EB' },
  { id: 'A5', bg: '#BBF7D0', face: '#059669' },
  { id: 'A6', bg: '#FED7AA', face: '#EA580C' },
  { id: 'A7', bg: '#E2E8F0', face: '#475569' },
  { id: 'A8', bg: '#FECACA', face: '#DC2626' },
  { id: 'A9', bg: '#C7D2FE', face: '#4F46E5' },
  { id: 'A10', bg: '#A7F3D0', face: '#0F766E' },
  { id: 'A11', bg: '#FDE68A', face: '#B45309' },
  { id: 'A12', bg: '#F5D0FE', face: '#A21CAF' },
  { id: 'A13', bg: '#BAE6FD', face: '#0284C7' },
  { id: 'A14', bg: '#D9F99D', face: '#4D7C0F' },
  { id: 'A15', bg: '#FECDD3', face: '#BE123C' },
  { id: 'A16', bg: '#E9D5FF', face: '#6D28D9' },
];

const AvatarBubble = ({ avatar, selected, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="flex h-11 w-11 items-center justify-center rounded-full"
    style={{
      background: avatar.bg,
      boxShadow: selected ? `0 0 0 2px #fff, 0 0 0 4px ${avatar.face}` : 'none',
    }}
  >
    <svg width="28" height="28" viewBox="0 0 32 32">
      <circle cx="16" cy="13" r="6" fill={avatar.face} opacity="0.85" />
      <ellipse cx="16" cy="26" rx="9" ry="6" fill={avatar.face} opacity="0.85" />
    </svg>
  </button>
);

const PublicBookingPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [business, setBusiness] = useState(null);
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [slotMeta, setSlotMeta] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    otp: '',
    avatar: 'A1',
    notes: '',
  });
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  useEffect(() => {
    fetchBusinessAndServices();
  }, [slug]);

  useEffect(() => {
    if (selectedService && selectedDate) fetchAvailableSlots();
  }, [selectedService, selectedDate]);

  const fetchBusinessAndServices = async () => {
    try {
      const [businessData, servicesData] = await Promise.all([
        getPublicBookingPage(slug),
        getPublicServices(slug),
      ]);
      const biz = businessData.business || businessData;
      const list = Array.isArray(servicesData) ? servicesData : servicesData.services || [];
      setBusiness(biz);
      setServices(list);
      if (list[0]) setSelectedService(list[0]);
    } catch (err) {
      setError(err.message || 'Business not found');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableSlots = async () => {
    try {
      const data = await getAvailableSlots(slug, selectedDate, selectedService._id);
      const slots = Array.isArray(data?.slots) ? data.slots : Array.isArray(data) ? data : [];
      setAvailableSlots(slots);
      setSlotMeta(data || null);
      setSelectedSlot(null);
    } catch {
      setAvailableSlots([]);
      setSlotMeta(null);
    }
  };

  const handleSendOTP = async () => {
    if (!formData.customerEmail) {
      setError('Enter your email to receive a code.');
      return;
    }
    setOtpSending(true);
    setError('');
    setInfo('');
    setOtpVerified(false);
    try {
      await requestBookingOTP(slug, formData.customerEmail);
      setOtpSent(true);
      setInfo(`We sent a 6-digit code to ${formData.customerEmail}`);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to send code');
    } finally {
      setOtpSending(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!formData.customerEmail) {
      setError('Enter your email first.');
      return;
    }
    if (formData.otp.length !== 6) {
      setError('Enter the 6-digit code from your email.');
      return;
    }
    setOtpVerifying(true);
    setError('');
    try {
      await verifyBookingOTP(slug, formData.customerEmail, formData.otp);
      setOtpVerified(true);
      setInfo('Email verified.');
    } catch (err) {
      setOtpVerified(false);
      setError(err.response?.data?.message || 'Invalid code');
    } finally {
      setOtpVerifying(false);
    }
  };

  const handleBooking = async () => {
    if (!selectedService || !selectedDate || !selectedSlot) {
      setError('Choose a service, date, and time.');
      return;
    }
    if (!otpVerified) {
      setError('Verify your email before booking.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const startTime = typeof selectedSlot === 'string' ? selectedSlot : selectedSlot.startTime;
      const duration = Number(selectedService.duration) || 0;
      const [hours, minutes] = String(startTime).split(':').map(Number);
      const computedEnd = `${String(Math.floor((hours * 60 + minutes + duration) / 60)).padStart(2, '0')}:${String((hours * 60 + minutes + duration) % 60).padStart(2, '0')}`;
      const endTime = (typeof selectedSlot === 'object' && selectedSlot.endTime) || computedEnd;
      const result = await createBooking(slug, {
        serviceId: selectedService._id,
        date: selectedDate,
        startTime,
        endTime,
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        emailOtp: formData.otp,
        customerAvatar: formData.avatar,
        notes: formData.notes,
      });
      const bookingId = result.bookingId || result.booking?._id;
      const checkoutUrl = result.paymentUrl || result.url || result.checkoutUrl;
      if (checkoutUrl) {
        if (bookingId) {
          sessionStorage.setItem('pendingBookingId', bookingId);
          sessionStorage.setItem('pendingSlug', slug);
        }
        window.location.href = checkoutUrl;
        return;
      }
      navigate(`/booking/success?booking_id=${bookingId}&slug=${slug}`);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to create booking');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f7fb]">
        <div className="h-11 w-11 animate-spin rounded-full border-4 border-violet-100 border-t-violet-500" />
      </div>
    );
  }

  if (!business) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#f6f7fb] px-6 text-center">
        <Logo />
        <h1 className="mt-8 text-2xl font-extrabold text-slate-900">Business not found</h1>
        <p className="mt-2 text-slate-500">This booking link doesn&apos;t exist or is no longer available.</p>
      </div>
    );
  }

  const accent = business.brandAccent || business.brantAccent || business.accentColor || '#7c5cff';

  return (
    <div className="min-h-screen bg-[#f6f7fb] px-4 py-8">
      <div className="mx-auto grid max-w-6xl overflow-hidden rounded-[32px] bg-white shadow-[0_24px_80px_rgba(15,23,42,0.08)] lg:grid-cols-[0.9fr_1.2fr]">
        <aside className="p-8 text-white" style={{ background: `linear-gradient(180deg, ${accent} 0%, #111827 110%)` }}>
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-xl font-extrabold">
              {initials(business.businessName || business.name)}
            </div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-white/70">Book online</p>
          </div>
          <h1 className="text-4xl font-extrabold leading-tight">{business.businessName || business.name}</h1>
          <p className="mt-3 text-sm leading-relaxed text-white/80">
            {business.businessDescription || business.description || 'Choose a service and book a time that works for you.'}
          </p>
          <div className="mt-8 space-y-3">
            {services.map((service) => {
              const active = selectedService?._id === service._id;
              return (
                <button
                  key={service._id}
                  onClick={() => setSelectedService(service)}
                  className={`w-full rounded-2xl p-4 text-left transition ${
                    active ? 'bg-white text-slate-900 shadow-lg' : 'bg-white/10 text-white hover:bg-white/15'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${active ? 'bg-slate-900 text-white' : 'bg-white/15'}`}>
                      <SvgIcon name={service.icon} className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold">{service.name}</p>
                      <p className={`text-sm ${active ? 'text-slate-500' : 'text-white/70'}`}>
                        {service.duration} min · {formatRupees(service.price)}
                      </p>
                    </div>
                    {active && <span className="text-lg" style={{ color: accent }}>✓</span>}
                  </div>
                  {active && <p className="mt-2 text-sm text-slate-500">{service.description}</p>}
                </button>
              );
            })}
          </div>
        </aside>

        <section className="p-8 sm:p-10">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Choose your appointment</h2>
          {selectedService && (
            <p className="mt-2 text-sm font-semibold" style={{ color: accent }}>
              {selectedService.name} · {selectedService.duration} minutes · {formatRupees(selectedService.price)}
            </p>
          )}

          {error && (
            <div className="mt-5 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
              {error}
            </div>
          )}
          {info && !error && (
            <div className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
              {info}
            </div>
          )}

          <div className="mt-6 space-y-5">
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-slate-700">Date</span>
              <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bm-input !pl-4"
              />
              {selectedDate && (
                <p className="mt-2 text-xs font-medium text-slate-400">
                  {slotMeta?.dayName ? `${slotMeta.dayName} uses this day’s weekly hours.` : 'Times come from the weekday hours you saved in Availability.'}
                </p>
              )}
            </label>

            {selectedDate && (
              <div>
                <p className="mb-2 text-sm font-semibold text-slate-700">Available times</p>
                {availableSlots.length === 0 ? (
                  <p className="text-sm text-slate-400">
                    {slotMeta?.dayName
                      ? `No hours on ${slotMeta.dayName}.`
                      : 'No times available on this date.'}
                    {slotMeta?.availableDays?.length
                      ? ` Try ${slotMeta.availableDays.map((day) => day.name).join(', ')}.`
                      : ' Set weekly hours in Availability first.'}
                  </p>
                ) : (
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {availableSlots.map((slot) => {
                      const start = typeof slot === 'string' ? slot : slot.startTime;
                      const active = (selectedSlot?.startTime || selectedSlot) === start;
                      return (
                        <button
                          key={start}
                          type="button"
                          onClick={() => setSelectedSlot(typeof slot === 'string' ? { startTime: slot } : slot)}
                          className={`rounded-xl border px-3 py-2.5 text-sm font-semibold ${
                            active ? 'text-white' : 'border-slate-200 text-slate-700 hover:border-violet-200'
                          }`}
                          style={active ? { background: accent, borderColor: accent } : {}}
                        >
                          {start}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold text-slate-700">Your name</span>
                <input
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  placeholder="Enter your name"
                  className="bm-input !pl-4"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold text-slate-700">Email address</span>
                <input
                  type="email"
                  value={formData.customerEmail}
                  onChange={(e) => {
                    setFormData({ ...formData, customerEmail: e.target.value });
                    setOtpVerified(false);
                    setOtpSent(false);
                  }}
                  placeholder="Enter your email"
                  className="bm-input !pl-4"
                />
              </label>
            </div>

            <div className="rounded-2xl border p-4" style={{ borderColor: `${accent}33`, background: `${accent}0d` }}>
              <p className="mb-2 text-sm font-semibold" style={{ color: accent }}>
                Email verification code
              </p>
              <div className="flex flex-wrap gap-2">
                <input
                  value={formData.otp}
                  onChange={(e) => {
                    setFormData({ ...formData, otp: e.target.value });
                    setOtpVerified(false);
                  }}
                  maxLength={6}
                  placeholder="Enter 6-digit code"
                  className="bm-input !pl-4 min-w-[10rem] flex-1 bg-white"
                />
                {otpVerified ? (
                  <span className="flex items-center rounded-xl bg-emerald-500 px-4 text-sm font-bold text-white">
                    Verified
                  </span>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={handleSendOTP}
                      disabled={otpSending}
                      className="rounded-xl bg-white px-4 text-sm font-semibold disabled:opacity-50"
                      style={{ color: accent }}
                    >
                      {otpSending ? 'Sending…' : otpSent ? 'Resend code' : 'Send code'}
                    </button>
                    <button
                      type="button"
                      onClick={handleVerifyOTP}
                      disabled={otpVerifying}
                      className="rounded-xl px-4 text-sm font-semibold text-white disabled:opacity-50"
                      style={{ background: accent }}
                    >
                      {otpVerifying ? 'Verifying…' : 'Verify code'}
                    </button>
                  </>
                )}
              </div>
            </div>

            <div>
              <p className="mb-3 text-sm font-semibold text-slate-700">Choose your avatar</p>
              <div className="grid grid-cols-8 gap-2">
                {AVATARS.map((avatar) => (
                  <AvatarBubble
                    key={avatar.id}
                    avatar={avatar}
                    selected={formData.avatar === avatar.id}
                    onClick={() => setFormData({ ...formData, avatar: avatar.id })}
                  />
                ))}
              </div>
            </div>

            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-slate-700">Notes (Optional)</span>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Add any notes or special requests..."
                className="bm-input min-h-[88px] !pl-4 resize-none"
              />
            </label>

            <button
              onClick={handleBooking}
              disabled={submitting}
              className="bm-btn w-full rounded-2xl py-4 text-base font-bold text-white disabled:opacity-60"
              style={{ background: accent, boxShadow: `0 12px 24px ${accent}55` }}
            >
              {submitting ? 'Booking…' : `Pay ${formatRupees(selectedService?.price || 0)} and Book Appointment`}
            </button>
            <p className="text-center text-xs text-slate-400">Secure payments powered by Stripe</p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default PublicBookingPage;
