import Opportunity from '../models/Opportunity.js';
import Organization from '../models/Organization.js';
import Application from '../models/Application.js';
import asyncHandler from '../middleware/asyncHandler.js';
import { validateLocation, validateObjectId, validatePagination, validateDateRange, sanitizeString } from '../middleware/validator.js';
import { getCloudinaryUrl } from '../middleware/upload.js';

/**
 * @desc    Create a new volunteer opportunity
 * @route   POST /api/opportunities
 * @access  Private (Organization only)
 */
export const createOpportunity = asyncHandler(async (req, res, next) => {
  // Get organization for the logged-in user
  const organization = await Organization.findOne({ user: req.user.id });

  if (!organization) {
    return res.status(404).json({
      success: false,
      message: 'Organization profile not found. Please complete your organization profile.',
    });
  }

  const {
    title,
    description,
    category,
    interests,
    location,
    availability,
    startDate,
    endDate,
    volunteersNeeded,
    requirements,
    skillsRequired,
    featured,
  } = req.body;

  // Handle image uploads (Cloudinary)
  let images = [];
  if (req.files && req.files.length > 0) {
    images = req.files.map(file => getCloudinaryUrl(file)).filter(Boolean);
  }

  // Validate required fields
  if (!title || !description || !category || !availability) {
    return res.status(400).json({
      success: false,
      message: 'Please provide title, description, category, and availability',
    });
  }

  // Validate availability enum
  if (!['weekdays', 'weekends', 'both', 'flexible'].includes(availability)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid availability. Must be: weekdays, weekends, both, or flexible',
    });
  }

  // Validate volunteersNeeded
  if (volunteersNeeded !== undefined && (isNaN(volunteersNeeded) || volunteersNeeded < 1)) {
    return res.status(400).json({
      success: false,
      message: 'Volunteers needed must be a positive number',
    });
  }

  // Validate location if provided
  if (location) {
    const locationValidation = validateLocation(location);
    if (!locationValidation.valid) {
      return res.status(400).json({
        success: false,
        message: locationValidation.message,
      });
    }
  }

  // Validate date range if provided
  if (startDate || endDate) {
    const dateValidation = validateDateRange(startDate, endDate);
    if (!dateValidation.valid) {
      return res.status(400).json({
        success: false,
        message: dateValidation.message,
      });
    }
  }

  // Sanitize inputs
  const sanitizedTitle = sanitizeString(title, 200);
  const sanitizedDescription = sanitizeString(description, 2000);
  const sanitizedCategory = sanitizeString(category, 100);
  
  // Prepare opportunity data
  const opportunityData = {
    organization: organization._id,
    title: sanitizedTitle,
    description: sanitizedDescription,
    category: sanitizedCategory,
    interests: Array.isArray(interests) ? interests.map(i => sanitizeString(i, 50)).filter(Boolean) : [],
    location: location || organization.location,
    availability,
    volunteersNeeded: volunteersNeeded && volunteersNeeded > 0 ? parseInt(volunteersNeeded) : 1,
    requirements: Array.isArray(requirements) ? requirements.map(r => sanitizeString(r, 200)).filter(Boolean) : [],
    skillsRequired: Array.isArray(skillsRequired) ? skillsRequired.map(s => sanitizeString(s, 50)).filter(Boolean) : [],
    images: Array.isArray(images) ? images : [],
    featured: Boolean(featured),
  };

  // Add dates if provided
  if (startDate) {
    opportunityData.startDate = new Date(startDate);
  }
  if (endDate) {
    opportunityData.endDate = new Date(endDate);
  }

  // Create opportunity
  const opportunity = await Opportunity.create(opportunityData);

  // Populate organization details
  await opportunity.populate('organization', 'organizationName description location');

  res.status(201).json({
    success: true,
    data: opportunity,
  });
});

/**
 * @desc    Search volunteer opportunities
 * @route   GET /api/opportunities/search
 * @access  Public
 */
