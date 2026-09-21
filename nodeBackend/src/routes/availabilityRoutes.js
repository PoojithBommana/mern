import express from 'express';
import { listAvailabilities, saveAvailability } from '../controllers/availabilityController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, listAvailabilities);
router.post('/', protect, saveAvailability);


export default router;