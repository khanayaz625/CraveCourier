import express from 'express';
import {
  createOrder,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
  getAllOrders
} from '../controllers/orderController.js';
import { protect, restaurantOrAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createOrder);
router.get('/myorders', protect, getMyOrders);
router.get('/:id', getOrderById); // public/protected with order ID
router.put('/:id/status', protect, updateOrderStatus);
router.get('/', protect, restaurantOrAdmin, getAllOrders);

export default router;
