import express from 'express';
const router = express.Router();
import {
  createOpportunity,
  searchOpportunities,
  getOpportunities,
  getOpportunity,
  updateOpportunity,
  deleteOpportunity,
  getMyOpportunities,
  getMyOpportunitiesWithStats,
} from '../controllers/opportunityController.js';
import { protect, authorize } from '../middleware/auth.js';
import { uploadOpportunityImages } from '../middleware/upload.js';




// Public routes
router.get('/search', searchOpportunities);
router.get('/', getOpportunities);
router.get('/:id', getOpportunity);

// Protected routes (Organization only)
router.post('/', protect, authorize('organization'), uploadOpportunityImages, createOpportunity);
router.get('/my-opportunities', protect, authorize('organization'), getMyOpportunities);
router.get('/my-opportunities/stats', protect, authorize('organization'), getMyOpportunitiesWithStats);
router.put('/:id', protect, authorize('organization'), uploadOpportunityImages, updateOpportunity);
router.delete('/:id', protect, deleteOpportunity);

export default router;
