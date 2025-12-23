import express from 'express';
const router = express.Router();
import {
  updateProfile,
  getUserProfile,
  getMyApplications,
  getVolunteerHistory,
  getUsers,
} from '../controllers/userController.js';
import { protect, authorize } from '../middleware/auth.js';
import { uploadProfilePicture } from '../middleware/upload.js';

// Public routes
router.get('/:id', getUserProfile);

// Protected routes
router.put('/profile', protect, uploadProfilePicture, updateProfile);
router.get('/me/applications', protect, getMyApplications);
router.get('/me/history', protect, getVolunteerHistory);

// Admin routes
router.get('/', protect, authorize('admin'), getUsers);

export default router;

