import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getBookingStatus } from '../apis/publicBookingApi';
import Button from '../components/Button';
import { SvgIcon } from '../components/ui';

const BookingSuccessPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBookingDetails();
  }, []);

  const fetchBookingDetails = async () => {
    try {
      const sessionId = searchParams.get('session_id');
      const bookingId =
        searchParams.get('booking_id') || sessionStorage.getItem('pendingBookingId');
      if (!sessionId && !bookingId) {
        setError('No booking information found');
        return;
      }
      const response = await getBookingStatus(sessionId, bookingId);
      setBooking(response.booking || response);
      sessionStorage.removeItem('pendingBookingId');
    } catch {
      setError('Failed to load booking details');
    } finally {
      setLoading(false);
    }
  };

  const slug = searchParams.get('slug') || sessionStorage.getItem('pendingSlug');

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f6f7fb] px-4">
      <div className="w-full max-w-md rounded-[28px] bg-white p-8 text-center shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
          <SvgIcon name="check" className="h-8 w-8" strokeWidth={2.4} />
        </div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-500">Payment verification</p>

        {loading ? (
          <>
            <h1 className="mt-3 text-2xl font-extrabold text-slate-900">Verifying your payment...</h1>
            <button onClick={() => slug && navigate(`/book/${slug}`)} className="mt-6 text-sm font-semibold text-slate-400">
              ← Back to Booking Page
            </button>
          </>
        ) : error || !booking ? (
          <>
            <h1 className="mt-3 text-2xl font-extrabold text-slate-900">{error || 'Booking not found'}</h1>
            <Button className="mt-6" onClick={() => navigate(slug ? `/book/${slug}` : '/')}>
              Back to Booking Page
            </Button>
          </>
        ) : (
          <>
            <h1 className="mt-3 text-2xl font-extrabold text-slate-900">
              Payment received. Your booking is confirmed.
            </h1>
            <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-left">
              <p className="font-bold text-slate-900">{booking.serviceId?.name || 'Appointment'}</p>
              <p className="mt-1 text-sm text-slate-500">
                {booking.date} · {booking.startTime}–{booking.endTime}
              </p>
              <p className="mt-1 text-sm font-semibold text-emerald-600">Status: Confirmed</p>
            </div>
            {booking.customerCalendarUrl && (
              <Button
                fullWidth
                className="mt-5"
                onClick={() => window.open(booking.customerCalendarUrl, '_blank')}
              >
                <SvgIcon name="calendar" className="h-4 w-4" />
                Add to Google Calendar
              </Button>
            )}
            <button
              onClick={() => navigate(slug ? `/book/${slug}` : '/')}
              className="mt-4 text-sm font-semibold text-slate-400"
            >
              ← Back to Booking Page
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default BookingSuccessPage;
