import mongoose from 'mongoose';

const opportunitySchema = new mongoose.Schema(
  {
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: [true, 'Organization is required'],
    },
    title: {
      type: String,
      required: [true, 'Please provide a title'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide a description'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Please provide a category'],
      trim: true,
    },
    interests: [
      {
        type: String,
        trim: true,
      },
    ],
    location: {
      address: {
        type: String,
        required: [true, 'Please provide an address'],
        trim: true,
      },
      city: {
        type: String,
        trim: true,
      },
      state: {
        type: String,
        trim: true,
      },
      zipCode: {
        type: String,
        trim: true,
      },
    },
    availability: {
      type: String,
      enum: ['weekdays', 'weekends', 'both', 'flexible'],
      required: true,
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    volunteersNeeded: {
      type: Number,
      default: 1,
      min: 1,
    },
    volunteersRegistered: {
      type: Number,
      default: 0,
    },
    images: [
      {
        type: String,
      },
    ],
    requirements: [
      {
        type: String,
        trim: true,
      },
    ],
    skillsRequired: [
      {
        type: String,
        trim: true,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    featured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Create geospatial index for location-based queries
// opportunitySchema.index({ location: '2dsphere' });

// Create text index for search functionality
opportunitySchema.index({ title: 'text', description: 'text', category: 'text' });

export default mongoose.model('Opportunity', opportunitySchema);

