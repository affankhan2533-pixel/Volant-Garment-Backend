import express from 'express';
import { createPaymentIntent, verifyPayment, stripeWebhook, getStripeConfig } from '../controllers/paymentController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();
router.get('/config', getStripeConfig);
router.post('/webhook', express.raw({ type: 'application/json' }), stripeWebhook);
router.post('/create-intent', protect, createPaymentIntent);
router.post('/verify', protect, verifyPayment);

export default router;