export const searchOpportunities = asyncHandler(async (req, res, next) => {
  const {
    interest,
    availability,
    latitude,
    longitude,
    maxDistance, // in kilometers
    category,
    search, // text search
    page,
    limit,
  } = req.query;

  // Validate and sanitize pagination
  const { page: validPage, limit: validLimit } = validatePagination(page, limit);

  // Build query
  const query = { isActive: true };

  // Filter by interest
  if (interest) {
    query.interests = { $in: [interest] };
  }

  // Filter by availability
  if (availability) {
    query.availability = availability;
  }

  // Filter by category
  if (category) {
    query.category = category;
  }

  // Filter by skills required
  if (req.query.skillsRequired) {
    const skills = Array.isArray(req.query.skillsRequired)
      ? req.query.skillsRequired
      : [req.query.skillsRequired];
    query.skillsRequired = { $in: skills };
  }

  // Filter by date range
  if (req.query.startDate || req.query.endDate) {
    if (req.query.startDate) {
      query.startDate = { $gte: new Date(req.query.startDate) };
    }
    if (req.query.endDate) {
      query.endDate = { $lte: new Date(req.query.endDate) };
    }
  }

  // Filter featured
  if (req.query.featured === 'true') {
    query.featured = true;
  }

  // Text search
  if (search) {
    query.$text = { $search: search };
  }

    // Geo-based search removed
    if (latitude && longitude) {
      // Geospatial search is no longer supported without coordinates in the database
    }

  // Combine queries
  const finalQuery = { ...query };

  // Calculate pagination
  const skip = (validPage - 1) * validLimit;

  // Execute query
  const opportunities = await Opportunity.find(finalQuery)
    .populate('organization', 'organizationName description location')
    .sort({ createdAt: -1 }) // Sort by date
    .skip(skip)
    .limit(validLimit);

  // Get total count for pagination
  const total = await Opportunity.countDocuments(finalQuery);

  res.status(200).json({
    success: true,
    count: opportunities.length,
    total,
    page: validPage,
    pages: Math.ceil(total / validLimit),
    data: opportunities,
  });
});

/**
 * @desc    Get all opportunities (with optional filters)
 * @route   GET /api/opportunities
 * @access  Public
 */
export const getOpportunities = asyncHandler(async (req, res, next) => {
  const { page, limit, category, availability } = req.query;

  // Validate pagination
  const { page: validPage, limit: validLimit } = validatePagination(page, limit);

  const query = { isActive: true };

  if (category) {
    query.category = category;
  }

  if (availability) {
    query.availability = availability;
  }

  const skip = (validPage - 1) * validLimit;

  const opportunities = await Opportunity.find(query)
    .populate('organization', 'organizationName description location')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(validLimit);

  const total = await Opportunity.countDocuments(query);

  res.status(200).json({
    success: true,
    count: opportunities.length,
    total,
    page: validPage,
    pages: Math.ceil(total / validLimit),
    data: opportunities,
  });
});

/**
 * @desc    Get single opportunity by ID
 * @route   GET /api/opportunities/:id
 * @access  Public
 */
export const getOpportunity = asyncHandler(async (req, res, next) => {
  // Validate ObjectId
  if (!validateObjectId(req.params.id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid opportunity ID format',
    });
  }

  const opportunity = await Opportunity.findById(req.params.id).populate(
    'organization',
    'organizationName description location contactEmail contactPhone'
  );

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
 * @desc    Update opportunity
 * @route   PUT /api/opportunities/:id
 * @access  Private (Organization only)
 */
export const updateOpportunity = asyncHandler(async (req, res, next) => {
  // Validate ObjectId
  if (!validateObjectId(req.params.id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid opportunity ID format',
    });
  }

  const opportunity = await Opportunity.findById(req.params.id).populate('organization');

  if (!opportunity) {
    return res.status(404).json({
      success: false,
      message: 'Opportunity not found',
    });
  }

  // Verify organization owns the opportunity
  const organization = await Organization.findOne({ user: req.user.id });
  if (!organization || !opportunity.organization || opportunity.organization._id.toString() !== organization._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this opportunity',
    });
  }

  // Sanitize and validate update data
  const updateData = {};
  
  if (req.body.title) updateData.title = sanitizeString(req.body.title, 200);
  if (req.body.description) updateData.description = sanitizeString(req.body.description, 2000);
  if (req.body.category) updateData.category = sanitizeString(req.body.category, 100);
  if (req.body.availability) {
    if (['weekdays', 'weekends', 'both', 'flexible'].includes(req.body.availability)) {
      updateData.availability = req.body.availability;
    }
  }
  if (req.body.interests) {
    updateData.interests = Array.isArray(req.body.interests) 
      ? req.body.interests.map(i => sanitizeString(i, 50)).filter(Boolean) 
      : [];
  }
  if (req.body.requirements) {
    updateData.requirements = Array.isArray(req.body.requirements)
      ? req.body.requirements.map(r => sanitizeString(r, 200)).filter(Boolean)
      : [];
  }
  if (req.body.skillsRequired) {
    updateData.skillsRequired = Array.isArray(req.body.skillsRequired)
      ? req.body.skillsRequired.map(s => sanitizeString(s, 50)).filter(Boolean)
      : [];
  }
  if (req.body.volunteersNeeded) {
    const volunteers = parseInt(req.body.volunteersNeeded);
    if (!isNaN(volunteers) && volunteers > 0) {
      updateData.volunteersNeeded = volunteers;
    }
  }
  if (req.body.startDate) updateData.startDate = new Date(req.body.startDate);
  if (req.body.endDate) updateData.endDate = new Date(req.body.endDate);
  if (req.body.featured !== undefined) updateData.featured = Boolean(req.body.featured);

  // Validate location if provided
  if (req.body.location) {
    const locationValidation = validateLocation(req.body.location);
    if (!locationValidation.valid) {
      return res.status(400).json({
        success: false,
        message: locationValidation.message,
      });
    }
    updateData.location = {
      address: req.body.location.address ? sanitizeString(req.body.location.address, 200) : '',
      city: req.body.location.city ? sanitizeString(req.body.location.city, 100) : undefined,
      state: req.body.location.state ? sanitizeString(req.body.location.state, 100) : undefined,
      zipCode: req.body.location.zipCode ? sanitizeString(req.body.location.zipCode, 20) : undefined,
    };
  }

  // Handle image uploads (Cloudinary)
  if (req.files && req.files.length > 0) {
    const newImages = req.files.map(file => getCloudinaryUrl(file)).filter(Boolean);
    updateData.images = [...(opportunity.images || []), ...newImages];
  }

  // Remove sensitive fields that shouldn't be updated
  delete updateData.organization;
  delete updateData.volunteersRegistered;

  const updatedOpportunity = await Opportunity.findByIdAndUpdate(
    req.params.id,
    updateData,
    {
      new: true,
      runValidators: true,
    }
  ).populate('organization', 'organizationName description location');

  res.status(200).json({
    success: true,
    data: updatedOpportunity,
  });
});

