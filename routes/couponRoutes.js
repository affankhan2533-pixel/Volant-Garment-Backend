import express from 'express';
import { validateCoupon, createCoupon, getAllCoupons, deleteCoupon } from '../controllers/couponController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();
router.post('/validate', protect, validateCoupon);
router.post('/', protect, authorize('admin'), createCoupon);
router.get('/', protect, authorize('admin'), getAllCoupons);
router.delete('/:id', protect, authorize('admin'), deleteCoupon);

export default router;
