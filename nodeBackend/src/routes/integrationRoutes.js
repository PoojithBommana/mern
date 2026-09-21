import express from 'express';
import { getoAuthGoogleUrl, handleGoogleCallback } from '../controllers/integrationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/google/auth', protect, getoAuthGoogleUrl);
router.get('/google/callback', handleGoogleCallback);

export default router;