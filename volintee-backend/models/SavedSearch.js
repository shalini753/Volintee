import mongoose from 'mongoose';

const savedSearchSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },
    name: {
      type: String,
      required: [true, 'Search name is required'],
      trim: true,
    },
    filters: {
      interest: String,
      availability: String,
      category: String,
      latitude: Number,
      longitude: Number,
      maxDistance: Number,
      search: String,
      skillsRequired: [String],
      startDate: Date,
      endDate: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
savedSearchSchema.index({ user: 1, isActive: 1 });

export default mongoose.model('SavedSearch', savedSearchSchema);

