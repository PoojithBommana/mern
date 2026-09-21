import React, { useEffect, useState } from 'react';
import { getAllBookings, rescheduleBooking } from '../apis/bookingsApi';
import Button from '../components/Button';
import { Banner, EmptyState, SvgIcon } from '../components/ui';
import { BookingsIllustration } from '../components/illustrations';
import { formatDatePretty, initials } from '../utils/format';

const statusFilters = [
  { id: 'all', label: 'All Statuses' },
  { id: 'confirmed', label: 'Confirmed' },
  { id: 'rescheduled', label: 'Rescheduled' },
  { id: 'cancelled', label: 'Cancelled' },
];

const asList = (value) => (Array.isArray(value) ? value : value?.bookings || []);

const BookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [error, setError] = useState('');
  const [rescheduleId, setRescheduleId] = useState(null);
  const [rescheduleForm, setRescheduleForm] = useState({ date: '', startTime: '', endTime: '' });

  useEffect(() => {
    fetchBookings();
  }, [filter, dateFilter]);

  const fetchBookings = async () => {
    try {
      const params = {};
      if (filter === 'confirmed' || filter === 'cancelled') params.status = filter;
      if (dateFilter) params.date = dateFilter;
      const data = asList(await getAllBookings(params));
      const next = filter === 'rescheduled' ? data.filter((b) => b.isRescheduled) : data;
      setBookings(next);
    } catch (err) {
      setError(err.message || 'Could not load bookings');
    } finally {
      setLoading(false);
    }
  };

  const submitReschedule = async (bookingId) => {
    try {
      await rescheduleBooking(bookingId, rescheduleForm);
      setRescheduleId(null);
      await fetchBookings();
    } catch (err) {
      setError(err.message || 'Could not reschedule');
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-11 w-11 animate-spin rounded-full border-4 border-violet-100 border-t-violet-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-start justify-between gap-6">
        <div>
          <p className="bm-kicker">Bookings</p>
          <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-slate-900 md:text-[44px]">
            Manage customer <span className="italic text-violet-500">appointments</span>
          </h1>
          <p className="mt-3 max-w-xl text-slate-500">
            Review payments, calendar sync, and appointment status from one calm workspace.
          </p>
        </div>
        <BookingsIllustration />
      </div>

      {error && <Banner>{error}</Banner>}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
        <div className="relative">
          <span className="pointer-events-none absolute inset-y-0 left-0 flex w-11 items-center justify-center text-slate-400">
            <SvgIcon name="calendar" className="h-4 w-4" />
          </span>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="bm-input w-full sm:w-52"
          />
        </div>
        <div className="relative">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bm-input !pl-4 w-full sm:w-48"
          >
            {statusFilters.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {bookings.length === 0 ? (
        <EmptyState icon="clipboard" title="No bookings found" subtitle="New appointments will appear here." />
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => {
            const status = booking.isRescheduled ? 'rescheduled' : booking.status;
            return (
              <div key={booking._id} className="bm-card p-6">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex gap-2">
                    <Badge tone={status === 'cancelled' ? 'rose' : 'violet'}>
                      {status?.replace('_', ' ')}
                    </Badge>
                    <Badge tone={booking.paymentStatus === 'paid' ? 'mint' : 'amber'}>
                      Payment: {booking.paymentStatus === 'not_required' ? 'not required' : booking.paymentStatus}
                    </Badge>
                  </div>
                  <button
                    onClick={() => {
                      setRescheduleId(booking._id);
                      setRescheduleForm({
                        date: booking.date || '',
                        startTime: booking.startTime || '',
                        endTime: booking.endTime || '',
                      });
                    }}
                    className="rounded-xl border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Reschedule
                  </button>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-100 font-bold text-violet-700">
                    {initials(booking.customerName)}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-slate-900">{booking.customerName}</h3>
                    <p className="text-sm text-slate-500">{booking.customerEmail}</p>
                    <p className="mt-3 flex items-center gap-2 text-sm font-medium text-slate-700">
                      <SvgIcon name="calendar" className="h-4 w-4 text-violet-500" />
                      {booking.date} · {booking.startTime} – {booking.endTime}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {booking.serviceId?.name} {booking.serviceId?.duration ? `· ${booking.serviceId.duration}m` : ''}
                    </p>
                    <p className="mt-3 text-xs text-slate-400">
                      Created: {formatDatePretty(booking.createdAt)} · Last updated: {formatDatePretty(booking.updatedAt)}
                    </p>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Calendar: {booking.googleEventId ? 'Synced' : 'Not synced'}
                    </p>
                    {booking.customerCalendarUrl && (
                      <a
                        href={booking.customerCalendarUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 inline-flex text-sm font-semibold text-violet-600"
                      >
                        Customer calendar link
                      </a>
                    )}
                  </div>
                </div>

                {rescheduleId === booking._id && (
                  <div className="mt-5 grid gap-3 rounded-2xl bg-slate-50 p-4 sm:grid-cols-4">
                    <input
                      type="date"
                      className="bm-input !pl-4"
                      value={rescheduleForm.date}
                      onChange={(e) => setRescheduleForm({ ...rescheduleForm, date: e.target.value })}
                    />
                    <input
                      type="time"
                      className="bm-input !pl-4"
                      value={rescheduleForm.startTime}
                      onChange={(e) => setRescheduleForm({ ...rescheduleForm, startTime: e.target.value })}
                    />
                    <input
                      type="time"
                      className="bm-input !pl-4"
                      value={rescheduleForm.endTime}
                      onChange={(e) => setRescheduleForm({ ...rescheduleForm, endTime: e.target.value })}
                    />
                    <Button onClick={() => submitReschedule(booking._id)}>Save</Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const Badge = ({ children, tone }) => {
  const tones = {
    violet: 'bg-violet-50 text-violet-700',
    mint: 'bg-emerald-50 text-emerald-700',
    amber: 'bg-amber-50 text-amber-700',
    rose: 'bg-rose-50 text-rose-700',
  };
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${tones[tone]}`}>
      {children}
    </span>
  );
};

export default BookingsPage;
