import express from 'express';
import { updateProfile, updatePassword, getUserDashboard } from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.put('/profile', protect, updateProfile);
router.put('/password', protect, updatePassword);
router.get('/dashboard', protect, getUserDashboard);

export default router;
