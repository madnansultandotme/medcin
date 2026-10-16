# Medcin Mobile API v1

Base URL: `https://medcin.vercel.app/api/mobile/v1`

## Authentication

All authenticated endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <token>
```

## Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `POST /auth/refresh` - Refresh session token
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password with token
- `POST /auth/change-password` - Change password (authenticated)

### User Profile
- `GET /profile` - Get user profile (authenticated)
- `PATCH /profile` - Update user profile (authenticated)

### Doctors
- `GET /doctors` - List doctors
- `GET /doctors/search` - Search doctors with filters
- `GET /doctors/:id` - Get doctor details
- `GET /doctors/categories` - Get doctor categories

### Centers
- `GET /centers` - Search medical centers
- `GET /centers/:id` - Get center details
- `GET /centers/categories` - Get center categories

### Bookings
- `GET /bookings` - Get user bookings (authenticated)
- `POST /bookings` - Create booking (authenticated)
- `GET /bookings/:id` - Get booking details (authenticated)
- `PATCH /bookings/:id` - Cancel booking (authenticated)

### Slots
- `GET /slots` - Get available time slots

### Reviews
- `GET /reviews` - Get reviews for a doctor
- `POST /reviews` - Create review (authenticated)

### Notifications
- `GET /notifications` - Get user notifications (authenticated)
- `PATCH /notifications` - Mark all as read (authenticated)
- `PATCH /notifications/:id` - Mark notification as read (authenticated)
- `DELETE /notifications/:id` - Delete notification (authenticated)

### Subscription
- `GET /subscription` - Get subscription status (authenticated)
- `POST /subscription` - Activate subscription (authenticated)
- `DELETE /subscription` - Cancel subscription (authenticated)

### Utility
- `GET /health` - Health check
- `GET /version` - API version and app requirements

## Response Format

Success:
```json
{
  "success": true,
  "data": { ... }
}
```

Error:
```json
{
  "success": false,
  "error": "Error message"
}
```
