import User from '../models/User.js';
import Opportunity from '../models/Opportunity.js';
import Organization from '../models/Organization.js';
import Application from '../models/Application.js';
import Review from '../models/Review.js';
import asyncHandler from '../middleware/asyncHandler.js';
import { validateObjectId, validatePagination, sanitizeString } from '../middleware/validator.js';

/**
 * @desc    Get dashboard statistics
 * @route   GET /api/admin/dashboard
 * @access  Private/Admin
 */
export const getDashboardStats = asyncHandler(async (req, res, next) => {
  const [
    totalUsers,
    totalVolunteers,
    totalOrganizations,
    totalOpportunities,
    activeOpportunities,
    totalApplications,
    pendingApplications,
    totalReviews,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: 'volunteer' }),
    User.countDocuments({ role: 'organization' }),
    Opportunity.countDocuments(),
    Opportunity.countDocuments({ isActive: true }),
    Application.countDocuments(),
    Application.countDocuments({ status: 'pending' }),
    Review.countDocuments(),
  ]);

  // Get recent activity
  const recentOpportunities = await Opportunity.find()
    .populate('organization', 'organizationName')
    .sort({ createdAt: -1 })
    .limit(5);

  const recentUsers = await User.find()
    .select('name email role createdAt')
    .sort({ createdAt: -1 })
    .limit(5);

  res.status(200).json({
    success: true,
    data: {
      stats: {
        totalUsers,
        totalVolunteers,
        totalOrganizations,
        totalOpportunities,
        activeOpportunities,
        totalApplications,
        pendingApplications,
        totalReviews,
      },
      recentActivity: {
        opportunities: recentOpportunities,
        users: recentUsers,
      },
    },
  });
});

/**
 * @desc    Update user status (activate/deactivate)
 * @route   PUT /api/admin/users/:id/status
 * @access  Private/Admin
 */
export const updateUserStatus = asyncHandler(async (req, res, next) => {
  // Validate ObjectId
  if (!validateObjectId(req.params.id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid user ID format',
    });
  }

  const { isActive } = req.body;

  if (typeof isActive !== 'boolean') {
    return res.status(400).json({
      success: false,
      message: 'isActive must be a boolean value',
    });
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isActive },
    { new: true, runValidators: true }
  ).select('-password');

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
    });
  }

  res.status(200).json({
    success: true,
    data: user,
  });
});

/**
 * @desc    Update organization verification status
 * @route   PUT /api/admin/organizations/:id/verify
 * @access  Private/Admin
 */
export const verifyOrganization = asyncHandler(async (req, res, next) => {
  // Validate ObjectId
  if (!validateObjectId(req.params.id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid organization ID format',
    });
  }

  const { verified } = req.body;

  if (typeof verified !== 'boolean') {
    return res.status(400).json({
      success: false,
      message: 'verified must be a boolean value',
    });
  }

  const organization = await Organization.findByIdAndUpdate(
    req.params.id,
    { verified },
    { new: true, runValidators: true }
  ).populate('user', 'name email');

  if (!organization) {
    return res.status(404).json({
      success: false,
      message: 'Organization not found',
    });
  }

  res.status(200).json({
    success: true,
    data: organization,
  });
});

/**
 * @desc    Feature/unfeature opportunity
 * @route   PUT /api/admin/opportunities/:id/feature
 * @access  Private/Admin
 */
export const featureOpportunity = asyncHandler(async (req, res, next) => {
  // Validate ObjectId
  if (!validateObjectId(req.params.id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid opportunity ID format',
    });
  }

  const { featured } = req.body;

  if (typeof featured !== 'boolean') {
    return res.status(400).json({
      success: false,
      message: 'featured must be a boolean value',
    });
  }

  const opportunity = await Opportunity.findByIdAndUpdate(
    req.params.id,
    { featured },
    { new: true, runValidators: true }
  ).populate('organization', 'organizationName');

  if (!opportunity) {
    return res.status(404).json({
      success: false,
      message: 'Opportunity not found',
    });
  }

  res.status(200).json({
    success: true,
    data: opportunity,
  });
});

/**
 * @desc    Get all organizations for admin
 * @route   GET /api/admin/organizations
 * @access  Private/Admin
 */
export const getOrganizations = asyncHandler(async (req, res, next) => {
  const { verified, page, limit, search } = req.query;

  // Validate pagination
  const { page: validPage, limit: validLimit } = validatePagination(page, limit);

  const query = {};
  if (verified !== undefined) {
    query.verified = verified === 'true';
  }
  if (search) {
    const sanitizedSearch = sanitizeString(search, 100);
    if (sanitizedSearch) {
      query.$or = [
        { organizationName: { $regex: sanitizedSearch, $options: 'i' } },
        { description: { $regex: sanitizedSearch, $options: 'i' } },
      ];
    }
  }

  const skip = (validPage - 1) * validLimit;

  const organizations = await Organization.find(query)
    .populate('user', 'name email isActive')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(validLimit);

  const total = await Organization.countDocuments(query);

  res.status(200).json({
    success: true,
    count: organizations.length,
    total,
    page: validPage,
    pages: Math.ceil(total / validLimit),
    data: organizations,
  });
});

