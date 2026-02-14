import crypto from 'crypto'

/**
 * Encryption utility for securely storing sensitive data like OAuth refresh tokens.
 * Uses AES-256-GCM encryption with a key derived from environment variable.
 */

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 12 // GCM requires 12-byte IV
const SALT_LENGTH = 64
const TAG_LENGTH = 16
const KEY_LENGTH = 32

/**
 * Get encryption key from environment variable.
 * Falls back to a default key in development (should be changed in production).
 */
function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY || 'default-encryption-key-change-in-production-32-chars!!'
  
  if (key.length < 32) {
    throw new Error('ENCRYPTION_KEY must be at least 32 characters long')
  }
  
  // Use first 32 bytes of the key
  return Buffer.from(key.slice(0, 32), 'utf-8')
}

/**
 * Encrypts a plaintext string.
 * Returns a hex-encoded string containing: salt + iv + tag + encryptedData
 */
export function encrypt(plaintext: string): string {
  if (!plaintext) {
    throw new Error('Cannot encrypt empty string')
  }

  const key = getEncryptionKey()
  const salt = crypto.randomBytes(SALT_LENGTH)
  const iv = crypto.randomBytes(IV_LENGTH)
  
  // Derive key from master key and salt
  const derivedKey = crypto.pbkdf2Sync(key, salt, 100000, KEY_LENGTH, 'sha256')
  
  const cipher = crypto.createCipheriv(ALGORITHM, derivedKey, iv)
  
  let encrypted = cipher.update(plaintext, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  
  const tag = cipher.getAuthTag()
  
  // Combine: salt + iv + tag + encrypted
  const combined = Buffer.concat([
    salt,
    iv,
    tag,
    Buffer.from(encrypted, 'hex')
  ])
  
  return combined.toString('hex')
}

/**
 * Decrypts an encrypted hex string.
 * Expects format: salt + iv + tag + encryptedData
 */
export function decrypt(encryptedHex: string): string {
  if (!encryptedHex) {
    throw new Error('Cannot decrypt empty string')
  }

  const key = getEncryptionKey()
  const combined = Buffer.from(encryptedHex, 'hex')
  
  // Extract components
  const salt = combined.slice(0, SALT_LENGTH)
  const iv = combined.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH)
  const tag = combined.slice(SALT_LENGTH + IV_LENGTH, SALT_LENGTH + IV_LENGTH + TAG_LENGTH)
  const encrypted = combined.slice(SALT_LENGTH + IV_LENGTH + TAG_LENGTH)
  
  // Derive key from master key and salt
  const derivedKey = crypto.pbkdf2Sync(key, salt, 100000, KEY_LENGTH, 'sha256')
  
  const decipher = crypto.createDecipheriv(ALGORITHM, derivedKey, iv)
  decipher.setAuthTag(tag)
  
  let decrypted = decipher.update(encrypted, undefined, 'utf8')
  decrypted += decipher.final('utf8')
  
  return decrypted
}

