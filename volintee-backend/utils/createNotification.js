import Notification from '../models/Notification.js';

/**
 * Create a notification for a user
 * @param {Object} notificationData - Notification data
 * @returns {Promise<Notification>}
 */
const createNotification = async (notificationData) => {
  try {
    const notification = await Notification.create(notificationData);
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    // Don't throw error - notifications shouldn't break the main flow
    return null;
  }
};

/**
 * Create notification for application received
 */
export const notifyApplicationReceived = async (organizationUserId, applicationId, opportunityId, volunteerName) => {
  return await createNotification({
    user: organizationUserId,
    type: 'application_received',
    title: 'New Volunteer Application',
    message: `${volunteerName} has applied to your opportunity`,
    link: `/opportunities/${opportunityId}/applications/${applicationId}`,
    relatedEntity: {
      type: 'application',
      id: applicationId,
    },
  });
};

/**
 * Create notification for application status change
 */
export const notifyApplicationStatusChange = async (volunteerId, status, opportunityTitle, applicationId) => {
  const statusMessages = {
    approved: 'Your application has been approved!',
    rejected: 'Your application has been reviewed',
    withdrawn: 'Your application has been withdrawn',
  };

  return await createNotification({
    user: volunteerId,
    type: `application_${status}`,
    title: `Application ${status.charAt(0).toUpperCase() + status.slice(1)}`,
    message: `${statusMessages[status]} for "${opportunityTitle}"`,
    link: `/applications/${applicationId}`,
    relatedEntity: {
      type: 'application',
      id: applicationId,
    },
  });
};

/**
 * Create notification for new review
 */
export const notifyNewReview = async (userId, reviewerName, rating) => {
  return await createNotification({
    user: userId,
    type: 'new_review',
    title: 'New Review Received',
    message: `${reviewerName} left you a ${rating}-star review`,
    relatedEntity: {
      type: 'user',
      id: userId,
    },
  });
};

export default createNotification;

