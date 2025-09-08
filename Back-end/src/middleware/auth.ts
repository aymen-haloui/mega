import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { JWTPayload, Role } from '../types';
import { prisma } from '../config/database';

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: Role;
        branchId?: string;
      };
    }
  }
}

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as JWTPayload;
    
    // Verify user still exists and is not blocked
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, role: true, branchId: true, isBlocked: true }
    });

    if (!user || user.isBlocked) {
      return res.status(401).json({ error: 'Invalid or blocked user' });
    }

    req.user = {
      id: user.id,
      role: user.role,
      branchId: user.branchId || undefined
    };

    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

export const requireRole = (roles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

export const requireAdmin = requireRole([Role.ADMIN]);
export const requireBranchUser = requireRole([Role.BRANCH_USER]);
export const requireAnyRole = requireRole([Role.ADMIN, Role.BRANCH_USER]);

export const requireBranchAccess = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // Admin can access any branch
  if (req.user.role === Role.ADMIN) {
    return next();
  }

  // Branch users can only access their own branch
  const branchId = req.params.branchId || req.body.branchId || req.query.branchId;
  
  if (!branchId) {
    return res.status(400).json({ error: 'Branch ID required' });
  }

  if (req.user.branchId !== branchId) {
    return res.status(403).json({ error: 'Access denied to this branch' });
  }

  next();
};
