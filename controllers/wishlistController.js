import User from '../models/User.js';

export const getWishlist = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('wishlist', 'name images price discountPrice slug ratings numReviews');
    res.status(200).json({ success: true, wishlist: user.wishlist });
  } catch (error) { next(error); }
};

export const toggleWishlist = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const productId = req.params.productId;
    const index = user.wishlist.indexOf(productId);
    if (index === -1) user.wishlist.push(productId);
    else user.wishlist.splice(index, 1);
    await user.save();
    const updated = await User.findById(req.user._id).populate('wishlist', 'name images price discountPrice slug ratings numReviews');
    res.status(200).json({ success: true, message: index === -1 ? 'Added to wishlist.' : 'Removed from wishlist.', wishlist: updated.wishlist });
  } catch (error) { next(error); }
};

export const removeFromWishlist = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { $pull: { wishlist: req.params.productId } });
    res.status(200).json({ success: true, message: 'Removed from wishlist.' });
  } catch (error) { next(error); }
};
