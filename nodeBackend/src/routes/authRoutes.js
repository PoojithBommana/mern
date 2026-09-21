import {registerUser, requestOtp, verifyOtpController, loginUser, getUserProfile, updateProfile} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import express from 'express';

const router = express.Router();

router.post('/request-otp', requestOtp);
router.post('/verify-otp', verifyOtpController);
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateProfile);

export default router;
