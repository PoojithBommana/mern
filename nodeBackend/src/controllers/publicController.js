import bookingModel from '../models/booking.js';
import serviceModel from '../models/service.js';
import userModelSchema from '../models/userModel.js';

import { buildCustomCalendarLink } from '../utils/calanderlink.js';
import { createBookingCalendarEvent } from '../utils/googleCalander.js';
import { sendBookingNotification } from '../utils/bookingnotification.js';
import { generateOtp, verifyOtp } from '../utils/EmailOtp.js';
import { generateSlots } from '../utils/slotGenerator.js';
import { toStripAmount, getStripe, buildStripePaymentUrl, getClientUrl } from '../utils/strip.js';
import { calculatePlatformFee } from '../utils/money.js';
import { checkOverlap } from '../utils/overlap.js';
import { createBookingPayoutTransaction } from '../utils/wallet.js';


// Get business by slug
const getBussinessBySlug = async (slug) => {
  return userModelSchema
    .findOne({ slug: slug })
    .select('-password');
};


// Public business data
const toPublicBussiness = (bussiness) => {
  return {
    id: bussiness._id,
    name: bussiness.name,
    slug: bussiness.slug,
    businessName: bussiness.businessName,
    businessDescription: bussiness.businessDescription,
    brandTheme: bussiness.brandTheme,
    brandAccent: bussiness.brandAccent,
    timezone: bussiness.timezone,
    googleCalendarConnected: bussiness.googleCalendarConnected,
  };
};


// Hold window - 30 minutes
const holdwindowStart = () => {
  return Date.now() - 30 * 60 * 1000;
};


// Find active bookings
const findActiveBookings = async (userId, date) => {
  return bookingModel.find({
    userId,
    date,
    $or: [
      { status: 'confirmed' },
      {
        status: { $in: ['pending', 'pending_payment'] },
        createdAt: { $gte: holdwindowStart() },
      },
    ],
  });
};


// Get public booking page
export const getPublicBookingPage = async (req, res) => {
  try {
    const business = await getBussinessBySlug(req.params.slug);

    if (!business) {
      return res.status(404).json({
        message: 'Business not found',
      });
    }

    const publicBusiness = toPublicBussiness(business);

    return res.json({
      business: publicBusiness,
    });

  } catch (error) {
    console.error('Get public booking page error:', error);

    return res.status(500).json({
      message: 'Server error',
      error: error.message,
    });
  }
};

// Get public services for a business
export const getPublicServices = async (req, res) => {
  try {
    const business = await getBussinessBySlug(req.params.slug);

    if (!business) {
      return res.status(404).json({
        message: 'Business not found',
      });
    }

    const services = await serviceModel.find({
      userId: business._id,
      isActive: true,
      isDeleted: { $ne: true },
    }).select('name description price duration icon');

    return res.json({
      services,
    });

  } catch (error) {
    console.error('Get public services error:', error);

    return res.status(500).json({
      message: 'Server error',
      error: error.message,
    });
  }
};


// Get public slots
export const getPublicSlots = async (req, res) => {
  try {
    const { date, serviceId } = req.query;

    if (!date || !serviceId) {
      return res.status(400).json({
        message: 'Date and service are required',
      });
    }

    const business = await getBussinessBySlug(req.params.slug);

    if (!business) {
      return res.status(404).json({
        message: 'Business not found',
      });
    }

    const service = await serviceModel.findOne({
      _id: serviceId,
      userId: business._id,
      isActive: true,
      isDeleted: { $ne: true },
    });

    if (!service) {
      return res.status(404).json({
        message: 'Service not found',
      });
    }

    const slotResult = await generateSlots(business._id, service, date);

    return res.json({
      slots: slotResult.slots,
      date,
      dayOfWeek: slotResult.dayOfWeek,
      dayName: slotResult.dayName,
      availableDays: slotResult.availableDays,
    });

  } catch (error) {
    console.error('Get public slots error:', error);

    return res.status(500).json({
      message: 'Server error',
    });
  }
};


// Request public booking OTP
export const requestPublicBookingOtp = async (req, res) => {
  try {
    const { customerEmail } = req.body;

    // Check first before calling toLowerCase()
    if (!customerEmail) {
      return res.status(400).json({
        message: 'Customer email is required',
      });
    }

    const normalizedEmail = customerEmail
      .toLowerCase()
      .trim();

    if (!normalizedEmail) {
      return res.status(400).json({
        message: 'Customer email is required',
      });
    }

    const business = await getBussinessBySlug(req.params.slug);

    if (!business) {
      return res.status(404).json({
        message: 'Business not found',
      });
    }

    const result = await generateOtp({
      email: normalizedEmail,
      purpose: 'booking',
    });

    if (!result?.ok || !result.sent) {
      return res.status(502).json({
        message: result?.reason || 'Failed to send OTP email via Brevo',
      });
    }

    return res.json({
      message: 'OTP sent successfully',
      sent: true,
    });

  } catch (error) {
    console.error('Request booking OTP error:', error);

    return res.status(500).json({
      message: 'Server error',
      error: error.message,
    });
  }
};


