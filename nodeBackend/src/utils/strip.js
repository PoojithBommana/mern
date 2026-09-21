import Stripe from 'stripe';

export const DEFAULT_STRIPE_PAYMENT_LINK =
  'https://buy.stripe.com/test_7sYeVc3TQeDm0XEgkt8Zq00';

export const getStripePaymentLink = () =>
  String(process.env.STRIPE_PAYMENT_LINK || DEFAULT_STRIPE_PAYMENT_LINK).trim();

export const getClientUrl = () =>
  String(process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/$/, '');

export const buildStripePaymentUrl = ({ email, bookingId } = {}) => {
  const url = new URL(getStripePaymentLink());
  if (email) url.searchParams.set('prefilled_email', email);
  if (bookingId) url.searchParams.set('client_reference_id', String(bookingId));
  return url.toString();
};

export const getStripe = () => {
  const key = String(process.env.STRIPE_SECRET_KEY || '').trim();

  if (!key || key.startsWith('pk_')) {
    return null;
  }

  return new Stripe(key);
};

export const toStripAmount = (price) => Math.round(Number(price || 0) * 100);
