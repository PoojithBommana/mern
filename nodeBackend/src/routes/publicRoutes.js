import express from 'express';

import {createPublicBooking, getBookingStatus, cancelPublicBookingPayment ,getPublicBookingPage, getPublicServices, requestPublicBookingOtp, verifyPublicBookingOtp, getPublicSlots} from '../controllers/publicController.js';

const router = express.Router();

router.get('/booking/status', getBookingStatus);
router.post('/booking/cancel-payment', cancelPublicBookingPayment);

router.get('/:slug', getPublicBookingPage);
router.get('/:slug/services', getPublicServices);
router.get('/:slug/slots', getPublicSlots);

router.post('/:slug/request-otp', requestPublicBookingOtp);
router.post('/:slug/verify-otp', verifyPublicBookingOtp);

router.post('/:slug/book', createPublicBooking);

export default router;