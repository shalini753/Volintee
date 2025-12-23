import Review from '../models/Review.js';
import User from '../models/User.js';
import Application from '../models/Application.js';
import asyncHandler from '../middleware/asyncHandler.js';
import { notifyNewReview } from '../utils/createNotification.js';
import { validateObjectId, validatePagination, sanitizeString } from '../middleware/validator.js';

/**
 * @desc    Create a review
 * @route   POST /api/reviews
 * @access  Private
 */
export const createReview = asyncHandler(async (req, res, next) => {
  const { revieweeId, opportunityId, rating, comment, reviewType } = req.body;

  // Validate required fields
  if (!revieweeId || !rating || !reviewType) {
    return res.status(400).json({
      success: false,
      message: 'Please provide revieweeId, rating, and reviewType',
    });
  }

  // Validate ObjectIds
  if (!validateObjectId(revieweeId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid reviewee ID format',
    });
  }

  if (opportunityId && !validateObjectId(opportunityId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid opportunity ID format',
    });
  }

  // Validate rating
  const ratingNum = parseInt(rating);
  if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
    return res.status(400).json({
      success: false,
      message: 'Rating must be a number between 1 and 5',
    });
  }

  // Validate reviewType
  if (!['volunteer-to-org', 'org-to-volunteer'].includes(reviewType)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid reviewType. Must be "volunteer-to-org" or "org-to-volunteer"',
    });
  }

  // Can't review yourself
  if (revieweeId.toString() === req.user.id.toString()) {
    return res.status(400).json({
      success: false,
      message: 'You cannot review yourself',
    });
  }

  // Check if reviewee exists
  const reviewee = await User.findById(revieweeId);
  if (!reviewee) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
    });
  }

  // Verify review type matches roles
  if (reviewType === 'volunteer-to-org' && reviewee.role !== 'organization') {
    return res.status(400).json({
      success: false,
      message: 'Review type does not match reviewee role',
    });
  }

  if (reviewType === 'org-to-volunteer' && reviewee.role !== 'volunteer') {
    return res.status(400).json({
      success: false,
      message: 'Review type does not match reviewee role',
    });
  }

  // Check if already reviewed
  if (opportunityId) {
    const existingReview = await Review.findOne({
      reviewer: req.user.id,
      reviewee: revieweeId,
      opportunity: opportunityId,
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this user for this opportunity',
      });
    }

    // Verify reviewer participated in the opportunity
    const application = await Application.findOne({
      opportunity: opportunityId,
      volunteer: reviewType === 'org-to-volunteer' ? revieweeId : req.user.id,
      status: { $in: ['approved', 'completed'] },
    });

    if (!application) {
      return res.status(400).json({
        success: false,
        message: 'You can only review users you have worked with on this opportunity',
      });
    }
  } else {
    // For reviews without opportunity, check if user has already reviewed this reviewee
    // Limit to one general review per reviewer-reviewee pair
    const existingReview = await Review.findOne({
      reviewer: req.user.id,
      reviewee: revieweeId,
      opportunity: null,
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this user. Please review them for a specific opportunity instead.',
      });
    }
  }

  // Sanitize comment
  const sanitizedComment = comment ? sanitizeString(comment, 1000) : '';

  // Create review
  const review = await Review.create({
    reviewer: req.user.id,
    reviewee: revieweeId,
    reviewType,
    opportunity: opportunityId || null,
    rating: ratingNum,
    comment: sanitizedComment,
    isVerified: opportunityId ? true : false,
  });

  // Update reviewee's rating incrementally (more efficient than recalculating all reviews)
  const user = await User.findById(revieweeId);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
    });
  }

  // Calculate new average incrementally
  const currentTotal = user.rating.average * user.rating.count;
  const newTotal = currentTotal + ratingNum;
  const newCount = user.rating.count + 1;
  const newAverage = Math.round((newTotal / newCount) * 10) / 10;

  await User.findByIdAndUpdate(revieweeId, {
    'rating.average': newAverage,
    'rating.count': newCount,
  });

  // Send notification
  await notifyNewReview(revieweeId, req.user.name, rating);

  // Populate review data
  await review.populate('reviewer', 'name email profilePicture');
  await review.populate('reviewee', 'name email profilePicture');

  res.status(201).json({
    success: true,
    data: review,
  });
});

/**
 * @desc    Get reviews for a user
 * @route   GET /api/reviews/user/:userId
 * @access  Public
 */
export const getUserReviews = asyncHandler(async (req, res, next) => {
  // Validate userId
  if (!validateObjectId(req.params.userId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid user ID format',
    });
  }

  const { reviewType, page, limit } = req.query;

  // Validate pagination
  const { page: validPage, limit: validLimit } = validatePagination(page, limit);

  const query = { reviewee: req.params.userId };
  if (reviewType && ['volunteer-to-org', 'org-to-volunteer'].includes(reviewType)) {
    query.reviewType = reviewType;
  }

  const skip = (validPage - 1) * validLimit;

  const reviews = await Review.find(query)
    .populate('reviewer', 'name email profilePicture')
    .populate('opportunity', 'title')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(validLimit);

  const total = await Review.countDocuments(query);

  res.status(200).json({
    success: true,
    count: reviews.length,
    total,
    page: validPage,
    pages: Math.ceil(total / validLimit),
    data: reviews,
  });
});

/**
 * @desc    Get single review
 * @route   GET /api/reviews/:id
 * @access  Public
 */
export const getReview = asyncHandler(async (req, res, next) => {
  // Validate ObjectId
  if (!validateObjectId(req.params.id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid review ID format',
    });
  }

  const review = await Review.findById(req.params.id)
    .populate('reviewer', 'name email profilePicture')
    .populate('reviewee', 'name email profilePicture')
    .populate('opportunity', 'title');

  if (!review) {
    return res.status(404).json({
      success: false,
      message: 'Review not found',
    });
  }

  res.status(200).json({
    success: true,
    data: review,
  });
});

