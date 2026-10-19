# Required Dependencies

The following dependencies are already installed for the doctor authentication system:

## Runtime Dependencies
```bash
npm install zod google-auth-library
```

## Dependency Rationale

- **zod**: Request validation schemas for API routes (installed via package.json)
- **google-auth-library**: Google OAuth token verification for web and mobile (installed)
- **bcrypt**: ❌ NOT NEEDED - Better Auth provides password hashing via `better-auth/crypto`

## Note on Password Hashing

The project uses Better Auth's built-in password hashing from `better-auth/crypto`:
- `hashPassword()` - hashes passwords using Better Auth's internal implementation
- `verifyPassword()` - verifies password hashes

No additional bcrypt dependency is required.

## Installation Command

All dependencies are already installed. If adding to a new environment:
```bash
npm install
```
