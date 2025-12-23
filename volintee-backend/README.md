# Local Volunteer Directory - Backend v2.0

A comprehensive, secure Node.js backend API for connecting volunteers with organizations in need of help.

## 🚀 Features

### Core Features
- **JWT-based Authentication** with role-based access control (RBAC)
- **User Registration** (Volunteer, Organization, or Admin) with MongoDB transactions
- **Volunteer Opportunity Management** with Cloudinary image uploads
- **Geo-based Search** for opportunities using MongoDB geospatial queries
- **Advanced Filtering** (interests, availability, location, skills, dates, featured)
- **RESTful API Design** with comprehensive rate limiting
- **Atomic Operations** preventing race conditions in critical operations

### v2.0 Enhanced Features
- **Application System**: Volunteers can apply to opportunities with atomic capacity checks
- **Reviews & Ratings**: Two-way rating system with incremental calculation for performance
- **Notifications**: Real-time notification system for application updates, reviews, etc.
- **User Profiles**: Enhanced profiles with skills, bio, profile pictures (Cloudinary), volunteer history
- **Cloudinary Integration**: Secure cloud-based image storage with automatic optimization
- **Admin Dashboard**: Comprehensive admin panel with statistics and user management
- **Saved Searches**: Users can save and reuse search filters
- **Advanced Search**: Filter by skills required, date ranges, featured opportunities
- **Opportunity Management**: Full CRUD operations with image management
- **Volunteer History**: Track completed volunteer work

## 📋 Prerequisites

- **Node.js** (v14 or higher)
- **MongoDB** (local or cloud instance - Atlas recommended)
- **Cloudinary Account** (free tier available)
- **npm** or **yarn**

## 🛠️ Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd volintee-backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Create `.env` file**
```bash
cp .env.example .env
```

