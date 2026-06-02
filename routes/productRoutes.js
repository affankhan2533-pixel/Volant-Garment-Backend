import express from 'express';
import { getProducts, getProduct, getFeaturedProducts, getNewArrivals, createProduct, updateProduct, deleteProduct, addReview, deleteReview } from '../controllers/productController.js';
import { protect, authorize } from '../middleware/auth.js';
import { uploadProductImages } from '../middleware/upload.js';

const router = express.Router();

router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/new-arrivals', getNewArrivals);
router.get('/:identifier', getProduct);

router.post('/:id/reviews', protect, addReview);
router.delete('/:id/reviews/:reviewId', protect, deleteReview);

router.post('/', protect, authorize('admin'), uploadProductImages, createProduct);
router.put('/:id', protect, authorize('admin'), uploadProductImages, updateProduct);
router.delete('/:id', protect, authorize('admin'), deleteProduct);

export default router;
