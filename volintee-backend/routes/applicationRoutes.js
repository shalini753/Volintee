import express from 'express';
const router = express.Router();
import {
  createApplication,
  getOpportunityApplications,
  updateApplicationStatus,
  withdrawApplication,
  getApplication,
  checkApplicationStatus,
  getMyApplications,
} from '../controllers/applicationController.js';
import { protect, authorize } from '../middleware/auth.js';

// All routes are protected
router.use(protect);

// Volunteer routes
router.post('/', authorize('volunteer'), createApplication);
router.get('/my-applications', authorize('volunteer'), getMyApplications);
router.get('/me/opportunity/:opportunityId', authorize('volunteer'), checkApplicationStatus);
router.put('/:id/withdraw', authorize('volunteer'), withdrawApplication);

// Organization routes
router.get('/opportunity/:opportunityId', authorize('organization'), getOpportunityApplications);
router.put('/:id/status', authorize('organization'), updateApplicationStatus);

// General routes
router.get('/:id', getApplication);

export default router;

