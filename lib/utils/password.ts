/**
 * Password Hashing Utilities
 * 
 * Uses scrypt to match Better Auth's default password hashing algorithm
 */

import crypto from 'crypto';

/**
 * Hash password using the same algorithm as Better Auth (scrypt)
 * Better Auth format: salt:hexKey where salt is 16 random bytes hex-encoded
 * Parameters: N=16384, r=16, p=1, dkLen=64
 */
export async function hashPassword(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    // Generate a random salt (16 bytes)
    const salt = crypto.randomBytes(16);
    const saltHex = salt.toString('hex');
    
    // scrypt parameters matching Better Auth
    const N = 16384;
    const r = 16;
    const p = 1;
    const dkLen = 64;
    const maxmem = 128 * N * r * 2; // Required by Node.js
    
    crypto.scrypt(
      password.normalize('NFKC'), 
      saltHex, 
      dkLen,
      { N, r, p, maxmem },
      (err, derivedKey) => {
        if (err) reject(err);
        // Format: salt:derivedKey (both hex-encoded)
        resolve(`${saltHex}:${derivedKey.toString('hex')}`);
      }
    );
  });
}

/**
 * Verify password against a stored hash
 * Format: salt:hexKey
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const [saltHex, storedKey] = hash.split(':');
    
    if (!saltHex || !storedKey) {
      return resolve(false);
    }

    // scrypt parameters matching Better Auth
    const N = 16384;
    const r = 16;
    const p = 1;
    const dkLen = 64;
    const maxmem = 128 * N * r * 2;

    crypto.scrypt(
      password.normalize('NFKC'),
      saltHex,
      dkLen,
      { N, r, p, maxmem },
      (err, derivedKey) => {
        if (err) reject(err);
        const derivedKeyHex = derivedKey.toString('hex');
        resolve(derivedKeyHex === storedKey);
      }
    );
  });
}
