import express from 'express';
import {
  getFoods,
  getCategories,
  getFoodById,
  createFood,
  updateFood,
  deleteFood
} from '../controllers/foodController.js';
import { protect, restaurantOrAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getFoods);
router.get('/categories', getCategories);
router.get('/:id', getFoodById);
router.post('/', protect, restaurantOrAdmin, createFood);
router.put('/:id', protect, restaurantOrAdmin, updateFood);
router.delete('/:id', protect, restaurantOrAdmin, deleteFood);

export default router;