// Verify public booking OTP
export const verifyPublicBookingOtp = async (req, res) => {
  try {
    const { customerEmail, emailOtp } = req.body;

    if (!customerEmail || !emailOtp) {
      return res.status(400).json({
        message: 'Email and OTP are required',
      });
    }

    const normalizedEmail = customerEmail
      .toLowerCase()
      .trim();

    const otpResult = await verifyOtp({
      email: normalizedEmail,
      purpose: 'booking',
      code: emailOtp,
      consume: false,
    });

    if (!otpResult.verified) {
      return res.status(400).json({
        message: otpResult.reason || 'Invalid OTP',
      });
    }

    return res.json({
      message: 'OTP verified',
    });

  } catch (error) {
    console.error('Verify booking OTP error:', error);

    return res.status(500).json({
      message: 'Server error',
      error: error.message,
    });
  }
};
  
  export const createPublicBooking = async (req, res) => {
    try {
      const { serviceId, customerName, customerEmail, customerAvatar, date, startTime, endTime, notes, emailOtp } = req.body;
  
      if (!serviceId || !customerName || !customerEmail || !date || !startTime || !endTime) {
        return res.status(400).json({ message: 'All booking fields are required' });
      }
  
      const normalizedCustomerEmail = customerEmail.toLowerCase().trim();
  
      const business = await getBussinessBySlug(req.params.slug);
      if (!business) {
        return res.status(404).json({ message: 'Business not found' });
      }
  
      const service = await serviceModel.findOne({
        _id: serviceId,
        userId: business._id,
        isActive: true,
        isDeleted: { $ne: true },
      });
      if (!service) {
        return res.status(404).json({ message: 'Service not found' });
      }
  
      const bookings = await findActiveBookings(business._id, date);
  
      const hasConflict = bookings.some((booking) => (
        checkOverlap(startTime, endTime, booking.startTime, booking.endTime)
      ));
  
      if (hasConflict) {
        return res.status(409).json({ message: 'That slot is no longer available' });
      }
  
      const otpResult = await verifyOtp({
        email: normalizedCustomerEmail,
        purpose: 'booking',
        code: emailOtp,
        consume: false,
      });

      if (!otpResult.verified) {
        return res.status(400).json({ message: otpResult.reason || 'Email verification is required' });
      }
  
      const amount = toStripAmount(service.price);
      const { platformFee: platformFeeAmount, providerPayOut: providerPayoutAmount } =
        calculatePlatformFee(amount);
      const currency = 'inr';

      const stripe = getStripe();
      if (amount > 0 && !stripe) {
        return res.status(503).json({ message: 'Stripe payments are not configured yet' });
      }

      const customerCalendarUrl = buildCustomCalendarLink({
        business,
        service,
        booking: { date, startTime, endTime, customerName, customerEmail: normalizedCustomerEmail, notes },
      });
  
      const booking = await bookingModel.create({
        userId: business._id,
        serviceId,
        customerName,
        customerEmail: normalizedCustomerEmail,
        customerAvatar: customerAvatar || 'A1.png',
        date,
        startTime,
        endTime,
        notes: notes || '',
        amount,
        platformFeeAmount,
        providerPayoutAmount,
        payoutStatus: amount > 0 ? 'pending' : 'not_required',
        currency,
        paymentStatus: amount > 0 ? 'pending' : 'not_required',
        status: amount > 0 ? 'pending_payment' : 'confirmed',
        customerCalendarUrl,
      });

      await verifyOtp({
        email: normalizedCustomerEmail,
        purpose: 'booking',
        code: emailOtp,
        consume: true,
      });
  
      if (amount === 0) {
        try {
          const calendarResult = await createBookingCalendarEvent({ business, service, booking });
          booking.googleEventId = calendarResult.googleEventId || '';
          booking.customerCalendarUrl = calendarResult.customerCalendarUrl;
          await booking.save();
        } catch (calendarError) {
          booking.customerCalendarUrl = customerCalendarUrl;
          await booking.save();
        }
  
        let emailResult = { sent: 'processing' };
        sendBookingNotification({ business, service, booking, type: 'confirmed' })
          .catch(emailError => console.error('Booking confirmation email failed:', emailError.message));
  
        return res.status(201).json({
          message: 'Booking confirmed',
          booking,
          customerCalendarUrl: booking.customerCalendarUrl,
          email: emailResult,
        });
      }
  
      const clientUrl = getClientUrl();
      const successUrl = `${clientUrl}/booking/success?session_id={CHECKOUT_SESSION_ID}&booking_id=${booking._id}&slug=${business.slug}`;
      const cancelUrl = `${clientUrl}/booking/cancelled?booking_id=${booking._id}&slug=${business.slug}`;

      let checkoutUrl = '';
      try {
        const session = await stripe.checkout.sessions.create({
          mode: 'payment',
          customer_email: normalizedCustomerEmail,
          client_reference_id: String(booking._id),
          line_items: [
            {
              price_data: {
                currency,
                product_data: {
                  name: service.name,
                  description: `${service.duration} min with ${business.businessName || business.name}`,
                },
                unit_amount: amount,
              },
              quantity: 1,
            },
          ],
          success_url: successUrl,
          cancel_url: cancelUrl,
          metadata: {
            bookingId: String(booking._id),
            slug: business.slug,
          },
        });

        booking.stripeSessionId = session.id;
        checkoutUrl = session.url;
      } catch (stripeError) {
        console.error('Stripe Checkout session failed:', stripeError.message);
        checkoutUrl = buildStripePaymentUrl({
          email: normalizedCustomerEmail,
          bookingId: booking._id,
        });
        booking.stripeSessionId = String(booking._id);
      }

      await booking.save();

      res.status(201).json({
        message: 'Continue to payment',
        bookingId: booking._id,
        checkoutUrl,
      });
    } catch (error) {
      const errorMsg = error.type?.includes('Stripe') ? (error.raw?.message || error.message) : 'Server error: ' + error.message;
      res.status(error.statusCode || 500).json({ message: errorMsg, error: error.message });
    }
  };
  
  const confirmPaidBooking = async ({ booking, business, service, session }) => {
    if (booking.status === 'confirmed' && booking.paymentStatus === 'paid') {
      return booking;
    }
  
    const conflictingBookings = await bookingModel.find({
      _id: { $ne: booking._id },
      userId: booking.userId,
      date: booking.date,
      status: 'confirmed',
    });
  
    const hasConflict = conflictingBookings.some((candidate) => (
      checkOverlap(booking.startTime, booking.endTime, candidate.startTime, candidate.endTime)
    ));
  
    if (hasConflict) {
      booking.status = 'payment_failed';
      booking.paymentStatus = 'failed';
      await booking.save();
      throw new Error('This slot is no longer available. No booking was created.');
    }
  
    booking.status = 'confirmed';
    booking.paymentStatus = 'paid';
    booking.payoutStatus = booking.providerPayoutAmount > 0 ? 'available' : 'not_required';
  
    try {
      const calendarResult = await createBookingCalendarEvent({ business, service, booking });
      booking.googleEventId = calendarResult.googleEventId || '';
      booking.customerCalendarUrl = calendarResult.customerCalendarUrl || booking.customerCalendarUrl;
    } catch (calendarError) {
      console.error('Google Calendar confirmation failed:', calendarError.message);
    }
  
    await booking.save();
    await createBookingPayoutTransaction({
      booking,
      description: `Booking payment from ${booking.customerName || 'Customer'}`,
    });
  
    sendBookingNotification({ business, service, booking, type: 'confirmed' })
      .catch(emailError => console.error('Booking confirmation email failed:', emailError.message));
  
    return booking;
  };
  
  export const getBookingStatus = async (req, res) => {
    try {
      const { session_id: sessionId, booking_id: bookingId } = req.query;
      const query = sessionId ? { stripeSessionId: sessionId } : { _id: bookingId };
  
      if (!sessionId && !bookingId) {
        return res.status(400).json({ message: 'Booking identifier is required' });
      }
  
      let booking = await bookingModel.findOne(query).populate('serviceId', 'name duration price');
      if (!booking) {
        return res.status(404).json({ message: 'Booking not found' });
      }
  
      if (booking.status === 'pending_payment') {
        const stripe = getStripe();
        const stripeSessionId = sessionId || booking.stripeSessionId;
        let session = null;

        if (stripe && stripeSessionId && String(stripeSessionId).startsWith('cs_')) {
          session = await stripe.checkout.sessions.retrieve(stripeSessionId);
          if (session.payment_status !== 'paid') {
            return res.status(402).json({
              message: 'Payment is still pending. Complete checkout to confirm this booking.',
              booking,
            });
          }
        } else if (stripe && stripeSessionId) {
          return res.status(402).json({
            message: 'Payment is still pending. Complete checkout to confirm this booking.',
            booking,
          });
        }

        const [business, service] = await Promise.all([
          userModelSchema.findById(booking.userId),
          serviceModel.findById(booking.serviceId),
        ]);

        if (!business || !service) {
          return res.status(404).json({ message: 'Booking business or service was not found' });
        }

        await confirmPaidBooking({ booking, business, service, session });
        booking = await bookingModel.findById(booking._id).populate('serviceId', 'name duration price');
      }
  
      res.json({ booking });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  };
  
  export const cancelPublicBookingPayment = async (req, res) => {
    try {
      const { booking_id: bookingId } = req.body;
  
      if (!bookingId) {
        return res.status(400).json({ message: 'Booking identifier is required' });
      }
  
      const booking = await bookingModel.findOne({ _id: bookingId, status: 'pending_payment' });
      if (!booking) {
        return res.json({ message: 'No pending booking to cancel' });
      }
  
      booking.status = 'payment_failed';
      booking.paymentStatus = 'failed';
      await booking.save();
  
      res.json({ message: 'Payment was not completed. No booking was created.' });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  };