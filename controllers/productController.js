import Product from '../models/Product.js';
import APIFeatures from '../utils/apiFeatures.js';
import cloudinary from '../config/cloudinary.js';

export const getProducts = async (req, res, next) => {
  try {
    const totalCount = await Product.countDocuments();
    const features = new APIFeatures(Product.find(), req.query).search().filter().sort().limitFields().paginate();
    const products = await features.query;
    res.status(200).json({ success: true, count: products.length, totalCount, page: features.page, limit: features.limit, totalPages: Math.ceil(totalCount / features.limit), products });
  } catch (error) { next(error); }
};

export const getProduct = async (req, res, next) => {
  try {
    let product = await Product.findOne({ slug: req.params.identifier }).populate('reviews.user', 'name avatar');
    if (!product) product = await Product.findById(req.params.identifier).populate('reviews.user', 'name avatar');
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
    res.status(200).json({ success: true, product });
  } catch (error) { next(error); }
};

export const getFeaturedProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ isFeatured: true }).limit(8);
    res.status(200).json({ success: true, products });
  } catch (error) { next(error); }
};

export const getNewArrivals = async (req, res, next) => {
  try {
    const products = await Product.find({ isNewArrival: true }).sort('-createdAt').limit(8);
    res.status(200).json({ success: true, products });
  } catch (error) { next(error); }
};

export const createProduct = async (req, res, next) => {
  try {
    const images = req.files ? req.files.map((f) => ({ public_id: f.filename, url: f.path })) : [];
    const productData = {
      ...req.body,
      images,
      sizes: JSON.parse(req.body.sizes || '[]'),
      tags: req.body.tags ? req.body.tags.split(',').map((t) => t.trim()) : [],
      careInstructions: req.body.careInstructions ? req.body.careInstructions.split(',').map((c) => c.trim()) : [],
    };
    const product = await Product.create(productData);
    res.status(201).json({ success: true, product });
  } catch (error) { next(error); }
};

export const updateProduct = async (req, res, next) => {
  try {
    let product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
    if (req.files?.length > 0) {
      for (const img of product.images) await cloudinary.uploader.destroy(img.public_id);
      req.body.images = req.files.map((f) => ({ public_id: f.filename, url: f.path }));
    }
    if (req.body.sizes) req.body.sizes = JSON.parse(req.body.sizes);
    if (req.body.tags) req.body.tags = req.body.tags.split(',').map((t) => t.trim());
    product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.status(200).json({ success: true, product });
  } catch (error) { next(error); }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
    for (const img of product.images) await cloudinary.uploader.destroy(img.public_id);
    await product.deleteOne();
    res.status(200).json({ success: true, message: 'Product deleted.' });
  } catch (error) { next(error); }
};

export const addReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
    const existing = product.reviews.find((r) => r.user.toString() === req.user._id.toString());
    if (existing) { existing.rating = rating; existing.comment = comment; }
    else product.reviews.push({ user: req.user._id, name: req.user.name, avatar: req.user.avatar?.url, rating, comment });
    product.numReviews = product.reviews.length;
    product.ratings = product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.numReviews;
    await product.save();
    res.status(200).json({ success: true, message: 'Review submitted.' });
  } catch (error) { next(error); }
};

export const deleteReview = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
    const review = product.reviews.id(req.params.reviewId);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found.' });
    if (req.user.role !== 'admin' && review.user.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    review.deleteOne();
    product.numReviews = product.reviews.length;
    product.ratings = product.numReviews > 0 ? product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.numReviews : 0;
    await product.save();
    res.status(200).json({ success: true, message: 'Review deleted.' });
  } catch (error) { next(error); }
};
