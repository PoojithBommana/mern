import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { listBookings, updateBookingStatus, rescheduleBooking } from '../controllers/bookingController.js';

const router = express.Router();

// All booking routes require authentication
router.get('/', protect, listBookings);
router.put('/:id/status', protect, updateBookingStatus);
router.put('/:id/reschedule', protect, rescheduleBooking);

export default router;
