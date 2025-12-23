import express from 'express';
const router = express.Router();
import {
  createReview,
  getUserReviews,
  getReview,
} from '../controllers/reviewController.js';
import { protect } from '../middleware/auth.js';

// Public routes
router.get('/user/:userId', getUserReviews);
router.get('/:id', getReview);

// Protected routes
router.post('/', protect, createReview);

export default router;

