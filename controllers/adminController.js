import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';

export const getDashboardStats = async (req, res, next) => {
  try {
    const [totalUsers, totalProducts, totalOrders, revenueData, recentOrders, lowStockProducts] =
      await Promise.all([
        User.countDocuments({ role: 'user' }),
        Product.countDocuments(),
        Order.countDocuments(),
        Order.aggregate([{ $match: { paymentStatus: 'paid' } }, { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }]),
        Order.find().sort('-createdAt').limit(5).populate('user', 'name email'),
        Product.find({ totalStock: { $lt: 10 } }).select('name totalStock images'),
      ]);

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyRevenue = await Order.aggregate([
      { $match: { paymentStatus: 'paid', createdAt: { $gte: sixMonthsAgo } } },
      { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, revenue: { $sum: '$totalAmount' }, orders: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const orderStatusBreakdown = await Order.aggregate([
      { $group: { _id: '$orderStatus', count: { $sum: 1 } } },
    ]);

    res.status(200).json({
      success: true,
      stats: { totalUsers, totalProducts, totalOrders, totalRevenue: revenueData[0]?.totalRevenue || 0 },
      recentOrders, lowStockProducts, monthlyRevenue, orderStatusBreakdown,
    });
  } catch (error) { next(error); }
};

export const getAllUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const totalCount = await User.countDocuments();
    const users = await User.find().select('-password -refreshToken').sort('-createdAt').skip((page - 1) * limit).limit(limit);
    res.status(200).json({ success: true, totalCount, page, totalPages: Math.ceil(totalCount / limit), users });
  } catch (error) { next(error); }
};

export const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password -refreshToken').populate('orders');
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    res.status(200).json({ success: true, user });
  } catch (error) { next(error); }
};

export const updateUserRole = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { role: req.body.role }, { new: true, runValidators: true }).select('-password -refreshToken');
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    res.status(200).json({ success: true, user });
  } catch (error) { next(error); }
};

export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    if (user._id.toString() === req.user._id.toString())
      return res.status(400).json({ success: false, message: 'Cannot delete your own account.' });
    await user.deleteOne();
    res.status(200).json({ success: true, message: 'User deleted.' });
  } catch (error) { next(error); }
};
