import SavedSearch from '../models/SavedSearch.js';
import asyncHandler from '../middleware/asyncHandler.js';
import { validateObjectId, sanitizeString } from '../middleware/validator.js';

/**
 * @desc    Create a saved search
 * @route   POST /api/saved-searches
 * @access  Private
 */
export const createSavedSearch = asyncHandler(async (req, res, next) => {
  const { name, filters } = req.body;

  if (!name || !sanitizeString(name)) {
    return res.status(400).json({
      success: false,
      message: 'Search name is required',
    });
  }

  const savedSearch = await SavedSearch.create({
    user: req.user.id,
    name: sanitizeString(name, 100),
    filters: filters && typeof filters === 'object' ? filters : {},
  });

  res.status(201).json({
    success: true,
    data: savedSearch,
  });
});

/**
 * @desc    Get user's saved searches
 * @route   GET /api/saved-searches
 * @access  Private
 */
export const getSavedSearches = asyncHandler(async (req, res, next) => {
  const { isActive } = req.query;

  const query = { user: req.user.id };
  if (isActive !== undefined) {
    query.isActive = isActive === 'true';
  }

  const savedSearches = await SavedSearch.find(query).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: savedSearches.length,
    data: savedSearches,
  });
});

/**
 * @desc    Update saved search
 * @route   PUT /api/saved-searches/:id
 * @access  Private
 */
export const updateSavedSearch = asyncHandler(async (req, res, next) => {
  // Validate ObjectId
  if (!validateObjectId(req.params.id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid saved search ID format',
    });
  }

  const savedSearch = await SavedSearch.findById(req.params.id);

  if (!savedSearch) {
    return res.status(404).json({
      success: false,
      message: 'Saved search not found',
    });
  }

  if (!savedSearch.user || savedSearch.user.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this saved search',
    });
  }

  const { name, filters, isActive } = req.body;
  if (name) savedSearch.name = sanitizeString(name, 100);
  if (filters && typeof filters === 'object') savedSearch.filters = filters;
  if (isActive !== undefined) savedSearch.isActive = Boolean(isActive);

  await savedSearch.save();

  res.status(200).json({
    success: true,
    data: savedSearch,
  });
});

/**
 * @desc    Delete saved search
 * @route   DELETE /api/saved-searches/:id
 * @access  Private
 */
export const deleteSavedSearch = asyncHandler(async (req, res, next) => {
  // Validate ObjectId
  if (!validateObjectId(req.params.id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid saved search ID format',
    });
  }

  const savedSearch = await SavedSearch.findById(req.params.id);

  if (!savedSearch) {
    return res.status(404).json({
      success: false,
      message: 'Saved search not found',
    });
  }

  if (!savedSearch.user || savedSearch.user.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to delete this saved search',
    });
  }

  await savedSearch.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Saved search deleted successfully',
  });
});

