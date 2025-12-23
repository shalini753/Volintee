import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { v2 as cloudinary } from 'cloudinary';
import path from 'path';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Allowed image file extensions
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
const ALLOWED_MIMETYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

/**
 * Validate file extension
 */
const validateExtension = (filename) => {
  const ext = path.extname(filename).toLowerCase();
  return ALLOWED_EXTENSIONS.includes(ext);
};

/**
 * Sanitize filename to prevent directory traversal and special characters
 */
const sanitizeFilename = (filename) => {
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/\.\./g, '_')
    .substring(0, 100);
};

// Configure Cloudinary storage for profile pictures
const profilePictureStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const publicId = `profiles/${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    
    return {
      folder: 'volunteer-app/profiles',
      public_id: publicId,
      resource_type: 'image',
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
      transformation: [
        { width: 500, height: 500, crop: 'limit' }, // Resize and maintain aspect ratio
        { quality: 'auto' }, // Optimize quality
      ],
    };
  },
});

// Configure Cloudinary storage for opportunity images
const opportunityImagesStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const publicId = `opportunities/${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    
    return {
      folder: 'volunteer-app/opportunities',
      public_id: publicId,
      resource_type: 'image',
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
      transformation: [
        { width: 1200, height: 800, crop: 'limit' }, // Resize and maintain aspect ratio
        { quality: 'auto' }, // Optimize quality
      ],
    };
  },
});

// File filter
const fileFilter = (req, file, cb) => {
  // Validate mimetype
  if (!ALLOWED_MIMETYPES.includes(file.mimetype.toLowerCase())) {
    return cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed'), false);
  }

  // Validate file extension
  if (!validateExtension(file.originalname)) {
    return cb(new Error('Invalid file extension. Only .jpg, .jpeg, .png, .gif, and .webp are allowed'), false);
  }

  cb(null, true);
};

// Configure multer for profile pictures
const uploadProfilePictureMulter = multer({
  storage: profilePictureStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
  fileFilter: fileFilter,
});

// Configure multer for opportunity images
const uploadOpportunityImagesMulter = multer({
  storage: opportunityImagesStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
    files: 5, // Max 5 images
  },
  fileFilter: fileFilter,
});

// Middleware for single profile picture upload
export const uploadProfilePicture = uploadProfilePictureMulter.single('profilePicture');

// Middleware for multiple opportunity images
export const uploadOpportunityImages = uploadOpportunityImagesMulter.array('opportunityImages', 5);

// Helper function to extract Cloudinary URL from req.file or req.files
export const getCloudinaryUrl = (file) => {
  if (!file) return null;
  // Cloudinary returns the URL in file.path or file.secure_url
  return file.secure_url || file.path || file.url;
};

export default uploadProfilePictureMulter;
