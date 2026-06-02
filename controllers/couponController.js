import Coupon from '../models/Coupon.js';

export const validateCoupon = async (req, res, next) => {
  try {
    const { code, orderAmount } = req.body;
    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
    if (!coupon) return res.status(404).json({ success: false, message: 'Invalid coupon code.' });
    if (new Date() > coupon.expiresAt) return res.status(400).json({ success: false, message: 'Coupon has expired.' });
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit)
      return res.status(400).json({ success: false, message: 'Coupon usage limit reached.' });
    if (coupon.usedBy.includes(req.user._id))
      return res.status(400).json({ success: false, message: 'You have already used this coupon.' });
    if (orderAmount < coupon.minOrderAmount)
      return res.status(400).json({ success: false, message: `Minimum order amount of ₹${coupon.minOrderAmount} required.` });
    let discountAmount = coupon.discountType === 'percentage'
      ? (orderAmount * coupon.discountValue) / 100
      : coupon.discountValue;
    if (coupon.maxDiscountAmount) discountAmount = Math.min(discountAmount, coupon.maxDiscountAmount);
    res.status(200).json({ success: true, coupon: { code: coupon.code, discountType: coupon.discountType, discountValue: coupon.discountValue, discountAmount } });
  } catch (error) { next(error); }
};

export const createCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.create(req.body);
    res.status(201).json({ success: true, coupon });
  } catch (error) { next(error); }
};

export const getAllCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find().sort('-createdAt');
    res.status(200).json({ success: true, coupons });
  } catch (error) { next(error); }
};

export const deleteCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found.' });
    res.status(200).json({ success: true, message: 'Coupon deleted.' });
  } catch (error) { next(error); }
};
