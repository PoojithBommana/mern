import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { cancelBookingPayment } from '../apis/publicBookingApi';
import Button from '../components/Button';
import { SvgIcon } from '../components/ui';

const BookingCancelledPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const slug = searchParams.get('slug');

  useEffect(() => {
    const run = async () => {
      try {
        const bookingId = searchParams.get('booking_id');
        if (bookingId) await cancelBookingPayment(bookingId);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f6f7fb] px-4">
      <div className="w-full max-w-md rounded-[28px] bg-white p-8 text-center shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-500">
          <SvgIcon name="close" className="h-7 w-7" />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900">
          {loading ? 'Processing cancellation...' : 'Booking cancelled'}
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Your payment was not completed. No booking was created and you have not been charged.
        </p>
        <Button fullWidth className="mt-6" onClick={() => navigate(slug ? `/book/${slug}` : '/')}>
          Try booking again
        </Button>
      </div>
    </div>
  );
};

export default BookingCancelledPage;
