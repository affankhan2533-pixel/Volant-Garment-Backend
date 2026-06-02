import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const addressSchema = new mongoose.Schema({
  fullName:    { type: String, required: true },
  phone:       { type: String, required: true },
  addressLine1:{ type: String, required: true },
  addressLine2:{ type: String },
  city:        { type: String, required: true },
  state:       { type: String, required: true },
  postalCode:  { type: String, required: true },
  country:     { type: String, required: true, default: 'India' },
  isDefault:   { type: Boolean, default: false },
});

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    avatar: {
      public_id: { type: String },
      url:       { type: String, default: '' },
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    addresses: [addressSchema],
    wishlist:  [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    orders:    [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }],
    refreshToken:       { type: String, select: false },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  { timestamps: true }
);

// ── Hash password before saving ──────────────────────────────────────────────
// Mongoose 8 async pre-hooks: do NOT call next(), just return the promise
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// ── Compare entered password with stored hash ────────────────────────────────
userSchema.methods.comparePassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
