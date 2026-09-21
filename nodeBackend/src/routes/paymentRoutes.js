import express from 'express'
import { getPaymentOverview, updatePayoutDetails, requestWithdrawal } from '../controllers/paymentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getPaymentOverview);
router.put('/payout-details', protect, updatePayoutDetails);
router.post('/withdrawal', protect, requestWithdrawal);

export default router;