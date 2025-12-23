import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema(
  {
    opportunity: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Opportunity',
      required: [true, 'Opportunity is required'],
    },
    volunteer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Volunteer is required'],
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'withdrawn', 'completed'],
      default: 'pending',
    },
    message: {
      type: String,
      trim: true,
      maxlength: [1000, 'Message cannot exceed 1000 characters'],
    },
    appliedAt: {
      type: Date,
      default: Date.now,
    },
    reviewedAt: {
      type: Date,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewNotes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate applications
applicationSchema.index({ opportunity: 1, volunteer: 1 }, { unique: true });

// Indexes for efficient queries
applicationSchema.index({ volunteer: 1, status: 1 });
applicationSchema.index({ opportunity: 1, status: 1 });

export default mongoose.model('Application', applicationSchema);

