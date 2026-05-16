# Admin Authentication & Security Implementation Guide

## Overview
This guide documents the complete admin authentication system implemented for the WeCare Hospital MERN stack application using JWT (JSON Web Tokens) with HttpOnly cookies and localStorage fallback.

## Architecture

### Backend Components

#### 1. **Admin Model** (`backend/models/Admin.js`)
- Stores admin user data with secure password hashing
- Fields: username, email, password, role (admin/superadmin), isActive, lastLogin, passwordChangedAt
- Pre-save hooks automatically hash passwords using bcryptjs (salt rounds: 12)
- Custom methods: `comparePassword()` for authentication
- Password field is excluded from queries by default (`select: false`)

#### 2. **Authentication Controller** (`backend/controllers/authController.js`)
Functions implemented:
- `registerAdmin` - Create new admin account
- `loginAdmin` - Authenticate and generate tokens
- `logoutAdmin` - Clear authentication cookies
- `getProfile` - Get current admin profile
- `updateProfile` - Update admin details
- `changePassword` - Secure password change
- `refreshToken` - Refresh expired access tokens
- `getAllAdmins` - List all admins (superadmin only)

#### 3. **Authentication Routes** (`backend/routes/authRoutes.js`)
- `POST /api/auth/register` - Register new admin
- `POST /api/auth/login` - Admin login
- `POST /api/auth/logout` - Admin logout (protected)
- `GET /api/auth/profile` - Get profile (protected)
- `PUT /api/auth/profile` - Update profile (protected)
- `PUT /api/auth/password` - Change password (protected)
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/admins` - List admins (superadmin only)

#### 4. **Authentication Middleware** (`backend/middleware/authMiddleware.js`)
- `protect` - Verifies JWT token from cookies or Authorization header
- `restrictTo` - Role-based access control
- `optionalAuth` - Optional authentication (doesn't fail if no token)

#### 5. **Server Configuration** (`backend/server.js`)
- CORS configured with `credentials: true` to allow cookies
- Cookie parser middleware for reading HttpOnly cookies
- Environment-based CORS origins (localhost for dev, specific domain for production)

### Frontend Components

#### 1. **Auth Context** (`frontend/src/context/AuthContext.jsx`)
Provides:
- `admin` - Current admin user data
- `isAuthenticated` - Authentication status
- `loading` - Loading state during auth checks
- `login(email, password)` - Login function
- `register(username, email, password)` - Registration function
- `logout()` - Logout function
- `updateProfile(data)` - Update profile function
- `changePassword(currentPassword, newPassword)` - Change password function

#### 2. **Login Page** (`frontend/src/components/LoginPage.jsx`)
- Toggle between login and registration
- Password visibility toggle
- Form validation
- Error/success message display
- Loading states

#### 3. **Updated App** (`frontend/src/App.jsx`)
- Wrapped with `AuthProvider` for context
- Protected admin dashboard route
- Redirects to login when accessing admin without authentication
- Shows loading state during auth verification

#### 4. **Updated Navbar** (`frontend/src/components/Navbar.jsx`)
- Shows admin username when logged in
- Logout button with confirmation
- Admin navigation link
- Mobile-responsive auth UI

#### 5. **Updated Admin Dashboard** (`frontend/src/components/AdminDashboard.jsx`)
- Integrated with auth context
- Ready to display admin information
- Logout functionality available

## Security Features

### 1. **Password Security**
- Passwords hashed with bcryptjs (12 salt rounds)
- Password field never returned in API responses
- Password change requires current password verification

### 2. **JWT Token Strategy**
- **Access Token**: 7-day expiration (configurable via `JWT_EXPIRES_IN`)
- **Refresh Token**: 30-day expiration (configurable via `JWT_REFRESH_EXPIRES_IN`)
- Separate secrets for access and refresh tokens

### 3. **HttpOnly Cookies**
- Tokens stored in HttpOnly cookies (not accessible via JavaScript)
- `Secure` flag enabled in production (HTTPS only)
- `SameSite=None` in production for cross-site requests
- `SameSite=Lax` in development

### 4. **CORS Protection**
- Credentials mode enabled for cookie transmission
- Origin whitelist (localhost in dev, specific domain in production)
- Proper headers configuration

### 5. **Token Verification**
- Every protected route verifies token validity
- Checks if admin still exists and is active
- Handles expired/invalid tokens gracefully

### 6. **Role-Based Access Control**
- `admin` role for regular administrators
- `superadmin` role for full access (e.g., viewing all admins)

## Environment Variables

Required in `.env`:
```
MONGO_URI=mongodb://127.0.0.1:27017/wecare_hospital
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-chars
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production-min-32-chars
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d
NODE_ENV=development
BACKEND_PORT=5000
FRONTEND_URL=http://localhost:3000
```

## Usage Examples

### Register First Admin
```javascript
POST /api/auth/register
Content-Type: application/json

