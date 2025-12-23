import express from 'express';
const router = express.Router();
import {
  getDashboardStats,
  updateUserStatus,
  verifyOrganization,
  featureOpportunity,
  getOrganizations,
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/auth.js';

// All routes are admin only
router.use(protect);
router.use(authorize('admin'));

router.get('/dashboard', getDashboardStats);
router.put('/users/:id/status', updateUserStatus);
router.put('/organizations/:id/verify', verifyOrganization);
router.put('/opportunities/:id/feature', featureOpportunity);
router.get('/organizations', getOrganizations);

export default router;

