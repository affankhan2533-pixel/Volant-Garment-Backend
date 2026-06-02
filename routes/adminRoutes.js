import express from 'express';
import { getDashboardStats, getAllUsers, getUser, updateUserRole, deleteUser } from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();
router.use(protect, authorize('admin'));
router.get('/stats', getDashboardStats);
router.get('/users', getAllUsers);
router.get('/users/:id', getUser);
router.put('/users/:id', updateUserRole);
router.delete('/users/:id', deleteUser);

export default router;
