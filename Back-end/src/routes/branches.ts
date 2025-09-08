import express from 'express';
import { prisma } from '../config/database';
import { authenticateToken, requireAdmin, requireAnyRole } from '../middleware/auth';
import { validateRequest, schemas } from '../middleware/validation';
import { auditCreate, auditUpdate, auditDelete } from '../middleware/audit';
import { asyncHandler } from '../middleware/error';
import { createPaginatedResponse, calculateDistance } from '../utils/helpers';
import { Role } from '../types';

const router = express.Router();

// Get all branches
router.get('/',
  authenticateToken,
  requireAnyRole,
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, search } = req.query;

    const skip = (page - 1) * limit;
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { address: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    // Branch users can only see their own branch
    if (req.user?.role === Role.BRANCH_USER) {
      where.id = req.user.branchId;
    }

    const [branches, total] = await Promise.all([
      prisma.branch.findMany({
        where,
        include: {
          users: {
            select: {
              id: true,
              name: true,
              phone: true,
              role: true,
              isBlocked: true
            }
          },
          menus: {
            select: {
              id: true,
              name: true,
              createdAt: true
            }
          },
          _count: {
            select: {
              orders: true
            }
          }
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.branch.count({ where })
    ]);

    const response = createPaginatedResponse(branches, page, limit, total);
    res.json(response);
  })
);

// Get branch by ID
router.get('/:id',
  authenticateToken,
  requireAnyRole,
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const branch = await prisma.branch.findUnique({
      where: { id },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            phone: true,
            role: true,
            isBlocked: true,
            createdAt: true
          }
        },
        menus: {
          include: {
            dishes: {
              select: {
                id: true,
                name: true,
                priceCents: true,
                available: true,
                createdAt: true
              }
            }
          }
        },
        _count: {
          select: {
            orders: true
          }
        }
      }
    });

    if (!branch) {
      return res.status(404).json({ error: 'Branch not found' });
    }

    // Branch users can only see their own branch
    if (req.user?.role === Role.BRANCH_USER && branch.id !== req.user.branchId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(branch);
  })
);

// Create branch (Admin only)
router.post('/',
  authenticateToken,
  requireAdmin,
  validateRequest(schemas.createBranch),
  auditCreate('Branch'),
  asyncHandler(async (req, res) => {
    const { name, address, lat, lng } = req.body;

    // Check if branch with same address already exists
    const existingBranch = await prisma.branch.findUnique({
      where: { address }
    });

    if (existingBranch) {
      return res.status(409).json({ error: 'Branch with this address already exists' });
    }

    const branch = await prisma.branch.create({
      data: {
        name,
        address,
        lat,
        lng,
        createdBy: req.user?.id
      }
    });

    res.status(201).json(branch);
  })
);

// Update branch
router.put('/:id',
  authenticateToken,
  requireAdmin,
  validateRequest(schemas.updateBranch),
  auditUpdate('Branch'),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    const branch = await prisma.branch.findUnique({
      where: { id }
    });

    if (!branch) {
      return res.status(404).json({ error: 'Branch not found' });
    }

    // Check if new address conflicts with existing branch
    if (updateData.address && updateData.address !== branch.address) {
      const existingBranch = await prisma.branch.findUnique({
        where: { address: updateData.address }
      });

      if (existingBranch) {
        return res.status(409).json({ error: 'Branch with this address already exists' });
      }
    }

    const updatedBranch = await prisma.branch.update({
      where: { id },
      data: {
        ...updateData,
        updatedBy: req.user?.id
      }
    });

    res.json(updatedBranch);
  })
);

// Delete branch (Admin only)
router.delete('/:id',
  authenticateToken,
  requireAdmin,
  auditDelete('Branch'),
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const branch = await prisma.branch.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            users: true,
            orders: true
          }
        }
      }
    });

    if (!branch) {
      return res.status(404).json({ error: 'Branch not found' });
    }

    if (branch._count.users > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete branch with associated users. Please reassign or delete users first.' 
      });
    }

    if (branch._count.orders > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete branch with order history. Consider archiving instead.' 
      });
    }

    await prisma.branch.delete({
      where: { id }
    });

    res.json({ message: 'Branch deleted successfully' });
  })
);

// Get nearby branches
router.get('/nearby/:lat/:lng',
  authenticateToken,
  requireAnyRole,
  asyncHandler(async (req, res) => {
    const { lat, lng, radius = 50 } = req.params; // radius in km
    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);
    const radiusKm = parseFloat(radius);

    const branches = await prisma.branch.findMany({
      include: {
        _count: {
          select: {
            orders: true
          }
        }
      }
    });

    // Filter branches by distance
    const nearbyBranches = branches
      .map(branch => {
        const distance = calculateDistance(userLat, userLng, branch.lat, branch.lng);
        return { ...branch, distance };
      })
      .filter(branch => branch.distance <= radiusKm)
      .sort((a, b) => a.distance - b.distance);

    res.json(nearbyBranches);
  })
);

// Get branch statistics
router.get('/:id/stats',
  authenticateToken,
  requireAnyRole,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { startDate, endDate } = req.query;

    // Branch users can only see their own branch stats
    if (req.user?.role === Role.BRANCH_USER && id !== req.user.branchId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const branch = await prisma.branch.findUnique({
      where: { id }
    });

    if (!branch) {
      return res.status(404).json({ error: 'Branch not found' });
    }

    const dateFilter: any = {};
    if (startDate && endDate) {
      dateFilter.createdAt = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string)
      };
    }

    const [
      totalOrders,
      totalRevenue,
      completedOrders,
      cancelledOrders,
      averageOrderValue,
      recentOrders
    ] = await Promise.all([
      prisma.order.count({
        where: { branchId: id, ...dateFilter }
      }),
      prisma.order.aggregate({
        where: { branchId: id, ...dateFilter },
        _sum: { totalCents: true }
      }),
      prisma.order.count({
        where: { branchId: id, status: 'COMPLETED', ...dateFilter }
      }),
      prisma.order.count({
        where: { branchId: id, canceled: true, ...dateFilter }
      }),
      prisma.order.aggregate({
        where: { branchId: id, ...dateFilter },
        _avg: { totalCents: true }
      }),
      prisma.order.findMany({
        where: { branchId: id, ...dateFilter },
        include: {
          items: {
            include: {
              dish: {
                select: {
                  name: true,
                  priceCents: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      })
    ]);

    const stats = {
      branch: {
        id: branch.id,
        name: branch.name,
        address: branch.address
      },
      orders: {
        total: totalOrders,
        completed: completedOrders,
        cancelled: cancelledOrders,
        completionRate: totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0
      },
      revenue: {
        total: totalRevenue._sum.totalCents || 0,
        average: averageOrderValue._avg.totalCents || 0
      },
      recentOrders: recentOrders.map(order => ({
        id: order.id,
        orderNumber: order.orderNumber,
        userName: order.userName,
        userPhone: order.userPhone,
        status: order.status,
        totalCents: order.totalCents,
        createdAt: order.createdAt,
        items: order.items.map(item => ({
          dishName: item.dish.name,
          qty: item.qty,
          priceCents: item.priceCents
        }))
      }))
    };

    res.json(stats);
  })
);

export default router;
