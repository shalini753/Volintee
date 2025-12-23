import Notification from '../models/Notification.js';
import asyncHandler from '../middleware/asyncHandler.js';
import { validateObjectId, validatePagination } from '../middleware/validator.js';

/**
 * @desc    Get user's notifications
 * @route   GET /api/notifications
 * @access  Private
 */
export const getNotifications = asyncHandler(async (req, res, next) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({
      success: false,
      message: 'User not authenticated',
    });
  }

  const { isRead, type, page, limit } = req.query;

  // Validate pagination
  const { page: validPage, limit: validLimit } = validatePagination(page, limit || 20);

  const query = { user: req.user.id };
  if (isRead !== undefined) {
    query.isRead = isRead === 'true';
  }
  if (type) {
    const validTypes = [
      'application_received',
      'application_approved',
      'application_rejected',
      'opportunity_created',
      'opportunity_updated',
      'new_review',
      'message',
      'system',
    ];
    if (validTypes.includes(type)) {
      query.type = type;
    }
  }

  const skip = (validPage - 1) * validLimit;

  const notifications = await Notification.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(validLimit);

  const total = await Notification.countDocuments(query);
  const unreadCount = await Notification.countDocuments({
    user: req.user.id,
    isRead: false,
  });

  res.status(200).json({
    success: true,
    count: notifications.length,
    total,
    unreadCount,
    page: validPage,
    pages: Math.ceil(total / validLimit),
    data: notifications,
  });
});

/**
 * @desc    Mark notification as read
 * @route   PUT /api/notifications/:id/read
 * @access  Private
 */
export const markAsRead = asyncHandler(async (req, res, next) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({
      success: false,
      message: 'User not authenticated',
    });
  }

  // Validate ObjectId
  if (!validateObjectId(req.params.id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid notification ID format',
    });
  }

  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    return res.status(404).json({
      success: false,
      message: 'Notification not found',
    });
  }

  if (!notification.user || notification.user.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this notification',
    });
  }

  notification.isRead = true;
  notification.readAt = new Date();
  await notification.save();

  res.status(200).json({
    success: true,
    data: notification,
  });
});

/**
 * @desc    Mark all notifications as read
 * @route   PUT /api/notifications/read-all
 * @access  Private
 */
export const markAllAsRead = asyncHandler(async (req, res, next) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({
      success: false,
      message: 'User not authenticated',
    });
  }

  await Notification.updateMany(
    { user: req.user.id, isRead: false },
    { isRead: true, readAt: new Date() }
  );

  res.status(200).json({
    success: true,
    message: 'All notifications marked as read',
  });
});

/**
 * @desc    Delete notification
 * @route   DELETE /api/notifications/:id
 * @access  Private
 */
export const deleteNotification = asyncHandler(async (req, res, next) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({
      success: false,
      message: 'User not authenticated',
    });
  }

  // Validate ObjectId
  if (!validateObjectId(req.params.id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid notification ID format',
    });
  }

  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    return res.status(404).json({
      success: false,
      message: 'Notification not found',
    });
  }

  if (!notification.user || notification.user.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to delete this notification',
    });
  }

  await notification.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Notification deleted successfully',
  });
});

