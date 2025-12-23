import User from '../models/User.js';
import Organization from '../models/Organization.js';
import Application from '../models/Application.js';
import asyncHandler from '../middleware/asyncHandler.js';
import { validateObjectId, validatePagination, sanitizeString } from '../middleware/validator.js';
import { getCloudinaryUrl } from '../middleware/upload.js';

/**
 * @desc    Update user profile
 * @route   PUT /api/users/profile
 * @access  Private
 */
export const updateProfile = asyncHandler(async (req, res, next) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({
      success: false,
      message: 'User not authenticated',
    });
  }

  const {
    name,
    phone,
    bio,
    interests,
    skills,
    availability,
    location,
  } = req.body;

  const updateData = {};

  if (name) updateData.name = sanitizeString(name, 100);
  if (phone) updateData.phone = sanitizeString(phone, 20);
  if (bio !== undefined) {
    if (bio === null || bio === '') {
      updateData.bio = '';
    } else {
      updateData.bio = sanitizeString(bio, 500);
    }
  }
  if (interests) {
    updateData.interests = Array.isArray(interests)
      ? interests.map(i => sanitizeString(i, 50)).filter(Boolean)
      : [];
  }
  if (skills) {
    updateData.skills = Array.isArray(skills)
      ? skills.map(s => sanitizeString(s, 50)).filter(Boolean)
      : [];
  }
  if (availability) {
    if (['weekdays', 'weekends', 'both', 'flexible'].includes(availability)) {
      updateData.availability = availability;
    }
  }
  if (location) {
    // Simplified location update - no strict validation for coordinates
    updateData.location = {
      address: location.address ? sanitizeString(location.address, 200) : '',
      city: location.city ? sanitizeString(location.city, 100) : undefined,
      state: location.state ? sanitizeString(location.state, 100) : undefined,
      zipCode: location.zipCode ? sanitizeString(location.zipCode, 20) : undefined,
      zipCode: location.zipCode ? sanitizeString(location.zipCode, 20) : undefined,
    };
  }

  // Handle profile picture upload (Cloudinary)
  if (req.file) {
    updateData.profilePicture = getCloudinaryUrl(req.file);
  }

  const user = await User.findByIdAndUpdate(
    req.user.id,
    updateData,
    {
      new: true,
      runValidators: true,
    }
  ).select('-password');

  res.status(200).json({
    success: true,
    data: user,
  });
});

/**
 * @desc    Get user profile by ID
 * @route   GET /api/users/:id
 * @access  Public
 */
export const getUserProfile = asyncHandler(async (req, res, next) => {
  // Validate ObjectId
  if (!validateObjectId(req.params.id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid user ID format',
    });
  }

  const user = await User.findById(req.params.id).select('-password');

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
    });
  }

  // If organization, include organization details
  let organization = null;
  if (user.role === 'organization') {
    organization = await Organization.findOne({ user: user._id });
  }

  res.status(200).json({
    success: true,
    data: {
      user,
      organization,
    },
  });
});

/**
 * @desc    Get current user's applications
 * @route   GET /api/users/me/applications
 * @access  Private
 */
export const getMyApplications = asyncHandler(async (req, res, next) => {
  const { status, page, limit } = req.query;

  // Validate pagination
  const { page: validPage, limit: validLimit } = validatePagination(page, limit);

  const query = { volunteer: req.user.id };
  if (status && ['pending', 'approved', 'rejected', 'withdrawn', 'completed'].includes(status)) {
    query.status = status;
  }

  const skip = (validPage - 1) * validLimit;

  const applications = await Application.find(query)
    .populate({
      path: 'opportunity',
      populate: {
        path: 'organization',
        select: 'organizationName description location',
      },
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(validLimit);

  const total = await Application.countDocuments(query);

  res.status(200).json({
    success: true,
    count: applications.length,
    total,
    page: validPage,
    pages: Math.ceil(total / validLimit),
    data: applications,
  });
});

/**
 * @desc    Get user volunteer history
 * @route   GET /api/users/me/history
 * @access  Private
 */
export const getVolunteerHistory = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'User not authenticated',
    });
  }

  if (req.user.role !== 'volunteer') {
    return res.status(403).json({
      success: false,
      message: 'Only volunteers can access volunteer history',
    });
  }

  const completedApplications = await Application.find({
    volunteer: req.user.id,
    status: 'completed',
  })
    .populate({
      path: 'opportunity',
      select: 'title category organization startDate endDate',
      populate: {
        path: 'organization',
        select: 'organizationName',
      },
    })
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: completedApplications.length,
    data: completedApplications,
  });
});

/**
 * @desc    Get all users (Admin only)
 * @route   GET /api/users
 * @access  Private/Admin
 */
export const getUsers = asyncHandler(async (req, res, next) => {
  const { role, page, limit, search } = req.query;

  // Validate pagination
  const { page: validPage, limit: validLimit } = validatePagination(page, limit);

  const query = {};
  if (role && ['volunteer', 'organization', 'admin'].includes(role)) {
    query.role = role;
  }
  if (search) {
    const sanitizedSearch = sanitizeString(search, 100);
    if (sanitizedSearch) {
      query.$or = [
        { name: { $regex: sanitizedSearch, $options: 'i' } },
        { email: { $regex: sanitizedSearch, $options: 'i' } },
      ];
    }
  }

  const skip = (validPage - 1) * validLimit;

  const users = await User.find(query)
    .select('-password')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(validLimit);

  const total = await User.countDocuments(query);

  res.status(200).json({
    success: true,
    count: users.length,
    total,
    page: validPage,
    pages: Math.ceil(total / validLimit),
    data: users,
  });
});

