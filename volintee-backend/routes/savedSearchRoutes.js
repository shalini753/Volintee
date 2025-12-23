import express from 'express';
const router = express.Router();
import {
  createSavedSearch,
  getSavedSearches,
  updateSavedSearch,
  deleteSavedSearch,
} from '../controllers/savedSearchController.js';
import { protect } from '../middleware/auth.js';

// All routes are protected
router.use(protect);

router.post('/', createSavedSearch);
router.get('/', getSavedSearches);
router.put('/:id', updateSavedSearch);
router.delete('/:id', deleteSavedSearch);

export default router;

