import Stripe from 'stripe';
import Order from '../models/Order.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createPaymentIntent = async (req, res, next) => {
  try {
    const { amount, currency = 'inr' } = req.body;
    if (!amount || amount <= 0)
      return res.status(400).json({ success: false, message: 'Invalid amount.' });
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency,
      metadata: { userId: req.user._id.toString() },
    });
    res.status(200).json({ success: true, clientSecret: paymentIntent.client_secret, paymentIntentId: paymentIntent.id });
  } catch (error) { next(error); }
};

export const verifyPayment = async (req, res, next) => {
  try {
    const { paymentIntentId, orderId } = req.body;
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (paymentIntent.status === 'succeeded') {
      const order = await Order.findById(orderId);
      if (order) {
        order.paymentStatus = 'paid';
        order.paymentInfo = { id: paymentIntentId, status: 'paid', method: 'stripe' };
        order.paidAt = Date.now();
        await order.save();
      }
      return res.status(200).json({ success: true, message: 'Payment verified.' });
    }
    res.status(400).json({ success: false, message: 'Payment not completed.' });
  } catch (error) { next(error); }
};

export const stripeWebhook = async (req, res, next) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).json({ success: false, message: `Webhook error: ${err.message}` });
  }
  if (event.type === 'payment_intent.succeeded') {
    await Order.findOneAndUpdate({ 'paymentInfo.id': event.data.object.id }, { paymentStatus: 'paid', paidAt: Date.now() });
  }
  res.status(200).json({ received: true });
};

export const getStripeConfig = (req, res) => {
  res.status(200).json({ success: true, publishableKey: process.env.STRIPE_PUBLISHABLE_KEY });
};
