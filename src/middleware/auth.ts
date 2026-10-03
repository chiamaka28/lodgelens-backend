import type { Request, Response, NextFunction } from 'express';
import jwt, { type JwtPayload } from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: 'STUDENT' | 'LODGE_OWNER' | 'ADMIN';
    status: 'PENDING' | 'APPROVED' | 'SUSPENDED';
  };
}

interface CustomJwtPayload extends JwtPayload {
  id: string;
  email: string;
  role: 'STUDENT' | 'LODGE_OWNER' | 'ADMIN';
  status: 'PENDING' | 'APPROVED' | 'SUSPENDED';
}

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): void => {
  const authHeader = req.headers.authorization || '';
  const [scheme, token] = authHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    res.status(401).json({ success: false, message: 'Missing or invalid Authorization header' });
    return;
  }

  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      res.status(500).json({ success: false, message: 'Server configuration error' });
      return;
    }

    const decoded = jwt.verify(token, jwtSecret) as CustomJwtPayload;
    if (typeof decoded !== 'object' || !decoded.id || !decoded.email || !decoded.role || !decoded.status) {
      res.status(401).json({ success: false, message: 'Invalid token payload' });
      return;
    }

    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      status: decoded.status,
    };
    next();
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      res.status(401).json({ success: false, message: 'Access token expired' });
      return;
    }
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
};


export function requireRole(...allowed: NonNullable<AuthRequest['user']>['role'][]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }
    if (!allowed.includes(req.user.role)) {
      res.status(403).json({ success: false, message: 'Insufficient permissions' });
      return;
    }
    next();
  };
}

export function requireApproved(req: AuthRequest, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Not authenticated' });
    return;
  }
  if (req.user.status !== 'APPROVED') {
    res.status(403).json({
      success: false,
      message: `Account is ${req.user.status.toLowerCase()} — this action requires admin approval`,
    });
    return;
  }
  next();
}