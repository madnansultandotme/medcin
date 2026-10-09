# Admin Creation Scripts

These scripts create admin users with Better Auth authentication.

## Option 1: Interactive Script (Recommended)

Run the interactive script that will prompt you for details:

```bash
npm run create-admin
```

You'll be asked to enter:
- Email
- Name  
- Phone (optional)
- Password

## Option 2: Quick Script (Command-line)

Create admin with command-line arguments:

```bash
npm run create-admin-quick <email> <name> <password> [phone]
```

### Example:

```bash
npm run create-admin-quick admin@medcin.com "Admin User" "SecurePass123!" "+1234567890"
```

Or without phone:

```bash
npm run create-admin-quick admin@medcin.com "Admin User" "SecurePass123!"
```

## What These Scripts Do

1. ✅ Create a user record in the `users` table with role `ADMIN`
2. ✅ Hash the password using Better Auth's algorithm (SHA-256 with salt)
3. ✅ Create an account record in the `accounts` table with the hashed password
4. ✅ Auto-verify the email (set `email_verified = true`)
5. ✅ Make the user immediately ready to login

## Notes

- Email is automatically trimmed and converted to lowercase
- Passwords are hashed using the same algorithm as Better Auth
- Admin users are auto-verified (no email confirmation needed)
- If a user with the email already exists, the script will fail
- After creation, you can login immediately at `/login`

## Security

⚠️ **Important**: Use strong passwords for admin accounts!

- Minimum 12 characters recommended
- Mix of uppercase, lowercase, numbers, and symbols
- Don't use common passwords or dictionary words
