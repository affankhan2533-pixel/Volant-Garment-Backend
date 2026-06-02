import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    avatar: { type: String },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, maxlength: 500 },
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    slug: { type: String, unique: true, lowercase: true },
    description: { type: String, required: true, maxlength: 2000 },
    shortDescription: { type: String, maxlength: 300 },
    price: { type: Number, required: true, min: 0 },
    discountPrice: { type: Number, min: 0 },
    images: [{ public_id: { type: String, required: true }, url: { type: String, required: true } }],
    category: {
      type: String,
      required: true,
      enum: ['casual', 'formal', 'luxury', 'limited-edition', 'streetwear', 'classic'],
    },
    sizes: [{
      size: { type: String, enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'], required: true },
      stock: { type: Number, required: true, min: 0, default: 0 },
    }],
    totalStock: { type: Number, default: 0 },
    fabric: { type: String },
    fit: { type: String, enum: ['slim', 'regular', 'oversized', 'relaxed'] },
    color: { type: String },
    careInstructions: [String],
    ratings: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    reviews: [reviewSchema],
    isFeatured: { type: Boolean, default: false },
    isNewArrival: { type: Boolean, default: false },
    isBestSeller: { type: Boolean, default: false },
    tags: [String],
    sku: { type: String, unique: true, sparse: true },
  },
  { timestamps: true }
);

productSchema.pre('save', function () {
  if (this.isModified('name')) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
  if (this.sizes && this.sizes.length > 0) {
    this.totalStock = this.sizes.reduce((acc, s) => acc + s.stock, 0);
  }
});

productSchema.index({ name: 'text', description: 'text', tags: 'text' });

const Product = mongoose.model('Product', productSchema);
export default Product;
