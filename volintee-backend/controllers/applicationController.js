import Application from '../models/Application.js';
import Opportunity from '../models/Opportunity.js';
import User from '../models/User.js';
import Organization from '../models/Organization.js';
import asyncHandler from '../middleware/asyncHandler.js';
import {
  notifyApplicationReceived,
  notifyApplicationStatusChange,
} from '../utils/createNotification.js';
import { validateObjectId, validatePagination, sanitizeString } from '../middleware/validator.js';

/**
 * @desc    Apply to an opportunity
 * @route   POST /api/applications
 * @access  Private (Volunteer only)
 */
export const createApplication = asyncHandler(async (req, res, next) => {
  if (req.user.role !== 'volunteer') {
    return res.status(403).json({
      success: false,
      message: 'Only volunteers can apply to opportunities',
    });
  }

  const { opportunityId, message } = req.body;

  // Validate opportunityId
  if (!opportunityId) {
    return res.status(400).json({
      success: false,
      message: 'Opportunity ID is required',
    });
  }

  if (!validateObjectId(opportunityId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid opportunity ID format',
    });
  }

  // Check if opportunity exists
  const opportunity = await Opportunity.findById(opportunityId).populate('organization');
  if (!opportunity) {
    return res.status(404).json({
      success: false,
      message: 'Opportunity not found',
    });
  }

  if (!opportunity.isActive) {
    return res.status(400).json({
      success: false,
      message: 'This opportunity is no longer active',
    });
  }

  // Check if already applied
  const existingApplication = await Application.findOne({
    opportunity: opportunityId,
    volunteer: req.user.id,
  });

  if (existingApplication) {
    return res.status(400).json({
      success: false,
      message: 'You have already applied to this opportunity',
    });
  }

  // Sanitize message
  const sanitizedMessage = message ? sanitizeString(message, 1000) : '';

  // Atomically check if opportunity has space and increment volunteersRegistered
  // This prevents race conditions where multiple users apply simultaneously
  const updatedOpportunity = await Opportunity.findOneAndUpdate(
    {
      _id: opportunityId,
      isActive: true,
      $expr: { $lt: ['$volunteersRegistered', '$volunteersNeeded'] },
    },
    {
      $inc: { volunteersRegistered: 1 },
    },
    {
      new: true,
    }
  );

  if (!updatedOpportunity) {
    return res.status(400).json({
      success: false,
      message: 'This opportunity is full or no longer active',
    });
  }

  // Create application
  const application = await Application.create({
    opportunity: opportunityId,
    volunteer: req.user.id,
    message: sanitizedMessage,
  });

  // Get organization user to send notification
  const organization = await Organization.findById(updatedOpportunity.organization._id || opportunity.organization._id);
  if (organization) {
    await notifyApplicationReceived(
      organization.user,
      application._id,
      opportunityId,
      req.user.name
    );
  }

  // Populate application data
  await application.populate({
    path: 'opportunity',
    populate: {
      path: 'organization',
      select: 'organizationName description location',
    },
  });
  await application.populate('volunteer', 'name email profilePicture');

  res.status(201).json({
    success: true,
    data: application,
  });
});

/**
 * @desc    Get applications for an opportunity (Organization only)
 * @route   GET /api/applications/opportunity/:opportunityId
 * @access  Private (Organization only)
 */
export const getOpportunityApplications = asyncHandler(async (req, res, next) => {
  // Validate opportunityId
  if (!validateObjectId(req.params.opportunityId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid opportunity ID format',
    });
  }

  const { status, page, limit } = req.query;

  // Validate pagination
  const { page: validPage, limit: validLimit } = validatePagination(page, limit);

  // Verify organization owns the opportunity
  const opportunity = await Opportunity.findById(req.params.opportunityId).populate('organization');
  if (!opportunity) {
    return res.status(404).json({
      success: false,
      message: 'Opportunity not found',
    });
  }

  const organization = await Organization.findOne({ user: req.user.id });
  if (!organization || opportunity.organization._id.toString() !== organization._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to view applications for this opportunity',
    });
  }

  const query = { opportunity: req.params.opportunityId };
  if (status) {
    query.status = status;
  }

  const skip = (validPage - 1) * validLimit;

  const applications = await Application.find(query)
    .populate('volunteer', 'name email phone profilePicture bio skills rating')
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
 * @desc    Update application status
 * @route   PUT /api/applications/:id/status
 * @access  Private (Organization only)
 */
