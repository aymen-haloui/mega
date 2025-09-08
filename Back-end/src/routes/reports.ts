import express from 'express';
import { prisma } from '../config/database';
import { authenticateToken, requireAdmin, requireAnyRole } from '../middleware/auth';
import { validateRequest, schemas } from '../middleware/validation';
import Joi from 'joi';
import { asyncHandler } from '../middleware/error';
import { createPaginatedResponse, formatCurrency, getDateRange } from '../utils/helpers';
import { Role, BranchIncomeParams, BranchIncomeResponse, FraudUserResponse, OrderExportData, BranchReportData } from '../types';
import { createObjectCsvWriter } from 'csv-writer';
import { Response } from 'express';
import moment from 'moment';

const router = express.Router();

// Get branch income report
router.get('/branch-income',
  authenticateToken,
  requireAnyRole,
  validateRequest(Joi.object({
    branchId: Joi.string().uuid().optional(),
    startDate: Joi.date().iso().required(),
    endDate: Joi.date().iso().required()
  })),
  asyncHandler(async (req, res) => {
    const { branchId, startDate, endDate } = req.query as BranchIncomeParams;

    // Branch users can only see their branch data
    if (req.user?.role === Role.BRANCH_USER && branchId && branchId !== req.user.branchId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { start, end } = getDateRange(startDate, endDate);
    const where: any = {
      createdAt: {
        gte: start,
        lte: end
      }
    };

    if (branchId) {
      where.branchId = branchId;
    }

    // Branch users can only see their branch data
    if (req.user?.role === Role.BRANCH_USER) {
      where.branchId = req.user.branchId;
    }

    const [orders, branches] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          branch: {
            select: {
              id: true,
              name: true
            }
          }
        }
      }),
      branchId 
        ? [await prisma.branch.findUnique({ where: { id: branchId } })]
        : prisma.branch.findMany({
            select: { id: true, name: true }
          })
    ]);

    const branchData = branches.map(branch => {
      const branchOrders = orders.filter(order => order.branchId === branch?.id);
      const completedOrders = branchOrders.filter(order => order.status === 'COMPLETED');
      const cancelledOrders = branchOrders.filter(order => order.canceled);

      const totalRevenue = completedOrders.reduce((sum, order) => sum + order.totalCents, 0);
      const cancelledRevenue = cancelledOrders.reduce((sum, order) => sum + order.totalCents, 0);
      const averageTicket = completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0;

      return {
        branchId: branch?.id || '',
        branchName: branch?.name || '',
        totalRevenue,
        ordersCount: branchOrders.length,
        averageTicket: Math.round(averageTicket),
        cancelledOrdersCount: cancelledOrders.length,
        cancelledRevenue
      };
    });

    res.json(branchData);
  })
);