4. **Configure environment variables** (see [Environment Variables](#-environment-variables) section)

5. **Start the server**
```bash
# Development mode (with nodemon)
npm run dev

# Production mode
npm start
```

## 🔧 Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/volunteer-directory
# Or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters_for_production

# Cloudinary Configuration (Get from https://cloudinary.com)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# CORS Configuration (comma-separated for multiple origins)
CORS_ORIGIN=http://localhost:3000,http://localhost:5173
```

### Getting Cloudinary Credentials

1. Sign up for a free account at [cloudinary.com](https://cloudinary.com)
2. Go to your Dashboard
3. Copy your `Cloud Name`, `API Key`, and `API Secret`
4. Add them to your `.env` file

## 📁 Project Structure

```
volintee-backend/
├── config/
│   ├── database.js              # MongoDB connection with retry logic
│   └── env.js                    # Environment variable validation
├── controllers/
│   ├── authController.js         # Authentication logic with transactions
│   ├── userController.js         # User profile management
│   ├── opportunityController.js  # Opportunity management
│   ├── applicationController.js  # Application management (atomic operations)
│   ├── reviewController.js       # Reviews & ratings (incremental calculation)
│   ├── notificationController.js # Notifications
│   ├── adminController.js        # Admin dashboard
│   └── savedSearchController.js  # Saved searches
├── middleware/
│   ├── auth.js                   # JWT authentication middleware
│   ├── asyncHandler.js           # Async error wrapper
│   ├── errorHandler.js           # Global error handler (production-safe)
│   ├── upload.js                 # Cloudinary file upload middleware
│   └── validator.js              # Input validation utilities
├── models/
│   ├── User.js                   # User model (volunteer/org/admin)
│   ├── Organization.js           # Organization profile model
│   ├── Opportunity.js            # Volunteer opportunity model
│   ├── Application.js            # Application model
│   ├── Review.js                 # Review model
│   ├── Notification.js           # Notification model
│   └── SavedSearch.js            # Saved search model
├── routes/
│   ├── authRoutes.js             # Authentication routes
│   ├── userRoutes.js             # User routes
│   ├── opportunityRoutes.js     # Opportunity routes
│   ├── applicationRoutes.js     # Application routes
│   ├── reviewRoutes.js           # Review routes
│   ├── notificationRoutes.js    # Notification routes
│   ├── adminRoutes.js            # Admin routes
│   └── savedSearchRoutes.js     # Saved search routes
├── utils/
│   ├── generateToken.js          # JWT token generator
│   └── createNotification.js     # Notification helper
├── app.js                        # Express app configuration
├── server.js                     # Server entry point
├── package.json
└── README.md
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user (volunteer or organization)
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (Protected)

### Users
- `GET /api/users/:id` - Get user profile (Public)
- `PUT /api/users/profile` - Update own profile with profile picture (Protected)
- `GET /api/users/me/applications` - Get my applications (Protected)
- `GET /api/users/me/history` - Get volunteer history (Protected - Volunteer only)
- `GET /api/users` - Get all users (Protected - Admin only)

### Opportunities
- `GET /api/opportunities` - Get all opportunities with pagination (Public)
- `GET /api/opportunities/search` - Advanced search with filters (Public)
- `GET /api/opportunities/:id` - Get single opportunity (Public)
- `POST /api/opportunities` - Create opportunity with images (Protected - Organization only)
- `PUT /api/opportunities/:id` - Update opportunity (Protected - Organization only)
- `DELETE /api/opportunities/:id` - Delete opportunity (Protected - Organization/Admin)
- `GET /api/opportunities/my-opportunities` - Get my opportunities (Protected - Organization only)

### Applications
- `POST /api/applications` - Apply to opportunity (Protected - Volunteer only, atomic operation)
- `GET /api/applications/:id` - Get application details (Protected)
- `GET /api/applications/opportunity/:opportunityId` - Get applications for opportunity (Protected - Organization only)
- `PUT /api/applications/:id/status` - Update application status (Protected - Organization only)
- `PUT /api/applications/:id/withdraw` - Withdraw application (Protected - Volunteer only)

### Reviews
- `POST /api/reviews` - Create a review (Protected)
- `GET /api/reviews/user/:userId` - Get reviews for a user (Public)
- `GET /api/reviews/:id` - Get single review (Public)

### Notifications
- `GET /api/notifications` - Get user notifications (Protected)
- `PUT /api/notifications/:id/read` - Mark notification as read (Protected)
- `PUT /api/notifications/read-all` - Mark all as read (Protected)
- `DELETE /api/notifications/:id` - Delete notification (Protected)

### Saved Searches
- `POST /api/saved-searches` - Create saved search (Protected)
- `GET /api/saved-searches` - Get saved searches (Protected)
- `PUT /api/saved-searches/:id` - Update saved search (Protected)
- `DELETE /api/saved-searches/:id` - Delete saved search (Protected)

### Admin
- `GET /api/admin/dashboard` - Get dashboard statistics (Protected - Admin only)
- `PUT /api/admin/users/:id/status` - Update user status (Protected - Admin only)
- `PUT /api/admin/organizations/:id/verify` - Verify organization (Protected - Admin only)
- `PUT /api/admin/opportunities/:id/feature` - Feature opportunity (Protected - Admin only)
- `GET /api/admin/organizations` - Get all organizations (Protected - Admin only)

## 📝 Example Requests

### Register as Volunteer
```bash
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "role": "volunteer",
  "phone": "123-456-7890",
  "interests": ["education", "environment"],
  "availability": "weekends",
  "location": {
    "coordinates": [-122.4194, 37.7749],
    "address": "123 Main St, San Francisco, CA"
  }
}
```

**Password Requirements:**
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

### Register as Organization
```bash
POST /api/auth/register
Content-Type: application/json

{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "password": "SecurePass123!",
  "role": "organization",
  "organizationName": "Green Earth Foundation",
  "description": "Environmental conservation organization",
  "location": {
    "coordinates": [-122.4194, 37.7749],
    "address": "456 Oak Ave, San Francisco, CA"
  }
}
```

### Update Profile with Profile Picture
```bash
PUT /api/users/profile
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "name": "John Doe Updated",
  "bio": "Passionate volunteer",
  "profilePicture": <file>
}
```

### Create Opportunity with Images
```bash
POST /api/opportunities
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "title": "Beach Cleanup Event",
  "description": "Join us for a beach cleanup",
  "category": "environment",
  "availability": "weekends",
  "volunteersNeeded": 20,
  "opportunityImages": [<file1>, <file2>]
}
```

### Search Opportunities (Advanced)
```bash
GET /api/opportunities/search?interest=education&availability=weekends&latitude=37.7749&longitude=-122.4194&maxDistance=10&skillsRequired=teaching&startDate=2024-01-01&featured=true&page=1&limit=10
```

### Apply to Opportunity
```bash
POST /api/applications
Authorization: Bearer <token>
Content-Type: application/json

{
  "opportunityId": "opportunity_id_here",
  "message": "I'm very interested in this opportunity!"
}
```

### Create Review
```bash
POST /api/reviews
Authorization: Bearer <token>
Content-Type: application/json

{
  "revieweeId": "user_id_here",
  "opportunityId": "opportunity_id_here",
  "rating": 5,
  "comment": "Great organization to work with!",
  "reviewType": "volunteer-to-org"
}
```

## 🔒 Authentication

Protected routes require a JWT token in the Authorization header:

```bash
Authorization: Bearer <your_jwt_token>
```

Tokens are generated upon successful login or registration and should be stored securely on the client side.

## 🗄️ Database Models

### User
- Basic user information (name, email, password - hashed)
- Role (volunteer/organization/admin)
- Interests, skills, and availability
- Bio and profile picture (Cloudinary URL)
- GeoJSON location for proximity search
- Rating system (average rating and count) - calculated incrementally
- Volunteer hours tracking
- Active/inactive status

### Organization
- Organization profile linked to User
- Location and contact information
- Verification status (admin verified)
- Website and description

### Opportunity
- Volunteer opportunity details
- Category, interests, and skills required
- GeoJSON location
- Availability requirements
- Volunteer capacity and registration tracking (atomic operations)
- Images array (Cloudinary URLs) for multiple photos
- Featured flag (admin controlled)
- Date ranges (start/end dates)
- Active/inactive status

### Application
- Links volunteer to opportunity
- Status tracking (pending, approved, rejected, withdrawn, completed)
- Application message
- Review tracking (who reviewed and when)
- Unique constraint on (opportunity, volunteer) pair

### Review
- Two-way review system (volunteer-to-org, org-to-volunteer)
- Rating (1-5 stars) and comment
- Linked to opportunity (optional)
- Verification flag (verified if both parties participated)
- Unique constraint to prevent duplicate reviews

### Notification
- User notifications for various events
- Read/unread status
- Links to related entities
- Multiple notification types

### SavedSearch
- User's saved search filters
- Reusable search configurations

## 🧪 Testing

You can test the API using tools like:
- **Postman** - Import the collection
- **cURL** - Command-line testing
- **Thunder Client** - VS Code extension
- **Insomnia** - API testing tool

### Health Check
```bash
GET http://localhost:5000/health
```

## 🔐 Security Features

### Authentication & Authorization
- **JWT token-based authentication** with secure token generation
- **Password hashing** with bcryptjs (10 salt rounds)
- **Strong password requirements** (8+ chars, uppercase, lowercase, number, special char)
- **Role-based access control (RBAC)** for fine-grained permissions
- **Token expiration** handling

### Rate Limiting
- **General API**: 100 requests per 15 minutes per IP
- **Auth endpoints**: 5 requests per 15 minutes per IP (stricter)
- Prevents brute force attacks and API abuse

### Input Validation & Sanitization
- **Comprehensive input validation** for all endpoints
- **String sanitization** to prevent XSS attacks
- **ObjectId validation** for MongoDB queries
- **Email format validation**
- **Location/coordinates validation**
- **Date range validation**
- **Pagination validation** (max 100 items per page)

### File Upload Security
- **Cloudinary integration** for secure cloud storage
- **File type validation** (images only: JPEG, PNG, GIF, WebP)
- **File extension validation**
- **File size limits** (5MB max per file)
- **Automatic image optimization** and resizing
- **Filename sanitization** to prevent directory traversal

### Error Handling
- **Production-safe error messages** (no sensitive data leakage)
- **Comprehensive error handling** for all error types
- **Development stack traces** (only in development mode)
- **Graceful error responses** with appropriate status codes

### Database Security
- **MongoDB transactions** for critical operations (user registration)
- **Atomic operations** to prevent race conditions
- **Connection pooling** with proper timeout configuration
- **Indexed queries** for performance and security

### CORS Configuration
- **Configurable allowed origins** (no wildcard with credentials)
- **Credential support** for authenticated requests
- **Development mode** allows localhost origins

### Request Security
- **Body size limits** (10MB) to prevent DoS attacks
- **Request timeout** handling
- **Environment variable validation** at startup

## 📦 Dependencies

### Core Dependencies
- `express` ^4.18.2 - Web framework
- `mongoose` ^8.0.3 - MongoDB ODM
- `jsonwebtoken` ^9.0.2 - JWT authentication
- `bcryptjs` ^2.4.3 - Password hashing
- `dotenv` ^16.3.1 - Environment variables

### File Upload & Media
- `multer` ^1.4.5-lts.1 - File upload handling
- `cloudinary` ^1.41.3 - Cloud image management
- `multer-storage-cloudinary` ^4.0.0 - Cloudinary storage adapter

### Security & Validation
- `express-validator` ^7.0.1 - Input validation
- `express-rate-limit` ^7.1.5 - Rate limiting
- `cors` ^2.8.5 - Cross-origin resource sharing

### Utilities
- `nodemailer` ^6.9.7 - Email notifications (optional)

### Dev Dependencies
- `nodemon` ^3.0.2 - Development auto-reload
- `jest` ^29.7.0 - Testing framework
- `supertest` ^6.3.3 - HTTP assertion library

## 🚀 Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start MongoDB** (if running locally)
   ```bash
   # macOS/Linux
   mongod

   # Windows
   net start MongoDB
   ```

4. **Run the server:**
   ```bash
   # Development mode (with auto-reload)
   npm run dev

   # Production mode
   npm start
   ```

5. **Access the API:**
   - Base URL: `http://localhost:5000`
   - Health check: `GET http://localhost:5000/health`
   - API Documentation: See API Endpoints section above

## 📝 Important Notes

### Image Uploads
- **All images are stored on Cloudinary**, not locally
- Images are automatically optimized and resized
- Profile pictures: Max 500x500px
- Opportunity images: Max 1200x800px
- Supported formats: JPEG, PNG, GIF, WebP
- Max file size: 5MB per file

### Database
- **MongoDB transactions** are used for user registration to ensure data consistency
- **Atomic operations** prevent race conditions in application creation
- **Geospatial indexes** are automatically created for location-based queries
- **Text indexes** are created for search functionality

### Admin Users
- Admin users must be created manually in the database
- Set `role: 'admin'` in the User document
- Admin users have full access to all endpoints

### Notifications
- Notifications are created automatically for:
  - New application received
  - Application status changes
  - New reviews received
- Notifications are stored in the database and can be retrieved via API

### Performance Optimizations
- **Incremental rating calculation** - Ratings are updated incrementally, not recalculated from all reviews
- **Efficient pagination** - All list endpoints support pagination
- **Database indexes** - Optimized queries with proper indexes
- **Connection pooling** - MongoDB connection pooling for better performance

### Security Best Practices
- **Never commit `.env` file** to version control
- **Use strong JWT secrets** (minimum 32 characters in production)
- **Configure CORS** properly for production
- **Enable HTTPS** in production
- **Regular security updates** for dependencies

## 🔄 Version History

### v2.0.0 (Current)
- ✅ Added application system with atomic operations
- ✅ Added reviews and ratings with incremental calculation
- ✅ Added notification system
- ✅ Integrated Cloudinary for cloud-based image storage
- ✅ Added admin dashboard
- ✅ Added saved searches
- ✅ Enhanced user profiles
- ✅ Advanced search filters
- ✅ MongoDB transactions for critical operations
- ✅ Enhanced security features
- ✅ Production-ready error handling
- ✅ Comprehensive input validation

### v1.0.0
- Initial release
- Basic authentication
- Opportunity CRUD
- Geo-based search

## 🐛 Troubleshooting

### Common Issues

**MongoDB Connection Error**
- Verify `MONGODB_URI` is correct in `.env`
- Ensure MongoDB is running (if local)
- Check network connectivity (if Atlas)

**Cloudinary Upload Fails**
- Verify Cloudinary credentials in `.env`
- Check Cloudinary account status
- Verify file size is under 5MB

**JWT Token Errors**
- Ensure `JWT_SECRET` is set in `.env`
- Check token expiration
- Verify token format in Authorization header

**CORS Errors**
- Add your frontend URL to `CORS_ORIGIN` in `.env`
- Use comma-separated values for multiple origins
- Ensure credentials are properly configured

## 📄 License

ISC

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Contribution Guidelines
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

For issues, questions, or contributions, please open an issue on GitHub.

---

**Built with ❤️ for connecting volunteers with meaningful opportunities**
