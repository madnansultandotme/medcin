# Required Dependencies

The following dependencies need to be installed for the doctor authentication system:

## Runtime Dependencies
```bash
npm install bcrypt zod google-auth-library
```

## Dev Dependencies
```bash
npm install -D @types/bcrypt
```

## Dependency Rationale

- **bcrypt**: Password hashing and verification (matches Better Auth's default pattern)
- **zod**: Request validation schemas for API routes
- **google-auth-library**: Google OAuth token verification for web and mobile
- **@types/bcrypt**: TypeScript types for bcrypt

## Installation Command

Run this before building:
```bash
npm install bcrypt zod google-auth-library && npm install -D @types/bcrypt
```
