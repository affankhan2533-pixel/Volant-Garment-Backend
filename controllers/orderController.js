import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import Coupon from '../models/Coupon.js';
import User from '../models/User.js';
import { sendOrderConfirmationEmail } from '../utils/sendEmail.js';

export const createOrder = async (req, res, next) => {
  try {
    const { orderItems, shippingInfo, paymentInfo, couponCode, itemsPrice, taxPrice, shippingPrice, totalAmount } = req.body;
    if (!orderItems?.length) return res.status(400).json({ success: false, message: 'No order items.' });
    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      if (!product) return res.status(404).json({ success: false, message: `Product not found: ${item.product}` });
      const sizeData = product.sizes.find((s) => s.size === item.size);
      if (!sizeData || sizeData.stock < item.quantity)
        return res.status(400).json({ success: false, message: `Insufficient stock for ${product.name} (${item.size}).` });
      sizeData.stock -= item.quantity;
      await product.save();
    }
    let discountAmount = 0;
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
      if (coupon && new Date() < coupon.expiresAt) {
        discountAmount = coupon.discountType === 'percentage'
          ? Math.min((itemsPrice * coupon.discountValue) / 100, coupon.maxDiscountAmount || Infinity)
          : coupon.discountValue;
        coupon.usedCount += 1;
        coupon.usedBy.push(req.user._id);
        await coupon.save();
      }
    }
    const order = await Order.create({
      user: req.user._id, orderItems, shippingInfo, paymentInfo, couponCode,
      itemsPrice, taxPrice, shippingPrice, discountAmount, totalAmount,
      paidAt: paymentInfo?.status === 'paid' ? Date.now() : undefined,
      paymentStatus: paymentInfo?.status === 'paid' ? 'paid' : 'pending',
    });
    await User.findByIdAndUpdate(req.user._id, { $push: { orders: order._id } });
    await Cart.findOneAndDelete({ user: req.user._id });
    sendOrderConfirmationEmail(req.user, order).catch(console.error);
    res.status(201).json({ success: true, order });
  } catch (error) { next(error); }
};

export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort('-createdAt').populate('orderItems.product', 'name images slug');
    res.status(200).json({ success: true, orders });
  } catch (error) { next(error); }
};

export const getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('orderItems.product', 'name images slug');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin')
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    res.status(200).json({ success: true, order });
  } catch (error) { next(error); }
};

export const getAllOrders = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const filter = {};
    if (req.query.status) filter.orderStatus = req.query.status;
    const totalCount = await Order.countDocuments(filter);
    const orders = await Order.find(filter).sort('-createdAt').skip((page - 1) * limit).limit(limit).populate('user', 'name email');
    res.status(200).json({ success: true, totalCount, page, totalPages: Math.ceil(totalCount / limit), orders });
  } catch (error) { next(error); }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
    order.orderStatus = req.body.orderStatus;
    if (req.body.trackingNumber) order.trackingNumber = req.body.trackingNumber;
    if (req.body.orderStatus === 'delivered') order.deliveredAt = Date.now();
    await order.save();
    res.status(200).json({ success: true, order });
  } catch (error) { next(error); }
};

export const cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin')
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    if (['shipped', 'delivered'].includes(order.orderStatus))
      return res.status(400).json({ success: false, message: 'Cannot cancel a shipped or delivered order.' });
    for (const item of order.orderItems) {
      const product = await Product.findById(item.product);
      if (product) {
        const sizeData = product.sizes.find((s) => s.size === item.size);
        if (sizeData) sizeData.stock += item.quantity;
        await product.save();
      }
    }
    order.orderStatus = 'cancelled';
    await order.save();
    res.status(200).json({ success: true, message: 'Order cancelled.', order });
  } catch (error) { next(error); }
};
