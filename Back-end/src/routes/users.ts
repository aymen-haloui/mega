import express from 'express';
import { prisma } from '../config/database';
import { authenticateToken, requireAdmin, requireAnyRole } from '../middleware/auth';
import { validateRequest, schemas } from '../middleware/validation';
import Joi from 'joi';
import { auditCreate, auditUpdate, auditDelete } from '../middleware/audit';
import { asyncHandler } from '../middleware/error';
import { createPaginatedResponse, sanitizePhone } from '../utils/helpers';
import { Role, UserSearchParams, FraudUserResponse } from '../types';

const router = express.Router();

// Get all users with search and pagination
router.get('/',
  authenticateToken,
  requireAnyRole,
  validateRequest(schemas.userSearch),
  asyncHandler(async (req, res) => {
    const {
      search,
      role,
      branchId,
      isBlocked,
      page = 1,
      limit = 10
    } = req.query as UserSearchParams;

    const skip = (page - 1) * limit;
    const where: any = {};

    // Apply filters
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (role) {
      where.role = role;
    }

    if (branchId) {
      where.branchId = branchId;
    }

    if (isBlocked !== undefined) {
      where.isBlocked = isBlocked;
    }

    // Branch users can only see users from their branch
    if (req.user?.role === Role.BRANCH_USER) {
      where.branchId = req.user.branchId;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: { branch: true },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({ where })
    ]);

    const response = createPaginatedResponse(users, page, limit, total);
    res.json(response);
  })
);

// Get user by ID
router.get('/:id',
  authenticateToken,
  requireAnyRole,
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      include: { branch: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Branch users can only see users from their branch
    if (req.user?.role === Role.BRANCH_USER && user.branchId !== req.user.branchId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(user);
  })
);

// Create user (Admin only)
router.post('/',
  authenticateToken,
  requireAdmin,
  validateRequest(schemas.createUser),
  auditCreate('User'),
  asyncHandler(async (req, res) => {
    const { name, phone, role, branchId, password } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { phone: sanitizePhone(phone) }
    });

    if (existingUser) {
      return res.status(409).json({ error: 'User with this phone already exists' });
    }

    // Validate branch exists if provided
    if (branchId) {
      const branch = await prisma.branch.findUnique({
        where: { id: branchId }
      });

      if (!branch) {
        return res.status(400).json({ error: 'Branch not found' });
      }
    }

    const user = await prisma.user.create({
      data: {
        name,
        phone: sanitizePhone(phone),
        role,
        branchId: branchId || null,
        createdBy: req.user?.id
      },
      include: { branch: true }
    });

    res.status(201).json(user);
  })
);

// Update user
router.put('/:id',
  authenticateToken,
  requireAnyRole,
  validateRequest(schemas.updateUser),
  auditUpdate('User'),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id }
    });

    if (!existingUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Branch users can only update users from their branch
    if (req.user?.role === Role.BRANCH_USER && existingUser.branchId !== req.user.branchId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Sanitize phone if provided
    if (updateData.phone) {
      updateData.phone = sanitizePhone(updateData.phone);
    }

    const user = await prisma.user.update({
      where: { id },
      data: {
        ...updateData,
        updatedBy: req.user?.id
      },
      include: { branch: true }
    });

    res.json(user);
  })
);

// Delete user (Admin only)
router.delete('/:id',
  authenticateToken,
  requireAdmin,
  auditDelete('User'),
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await prisma.user.delete({
      where: { id }
    });

    res.json({ message: 'User deleted successfully' });
  })
);

// Block/Unblock user
router.put('/:id/block',
  authenticateToken,
  requireAdmin,
  validateRequest(Joi.object({
    isBlocked: Joi.boolean().required(),
    reason: Joi.string().max(200).optional()
  })),
  auditUpdate('User'),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { isBlocked, reason } = req.body;

    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        isBlocked,
        notes: reason ? `${user.notes || ''}\nBlocked: ${reason}`.trim() : user.notes,
        updatedBy: req.user?.id
      },
      include: { branch: true }
    });

    res.json(updatedUser);
  })
);

// Get fraud/suspicious users
router.get('/fraud/list',
  authenticateToken,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { maxCancellations = 5, maxNoShows = 3 } = req.query;

    const fraudUsers = await prisma.user.findMany({
      where: {
        OR: [
          { cancellationCount: { gte: parseInt(maxCancellations as string) } },
          { noShowCount: { gte: parseInt(maxNoShows as string) } }
        ]
      },
      include: { branch: true },
      orderBy: [
        { cancellationCount: 'desc' },
        { noShowCount: 'desc' }
      ]
    });

    // Calculate additional fraud metrics
    const fraudData: FraudUserResponse[] = await Promise.all(
      fraudUsers.map(async (user) => {
        // Calculate total spent
        const orders = await prisma.order.findMany({
          where: { userPhone: user.phone },
          select: { totalCents: true }
        });

        const totalSpent = orders.reduce((sum, order) => sum + order.totalCents, 0);

        return {
          user,
          cancellationCount: user.cancellationCount,
          noShowCount: user.noShowCount,
          lastOrderAt: user.lastOrderAt,
          totalSpent
        };
      })
    );

    res.json(fraudData);
  })
);

// Add notes to user
router.put('/:id/notes',
  authenticateToken,
  requireAdmin,
  validateRequest(Joi.object({
    notes: Joi.string().max(500).required()
  })),
  auditUpdate('User'),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { notes } = req.body;

    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        notes: `${user.notes || ''}\n${new Date().toISOString()}: ${notes}`.trim(),
        updatedBy: req.user?.id
      },
      include: { branch: true }
    });

    res.json(updatedUser);
  })
);

// Search users by phone/name (quick search)
router.get('/search/quick',
  authenticateToken,
  requireAnyRole,
  asyncHandler(async (req, res) => {
    const { q } = req.query;

    if (!q || q.length < 2) {
      return res.status(400).json({ error: 'Search query must be at least 2 characters' });
    }

    const users = await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: q as string, mode: 'insensitive' } },
          { phone: { contains: q as string, mode: 'insensitive' } }
        ]
      },
      include: { branch: true },
      take: 10,
      orderBy: { name: 'asc' }
    });

    res.json(users);
  })
);

export default router;