/**
 * @desc    Delete opportunity
 * @route   DELETE /api/opportunities/:id
 * @access  Private (Organization/Admin only)
 */
export const deleteOpportunity = asyncHandler(async (req, res, next) => {
  // Validate ObjectId
  if (!validateObjectId(req.params.id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid opportunity ID format',
    });
  }

  const opportunity = await Opportunity.findById(req.params.id).populate('organization');

  if (!opportunity) {
    return res.status(404).json({
      success: false,
      message: 'Opportunity not found',
    });
  }

  // Verify organization owns the opportunity or user is admin
  const organization = await Organization.findOne({ user: req.user.id });
  const isOwner = organization && opportunity.organization._id.toString() === organization._id.toString();
  const isAdmin = req.user.role === 'admin';

  if (!isOwner && !isAdmin) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to delete this opportunity',
    });
  }

  // Soft delete by setting isActive to false
  opportunity.isActive = false;
  await opportunity.save();

  res.status(200).json({
    success: true,
    message: 'Opportunity deleted successfully',
  });
});

/**
 * @desc    Get organization's opportunities
 * @route   GET /api/opportunities/my-opportunities
 * @access  Private (Organization only)
 */
export const getMyOpportunities = asyncHandler(async (req, res, next) => {
  const organization = await Organization.findOne({ user: req.user.id });

  if (!organization) {
    return res.status(404).json({
      success: false,
      message: 'Organization profile not found',
    });
  }

  const { page, limit, isActive } = req.query;

  // Validate pagination
  const { page: validPage, limit: validLimit } = validatePagination(page, limit);

  const query = { organization: organization._id };
  if (isActive !== undefined) {
    query.isActive = isActive === 'true';
  }

  const skip = (validPage - 1) * validLimit;

  const opportunities = await Opportunity.find(query)
    .populate('organization', 'organizationName description location')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(validLimit);

  const total = await Opportunity.countDocuments(query);

  res.status(200).json({
    success: true,
    count: opportunities.length,
    total,
    page: validPage,
    pages: Math.ceil(total / validLimit),
    data: opportunities,
  });
});


/**
 * @desc    Get organization's opportunities with application stats
 * @route   GET /api/opportunities/my-opportunities/stats
 * @access  Private (Organization only)
 */
export const getMyOpportunitiesWithStats = asyncHandler(async (req, res, next) => {
  const organization = await Organization.findOne({ user: req.user.id });

  if (!organization) {
    return res.status(404).json({
      success: false,
      message: 'Organization profile not found',
    });
  }

  const opportunities = await Opportunity.find({ organization: organization._id })
    .sort({ createdAt: -1 });

  // Get application counts for each opportunity
  // We can't use aggregation easily with virtuals/populates in this specific setup without more complex queries
  // So we'll do a parallel promise execution which is fine for reasonable numbers of opportunities
  const opportunitiesWithStats = await Promise.all(opportunities.map(async (opp) => {
    const applicationCount = await Application.countDocuments({ opportunity: opp._id });
    const pendingCount = await Application.countDocuments({ opportunity: opp._id, status: 'pending' });
    
    return {
      ...opp.toObject(),
      stats: {
        totalApplications: applicationCount,
        pendingApplications: pendingCount
      }
    };
  }));

  res.status(200).json({
    success: true,
    count: opportunitiesWithStats.length,
    data: opportunitiesWithStats,
  });
});
