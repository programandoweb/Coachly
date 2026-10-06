import crypto from 'node:crypto';

const ITERATIONS = 120000;
const KEY_LENGTH = 64;
const DIGEST = 'sha512';

export function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, DIGEST).toString('hex');
  return `pbkdf2$${ITERATIONS}$${salt}$${hash}`;
}

export function verifyPassword(password: string, storedHash: string) {
  const [algo, iterationsRaw, salt, originalHash] = storedHash.split('$');
  if (algo !== 'pbkdf2' || !iterationsRaw || !salt || !originalHash) return false;

  const iterations = Number(iterationsRaw);
  const candidate = crypto.pbkdf2Sync(password, salt, iterations, KEY_LENGTH, DIGEST).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(candidate, 'hex'), Buffer.from(originalHash, 'hex'));
}

export function randomToken(size = 24) {
  return crypto.randomBytes(size).toString('base64url');
}
