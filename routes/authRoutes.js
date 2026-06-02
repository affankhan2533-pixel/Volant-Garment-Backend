import express from 'express';
import { body, validationResult } from 'express-validator';
import {
  register, login, logout, refreshToken,
  getMe, updateProfile, changePassword,
  addAddress, deleteAddress,
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { uploadAvatar } from '../middleware/upload.js';

const router = express.Router();

/**
 * Inline validation runner — compatible with Express 5
 * Runs all validators then checks results in one middleware
 */
const runValidation = (validators) => async (req, res, next) => {
  for (const validator of validators) {
    await validator.run(req);
  }
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg,
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

const registerValidators = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

const loginValidators = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

// Public routes
router.post('/register', runValidation(registerValidators), register);
router.post('/login',    runValidation(loginValidators),    login);
router.post('/refresh-token', refreshToken);

// Protected routes
router.use(protect);
router.post('/logout', logout);
router.get('/me', getMe);
router.put('/update-profile', uploadAvatar, updateProfile);
router.put('/change-password', changePassword);
router.post('/address', addAddress);
router.delete('/address/:addressId', deleteAddress);

export default router;
