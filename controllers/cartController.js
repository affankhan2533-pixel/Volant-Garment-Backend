import Cart from '../models/Cart.js';
import Product from '../models/Product.js';

export const getCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product', 'name images price discountPrice slug sizes');
    if (!cart) return res.status(200).json({ success: true, cart: { items: [], totalPrice: 0, totalItems: 0 } });
    res.status(200).json({ success: true, cart });
  } catch (error) { next(error); }
};

export const addToCart = async (req, res, next) => {
  try {
    const { productId, size, quantity = 1 } = req.body;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
    const sizeData = product.sizes.find((s) => s.size === size);
    if (!sizeData || sizeData.stock < quantity)
      return res.status(400).json({ success: false, message: 'Insufficient stock for selected size.' });
    const price = product.discountPrice || product.price;
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) cart = new Cart({ user: req.user._id, items: [] });
    const existing = cart.items.find((i) => i.product.toString() === productId && i.size === size);
    if (existing) { existing.quantity += quantity; existing.price = price; }
    else cart.items.push({ product: productId, size, quantity, price });
    await cart.save();
    const populated = await Cart.findById(cart._id).populate('items.product', 'name images price discountPrice slug');
    res.status(200).json({ success: true, cart: populated });
  } catch (error) { next(error); }
};

export const updateCartItem = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found.' });
    const item = cart.items.id(req.params.itemId);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found.' });
    if (quantity <= 0) item.deleteOne();
    else item.quantity = quantity;
    await cart.save();
    const populated = await Cart.findById(cart._id).populate('items.product', 'name images price discountPrice slug');
    res.status(200).json({ success: true, cart: populated });
  } catch (error) { next(error); }
};

export const removeFromCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found.' });
    const item = cart.items.id(req.params.itemId);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found.' });
    item.deleteOne();
    await cart.save();
    const populated = await Cart.findById(cart._id).populate('items.product', 'name images price discountPrice slug');
    res.status(200).json({ success: true, cart: populated });
  } catch (error) { next(error); }
};

export const clearCart = async (req, res, next) => {
  try {
    await Cart.findOneAndDelete({ user: req.user._id });
    res.status(200).json({ success: true, message: 'Cart cleared.' });
  } catch (error) { next(error); }
};
