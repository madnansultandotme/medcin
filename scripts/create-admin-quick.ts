/**
 * Quick Admin User Creation Script
 * 
 * Creates an admin user with Better Auth (command-line args)
 * Usage: npx tsx scripts/create-admin-quick.ts <email> <name> <password> [phone]
 * Example: npx tsx scripts/create-admin-quick.ts admin@medcin.com "Admin User" "SecurePass123!" "+1234567890"
 */

import { db } from '@/db';
import { users, accounts } from '@/db/schema';
import { eq } from 'drizzle-orm';
import * as crypto from 'crypto';

/**
 * Hash password using the same algorithm as Better Auth (scrypt)
 * Better Auth format: salt:hexKey where salt is 16 random bytes hex-encoded
 * Parameters: N=16384, r=16, p=1, dkLen=64
 */
async function hashPassword(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    // Generate a random salt (16 bytes)
    const salt = crypto.randomBytes(16);
    const saltHex = salt.toString('hex');
    
    // scrypt parameters matching Better Auth
    const N = 16384;
    const r = 16;
    const p = 1;
    const maxmem = 128 * N * r * 2; // Required by Node.js
    
    crypto.scrypt(
      password.normalize('NFKC'), 
      saltHex, 
      64, 
      { N, r, p, maxmem }, 
      (err, derivedKey) => {
        if (err) reject(err);
        
        // Return in Better Auth format: salt:hexKey (colon separator)
        const hash = `${saltHex}:${derivedKey.toString('hex')}`;
        resolve(hash);
      }
    );
  });
}

/**
 * Generate a random ID (Better Auth format)
 */
function generateId(): string {
  return crypto.randomBytes(16).toString('base64url');
}

async function createAdmin() {
  try {
    // Parse command-line arguments
    const [, , email, name, password, phone] = process.argv;

    if (!email || !name || !password) {
      console.error('\n❌ Usage: npm run create-admin-quick <email> <name> <password> [phone]\n');
      console.error('Example: npm run create-admin-quick admin@medcin.com "Admin User" "SecurePass123!" "+1234567890"\n');
      process.exit(1);
    }

    console.log('\n🔐 Creating admin user...\n');

    // Check if user already exists
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existing.length > 0) {
      console.error(`❌ User with email ${email} already exists!`);
      process.exit(1);
    }

    // Generate user ID
    const userId = generateId();

    // Step 1: Create user record
    const newUser = await db
      .insert(users)
      .values({
        id: userId,
        email: email.toLowerCase().trim(),
        name: name.trim(),
        phone: phone?.trim() || null,
        role: 'ADMIN',
        emailVerified: true, // Auto-verify admin users
        authUid: null, // Not using old Neon Auth
      })
      .returning();

    console.log('✅ User record created:', newUser[0].id);

    // Step 2: Create account record with password
    const accountId = generateId();
    const hashedPassword = await hashPassword(password);

    const newAccount = await db
      .insert(accounts)
      .values({
        id: accountId,
        accountId: userId, // Same as userId for email/password provider
        providerId: 'credential', // Better Auth uses 'credential' for email/password
        userId: userId,
        password: hashedPassword,
      })
      .returning();

    console.log('✅ Account record created:', newAccount[0].id);

    console.log('\n🎉 Admin user created successfully!\n');
    console.log('Details:');
    console.log(`  Email: ${email}`);
    console.log(`  Name: ${name}`);
    console.log(`  Role: ADMIN`);
    console.log(`  User ID: ${userId}`);
    console.log('\n✅ You can now login with these credentials at /login\n');

  } catch (error) {
    console.error('\n❌ Error creating admin user:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

// Run the script
createAdmin();
