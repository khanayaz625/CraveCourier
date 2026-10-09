import express from 'express';
import { 
  getAdminStats, 
  getAllUsers,
  updateUserRole,
  deleteUser,
  createAdminUser,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
  deleteOrder,
  getCoupons,
  createCoupon,
  deleteCoupon
} from '../controllers/adminController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Stats & Analytics
router.get('/stats', protect, admin, getAdminStats);

// User Management
router.get('/users', protect, admin, getAllUsers);
router.post('/users', protect, admin, createAdminUser);
router.put('/users/:id/role', protect, admin, updateUserRole);
router.delete('/users/:id', protect, admin, deleteUser);

// Restaurant Management
router.post('/restaurants', protect, admin, createRestaurant);
router.put('/restaurants/:id', protect, admin, updateRestaurant);
router.delete('/restaurants/:id', protect, admin, deleteRestaurant);

// Orders Management
router.delete('/orders/:id', protect, admin, deleteOrder);

// Coupons Management
router.get('/coupons', protect, admin, getCoupons);
router.post('/coupons', protect, admin, createCoupon);
router.delete('/coupons/:code', protect, admin, deleteCoupon);

export default router;
