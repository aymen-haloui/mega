import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { AuditLogData } from '../types';

export const auditLog = (action: string, entity: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const originalSend = res.send;
    const originalJson = res.json;

    // Store original values for comparison
    let originalData: any = null;
    if (req.method === 'PUT' || req.method === 'PATCH') {
      // For updates, we'll need to fetch the original data
      // This is a simplified version - in production you might want to store this differently
      originalData = req.body;
    }

    // Override response methods to capture the response
    res.send = function(data: any) {
      logAuditEvent(req, res, action, entity, originalData, data);
      return originalSend.call(this, data);
    };

    res.json = function(data: any) {
      logAuditEvent(req, res, action, entity, originalData, data);
      return originalJson.call(this, data);
    };

    next();
  };
};

async function logAuditEvent(
  req: Request, 
  res: Response, 
  action: string, 
  entity: string, 
  oldValues: any, 
  newValues: any
) {
  try {
    const auditData: AuditLogData = {
      action,
      entity,
      entityId: req.params.id || req.body.id || 'unknown',
      oldValues: oldValues ? JSON.stringify(oldValues) : null,
      newValues: newValues ? JSON.stringify(newValues) : null,
      userId: req.user?.id,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent')
    };

    await prisma.auditLog.create({
      data: auditData
    });
  } catch (error) {
    console.error('Failed to create audit log:', error);
    // Don't throw error to avoid breaking the main request
  }
}

// Specific audit middleware for different operations
export const auditCreate = (entity: string) => auditLog('CREATE', entity);
export const auditUpdate = (entity: string) => auditLog('UPDATE', entity);
export const auditDelete = (entity: string) => auditLog('DELETE', entity);
export const auditLogin = () => auditLog('LOGIN', 'User');
export const auditLogout = () => auditLog('LOGOUT', 'User');