{
  "username": "admin",
  "email": "admin@wecare.com",
  "password": "securepassword123"
}
```

### Login
```javascript
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@wecare.com",
  "password": "securepassword123"
}
```

Response includes:
- HttpOnly cookies set automatically
- Token also returned in response body for localStorage fallback
- Admin user data

### Access Protected Routes
```javascript
// Cookies are sent automatically with axios (withCredentials: true)
// Or manually add Authorization header:
GET /api/auth/profile
Authorization: Bearer <token>
```

### Logout
```javascript
POST /api/auth/logout
// Clears all authentication cookies
```

### Change Password
```javascript
PUT /api/auth/password
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "oldpassword",
  "newPassword": "newsecurepassword"
}
```

## Testing the Implementation

### Important: Install Dependencies First!
After cloning or setting up this project, you MUST install the backend dependencies before running the server. The authentication system requires additional packages (bcryptjs, jsonwebtoken, cookie-parser) that are not included by default.

### 1. Start MongoDB
```bash
mongod
```

### 2. Install Backend Dependencies & Start Server
```bash
cd backend
npm install   # IMPORTANT: Install new dependencies (bcryptjs, jsonwebtoken, cookie-parser)
npm run dev
```
Server runs on `http://localhost:5000`

### 3. Install Frontend Dependencies & Start
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on `http://localhost:3000`

### 4. Test Authentication Flow
1. Navigate to `http://localhost:3000`
2. Click "Admin" in navbar
3. If not logged in, redirected to login page
4. Register a new admin account
5. After successful registration, automatically logged in and redirected to admin dashboard
6. Admin username appears in navbar with logout button
7. Click logout to sign out

## Production Considerations

### 1. **Environment Variables**
- Use strong, random secrets (min 32 characters)
- Never commit `.env` file
- Use environment-specific values

### 2. **HTTPS**
- Required for secure cookies in production
- Update CORS origin to your production domain

### 3. **Rate Limiting**
- Implement rate limiting on auth endpoints
- Prevent brute force attacks

### 4. **Account Lockout**
- Consider implementing account lockout after failed attempts
- Add CAPTCHA for multiple failed logins

### 5. **Session Management**
- Implement session tracking
- Allow users to view active sessions
- Provide option to revoke sessions

### 6. **Audit Logging**
- Log all authentication events
- Track login attempts, password changes, etc.

## Troubleshooting

### Cookies Not Setting
- Check CORS configuration (credentials: true)
- Ensure frontend sends requests with `withCredentials: true`
- Verify domain/origin matches

### Token Expiration
- Implement token refresh logic
- Use refresh token endpoint before access token expires
- Handle 401 responses by redirecting to login

### Authentication State Persistence
- Token stored in localStorage as fallback
- On app load, check localStorage and verify token
- If invalid, clear and redirect to login

## API Response Format

All responses follow this structure:
```javascript
{
  "success": true/false,
  "message": "Description of result",
  "data": { /* response data */ },
  "error": "Error message if success is false"
}
```

## Conclusion

This authentication system provides a secure, scalable foundation for admin access control in the WeCare Hospital application. It combines industry best practices with user-friendly implementation, ensuring both security and usability.