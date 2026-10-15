import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import { PermissionKey, RolePermissionsMap, UserRole } from './types';
import { db } from './db';

// Secrets and Expiry from environment with fallback safe defaults
const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'sugar_business_jwt_access_secret_key_2026_dev_mode';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'sugar_business_jwt_refresh_secret_key_2026_dev_mode';

function parseExpirySeconds(expiryStr: string | undefined, defaultSeconds: number): number {
  if (!expiryStr) return defaultSeconds;
  const match = expiryStr.trim().match(/^(\d+)([smhd])$/);
  if (!match) return defaultSeconds;
  const val = parseInt(match[1], 10);
  const unit = match[2];
  switch (unit) {
    case 's': return val;
    case 'm': return val * 60;
    case 'h': return val * 3600;
    case 'd': return val * 86400;
    default: return defaultSeconds;
  }
}

const ACCESS_EXPIRY_SECONDS = parseExpirySeconds(process.env.JWT_ACCESS_EXPIRY, 15 * 60);
const REFRESH_EXPIRY_SECONDS = parseExpirySeconds(process.env.JWT_REFRESH_EXPIRY, 7 * 24 * 60 * 60);

// ----------------------------------------------------
// SECURE PASSWORD HASHING (scrypt with cryptographically random salt)
// ----------------------------------------------------
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return `${salt}:${derivedKey.toString('hex')}`;
}

export function verifyPassword(password: string, combinedHash: string): boolean {
  try {
    const [salt, key] = combinedHash.split(':');
    if (!salt || !key) return false;
    const keyBuffer = Buffer.from(key, 'hex');
    const derivedKey = crypto.scryptSync(password, salt, 64);
    return crypto.timingSafeEqual(keyBuffer, derivedKey);
  } catch {
    return false;
  }
}

// ----------------------------------------------------
// TOKEN GENERATION & VERIFICATION (HMAC-SHA256 JWT)
// ----------------------------------------------------
interface TokenPayload {
  userId: string;
  phone: string;
  role: UserRole;
  exp: number;
  jti?: string;
}

export function generateAccessToken(user: { id: string; phone: string; role: UserRole }): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payload: TokenPayload = {
    userId: user.id,
    phone: user.phone,
    role: user.role,
    exp: Math.floor(Date.now() / 1000) + ACCESS_EXPIRY_SECONDS,
  };
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', ACCESS_SECRET)
    .update(`${header}.${payloadB64}`)
    .digest('base64url');

  return `${header}.${payloadB64}.${signature}`;
}

export function generateRefreshToken(user: { id: string; phone: string; role: UserRole }): { token: string; jti: string; expiresAt: Date } {
  const jti = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + REFRESH_EXPIRY_SECONDS * 1000);
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payload: TokenPayload = {
    userId: user.id,
    phone: user.phone,
    role: user.role,
    jti,
    exp: Math.floor(expiresAt.getTime() / 1000),
  };
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', REFRESH_SECRET)
    .update(`${header}.${payloadB64}`)
    .digest('base64url');

  const token = `${header}.${payloadB64}.${signature}`;
  return { token, jti, expiresAt };
}

export function verifyAccessToken(token: string): TokenPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [header, payloadB64, signature] = parts;

    const expectedSig = crypto
      .createHmac('sha256', ACCESS_SECRET)
      .update(`${header}.${payloadB64}`)
      .digest('base64url');

    if (signature !== expectedSig) return null;

    const payload: TokenPayload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf-8'));
    if (payload.exp && Date.now() / 1000 > payload.exp) return null;

    return payload;
  } catch {
    return null;
  }
}

export function verifyRefreshToken(token: string): TokenPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [header, payloadB64, signature] = parts;

    const expectedSig = crypto
      .createHmac('sha256', REFRESH_SECRET)
      .update(`${header}.${payloadB64}`)
      .digest('base64url');

    if (signature !== expectedSig) return null;

    const payload: TokenPayload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf-8'));
    if (payload.exp && Date.now() / 1000 > payload.exp) return null;

    return payload;
  } catch {
    return null;
  }
}

// ----------------------------------------------------
// EXPRESS AUTHENTICATION & RBAC MIDDLEWARES
// ----------------------------------------------------
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    phone: string;
    role: UserRole;
    customer?: any;
    business?: any;
    employee?: any;
  };
}

export function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];
  const payload = verifyAccessToken(token);

  if (payload) {
    const user = db.findUserById(payload.userId);
    if (user && user.status === 'ACTIVE') {
      req.user = {
        id: user.id,
        phone: user.phone,
        role: user.role,
        customer: db.findCustomerByUserId(user.id),
        business: db.findBusinessByUserId(user.id),
        employee: db.findEmployeeByUserId(user.id),
      };
    }
  }
  next();
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'يرجى تسجيل الدخول أولاً للوصول إلى هذه الصفحة' },
    });
    return;
  }
  next();
}

export function requireRole(allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'يرجى تسجيل الدخول أولاً' },
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'ليس لديك صلاحية لتنفيذ هذا الإجراء' },
      });
      return;
    }
    next();
  };
}

export function requirePermission(permission: PermissionKey) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'يرجى تسجيل الدخول أولاً' },
      });
      return;
    }

    const userPerms = RolePermissionsMap[req.user.role] || [];
    if (!userPerms.includes(permission)) {
      res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN_PERMISSION', message: `يتطلب هذا الإجراء صلاحية: ${permission}` },
      });
      return;
    }
    next();
  };
}