// Get fraud/suspicious users report
router.get('/fraud-users',
  authenticateToken,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { 
      maxCancellations = 5, 
      maxNoShows = 3, 
      page = 1, 
      limit = 20 
    } = req.query;

    const skip = (page - 1) * limit;

    const fraudUsers = await prisma.user.findMany({
      where: {
        OR: [
          { cancellationCount: { gte: parseInt(maxCancellations as string) } },
          { noShowCount: { gte: parseInt(maxNoShows as string) } }
        ]
      },
      include: { branch: true },
      skip,
      take: limit,
      orderBy: [
        { cancellationCount: 'desc' },
        { noShowCount: 'desc' }
      ]
    });

    // Calculate additional fraud metrics
    const fraudData: FraudUserResponse[] = await Promise.all(
      fraudUsers.map(async (user) => {
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

    const total = await prisma.user.count({
      where: {
        OR: [
          { cancellationCount: { gte: parseInt(maxCancellations as string) } },
          { noShowCount: { gte: parseInt(maxNoShows as string) } }
        ]
      }
    });

    const response = createPaginatedResponse(fraudData, page, limit, total);
    res.json(response);
  })
);

// Export orders to CSV
router.get('/export/orders',
  authenticateToken,
  requireAnyRole,
  validateRequest(Joi.object({
    branchId: Joi.string().uuid().optional(),
    startDate: Joi.date().iso().required(),
    endDate: Joi.date().iso().required(),
    status: Joi.string().optional()
  })),
  asyncHandler(async (req, res) => {
    const { branchId, startDate, endDate, status } = req.query;

    // Branch users can only export their branch data
    if (req.user?.role === Role.BRANCH_USER && branchId && branchId !== req.user.branchId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { start, end } = getDateRange(startDate as string, endDate as string);
    const where: any = {
      createdAt: {
        gte: start,
        lte: end
      }
    };

    if (branchId) {
      where.branchId = branchId;
    }

    if (status) {
      where.status = status;
    }

    // Branch users can only see their branch data
    if (req.user?.role === Role.BRANCH_USER) {
      where.branchId = req.user.branchId;
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        branch: {
          select: {
            name: true
          }
        },
        items: {
          include: {
            dish: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const exportData: OrderExportData[] = orders.map(order => ({
      orderNumber: order.orderNumber,
      branchName: order.branch.name,
      userName: order.userName,
      userPhone: order.userPhone,
      status: order.status,
      totalCents: order.totalCents,
      createdAt: order.createdAt.toISOString(),
      items: order.items.map(item => 
        `${item.dish.name} x${item.qty} (${formatCurrency(item.priceCents)})`
      ).join('; ')
    }));

    // Set CSV headers
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="orders-${moment().format('YYYY-MM-DD')}.csv"`);

    // Write CSV header
    res.write('Order Number,Branch Name,User Name,User Phone,Status,Total,Created At,Items\n');

    // Write CSV data
    exportData.forEach(order => {
      res.write(
        `${order.orderNumber},"${order.branchName}","${order.userName}","${order.userPhone}",` +
        `${order.status},${formatCurrency(order.totalCents)},${order.createdAt},"${order.items}"\n`
      );
    });

    res.end();
  })
);

// Export branch report to CSV
router.get('/export/branch-report',
  authenticateToken,
  requireAnyRole,
  validateRequest(Joi.object({
    branchId: Joi.string().uuid().optional(),
    startDate: Joi.date().iso().required(),
    endDate: Joi.date().iso().required()
  })),
  asyncHandler(async (req, res) => {
    const { branchId, startDate, endDate } = req.query;

    // Branch users can only export their branch data
    if (req.user?.role === Role.BRANCH_USER && branchId && branchId !== req.user.branchId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { start, end } = getDateRange(startDate as string, endDate as string);
    const where: any = {
      createdAt: {
        gte: start,
        lte: end
      }
    };

    if (branchId) {
      where.branchId = branchId;
    }

    // Branch users can only see their branch data
    if (req.user?.role === Role.BRANCH_USER) {
      where.branchId = req.user.branchId;
    }

    const [orders, branches] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          branch: {
            select: {
              id: true,
              name: true
            }
          }
        }
      }),
      branchId 
        ? [await prisma.branch.findUnique({ where: { id: branchId } })]
        : prisma.branch.findMany({
            select: { id: true, name: true }
          })
    ]);

    const reportData: BranchReportData[] = branches.map(branch => {
      const branchOrders = orders.filter(order => order.branchId === branch?.id);
      const completedOrders = branchOrders.filter(order => order.status === 'COMPLETED');
      const cancelledOrders = branchOrders.filter(order => order.canceled);

      const totalRevenue = completedOrders.reduce((sum, order) => sum + order.totalCents, 0);
      const averageTicket = completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0;

      return {
        branchName: branch?.name || '',
        totalRevenue,
        ordersCount: branchOrders.length,
        averageTicket: Math.round(averageTicket),
        cancelledOrders: cancelledOrders.length,
        period: `${moment(start).format('YYYY-MM-DD')} to ${moment(end).format('YYYY-MM-DD')}`
      };
    });

    // Set CSV headers
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="branch-report-${moment().format('YYYY-MM-DD')}.csv"`);

    // Write CSV header
    res.write('Branch Name,Total Revenue,Orders Count,Average Ticket,Cancelled Orders,Period\n');

    // Write CSV data
    reportData.forEach(report => {
      res.write(
        `"${report.branchName}",${formatCurrency(report.totalRevenue)},${report.ordersCount},` +
        `${formatCurrency(report.averageTicket)},${report.cancelledOrders},"${report.period}"\n`
      );
    });

    res.end();
  })
);

// Get dashboard statistics
router.get('/dashboard',
  authenticateToken,
  requireAnyRole,
  asyncHandler(async (req, res) => {
    const { branchId, period = '7d' } = req.query;

    // Branch users can only see their branch data
    if (req.user?.role === Role.BRANCH_USER && branchId && branchId !== req.user.branchId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const now = new Date();
    let startDate: Date;

    switch (period) {
      case '1d':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    const where: any = {
      createdAt: {
        gte: startDate,
        lte: now
      }
    };

    if (branchId) {
      where.branchId = branchId;
    }

    // Branch users can only see their branch data
    if (req.user?.role === Role.BRANCH_USER) {
      where.branchId = req.user.branchId;
    }

    const [
      totalOrders,
      totalRevenue,
      completedOrders,
      cancelledOrders,
      pendingOrders,
      recentOrders,
      topDishes,
      branchStats
    ] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.aggregate({
        where: { ...where, status: 'COMPLETED' },
        _sum: { totalCents: true }
      }),
      prisma.order.count({
        where: { ...where, status: 'COMPLETED' }
      }),
      prisma.order.count({
        where: { ...where, canceled: true }
      }),
      prisma.order.count({
        where: { ...where, status: 'PENDING' }
      }),
      prisma.order.findMany({
        where,
        include: {
          branch: {
            select: { name: true }
          },
          items: {
            include: {
              dish: {
                select: { name: true }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      }),
      prisma.orderItem.groupBy({
        by: ['dishId'],
        where: {
          order: where
        },
        _sum: { qty: true },
        _count: { dishId: true },
        orderBy: { _sum: { qty: 'desc' } },
        take: 5
      }),
      branchId 
        ? prisma.branch.findUnique({
            where: { id: branchId },
            select: { id: true, name: true, address: true }
          })
        : null
    ]);

    // Get dish names for top dishes
    const topDishIds = topDishes.map(dish => dish.dishId);
    const dishNames = await prisma.dish.findMany({
      where: { id: { in: topDishIds } },
      select: { id: true, name: true }
    });

    const topDishesWithNames = topDishes.map(dish => {
      const dishName = dishNames.find(d => d.id === dish.dishId);
      return {
        dishId: dish.dishId,
        dishName: dishName?.name || 'Unknown',
        totalQty: dish._sum.qty || 0,
        orderCount: dish._count.dishId
      };
    });

    const stats = {
      period,
      branch: branchStats,
      orders: {
        total: totalOrders,
        completed: completedOrders,
        cancelled: cancelledOrders,
        pending: pendingOrders,
        completionRate: totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0
      },
      revenue: {
        total: totalRevenue._sum.totalCents || 0,
        average: completedOrders > 0 ? (totalRevenue._sum.totalCents || 0) / completedOrders : 0
      },
      recentOrders: recentOrders.map(order => ({
        id: order.id,
        orderNumber: order.orderNumber,
        userName: order.userName,
        userPhone: order.userPhone,
        status: order.status,
        totalCents: order.totalCents,
        createdAt: order.createdAt,
        branchName: order.branch.name,
        items: order.items.map(item => ({
          dishName: item.dish.name,
          qty: item.qty
        }))
      })),
      topDishes: topDishesWithNames
    };

    res.json(stats);
  })
);

// Get audit log
router.get('/audit-log',
  authenticateToken,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { 
      page = 1, 
      limit = 20, 
      action, 
      entity, 
      userId, 
      startDate, 
      endDate 
    } = req.query;

    const skip = (page - 1) * limit;
    const where: any = {};

    if (action) {
      where.action = action;
    }

    if (entity) {
      where.entity = entity;
    }

    if (userId) {
      where.userId = userId;
    }

    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string)
      };
    }

    const [auditLogs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.auditLog.count({ where })
    ]);

    const response = createPaginatedResponse(auditLogs, page, limit, total);
    res.json(response);
  })
);

export default router;
