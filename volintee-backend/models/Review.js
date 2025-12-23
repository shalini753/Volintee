import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Reviewer is required'],
    },
    reviewee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Reviewee is required'],
    },
    reviewType: {
      type: String,
      enum: ['volunteer-to-org', 'org-to-volunteer'],
      required: true,
    },
    opportunity: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Opportunity',
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
      maxlength: [1000, 'Comment cannot exceed 1000 characters'],
    },
    isVerified: {
      type: Boolean,
      default: false, // Verified if reviewer actually participated
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate reviews for same opportunity
reviewSchema.index({ reviewer: 1, reviewee: 1, opportunity: 1 }, { unique: true });

// Index for efficient queries
reviewSchema.index({ reviewee: 1, reviewType: 1 });

export default mongoose.model('Review', reviewSchema);