export const updateApplicationStatus = asyncHandler(async (req, res, next) => {
  // Validate ObjectId
  if (!validateObjectId(req.params.id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid application ID format',
    });
  }

  const { status, reviewNotes } = req.body;

  if (!status) {
    return res.status(400).json({
      success: false,
      message: 'Status is required',
    });
  }

  if (!['approved', 'rejected', 'withdrawn'].includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid status. Must be approved, rejected, or withdrawn',
    });
  }

  const application = await Application.findById(req.params.id).populate({
    path: 'opportunity',
    populate: {
      path: 'organization',
    },
  });

  if (!application) {
    return res.status(404).json({
      success: false,
      message: 'Application not found',
    });
  }

  if (!application.opportunity) {
    return res.status(404).json({
      success: false,
      message: 'Opportunity not found for this application',
    });
  }

  // Verify organization owns the opportunity
  const organization = await Organization.findOne({ user: req.user.id });
  if (!organization || !application.opportunity.organization || application.opportunity.organization._id.toString() !== organization._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this application',
    });
  }

  // Update application
  application.status = status;
  application.reviewedAt = new Date();
  application.reviewedBy = req.user.id;
  if (reviewNotes) {
    application.reviewNotes = sanitizeString(reviewNotes, 500);
  }

  await application.save();

  // If rejected or withdrawn, decrement volunteers registered
  if (status === 'rejected' || status === 'withdrawn') {
    await Opportunity.findByIdAndUpdate(application.opportunity._id, {
      $inc: { volunteersRegistered: -1 },
    });
  }

  // Send notification to volunteer
  await notifyApplicationStatusChange(
    application.volunteer,
    status,
    application.opportunity.title,
    application._id
  );

  // Populate application data
  await application.populate('volunteer', 'name email profilePicture');
  await application.populate('reviewedBy', 'name');

  res.status(200).json({
    success: true,
    data: application,
  });
});

/**
 * @desc    Withdraw application (Volunteer only)
 * @route   PUT /api/applications/:id/withdraw
 * @access  Private (Volunteer only)
 */
export const withdrawApplication = asyncHandler(async (req, res, next) => {
  // Validate ObjectId
  if (!validateObjectId(req.params.id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid application ID format',
    });
  }

  const application = await Application.findById(req.params.id);

  if (!application) {
    return res.status(404).json({
      success: false,
      message: 'Application not found',
    });
  }

  if (!application.volunteer || application.volunteer.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to withdraw this application',
    });
  }

  if (application.status !== 'pending') {
    return res.status(400).json({
      success: false,
      message: 'Can only withdraw pending applications',
    });
  }

  application.status = 'withdrawn';
  application.reviewedAt = new Date();
  await application.save();

  // Decrement volunteers registered
  await Opportunity.findByIdAndUpdate(application.opportunity, {
    $inc: { volunteersRegistered: -1 },
  });

  res.status(200).json({
    success: true,
    data: application,
  });
});

/**
 * @desc    Get single application
 * @route   GET /api/applications/:id
 * @access  Private
 */
export const getApplication = asyncHandler(async (req, res, next) => {
  // Validate ObjectId
  if (!validateObjectId(req.params.id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid application ID format',
    });
  }

  const application = await Application.findById(req.params.id)
    .populate({
      path: 'opportunity',
      populate: {
        path: 'organization',
        select: 'organizationName description location contactEmail',
      },
    })
    .populate('volunteer', 'name email profilePicture bio skills rating')
    .populate('reviewedBy', 'name');

  if (!application) {
    return res.status(404).json({
      success: false,
      message: 'Application not found',
    });
  }

  // Check authorization
  const organization = await Organization.findOne({ user: req.user.id });
  const isOwner = application.volunteer._id.toString() === req.user.id;
  const isOrgOwner = organization && application.opportunity.organization._id.toString() === organization._id.toString();

  if (!isOwner && !isOrgOwner && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to view this application',
    });
  }

  res.status(200).json({
    success: true,
    data: application,
  });
});


/**
 * @desc    Check if user has applied to an opportunity
 * @route   GET /api/applications/me/opportunity/:opportunityId
 * @access  Private (Volunteer only)
 */
export const checkApplicationStatus = asyncHandler(async (req, res, next) => {
  // Validate opportunityId
  if (!validateObjectId(req.params.opportunityId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid opportunity ID format',
    });
  }

  const application = await Application.findOne({
    opportunity: req.params.opportunityId,
    volunteer: req.user.id,
  });

  res.status(200).json({
    success: true,
    hasApplied: !!application,
    status: application ? application.status : null,
    applicationId: application ? application._id : null,
  });
});

/**
 * @desc    Get logged in user's applications (Volunteer only)
 * @route   GET /api/applications/my-applications
 * @access  Private (Volunteer only)
 */
export const getMyApplications = asyncHandler(async (req, res, next) => {
  const { status, page, limit } = req.query;

  // Validate pagination
  const { page: validPage, limit: validLimit } = validatePagination(page, limit);

  const query = { volunteer: req.user.id };
  if (status) {
    query.status = status;
  }

  const skip = (validPage - 1) * validLimit;

  const applications = await Application.find(query)
    .populate({
      path: 'opportunity',
      select: 'title organization location startDate endDate status',
      populate: {
        path: 'organization',
        select: 'organizationName',
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
