import express from 'express';
import { prisma } from '../config/database';
import { authenticateToken, requireAdmin, requireAnyRole, requireBranchAccess } from '../middleware/auth';
import { validateRequest, schemas } from '../middleware/validation';
import Joi from 'joi';
import { auditCreate, auditUpdate } from '../middleware/audit';
import { asyncHandler } from '../middleware/error';
import { createPaginatedResponse, generateOrderNumber } from '../utils/helpers';
import { Role, OrderStatus, OrderStatusUpdateEvent } from '../types';

const router = express.Router();

// Get all orders
router.get('/',
  authenticateToken,
  requireAnyRole,
  asyncHandler(async (req, res) => {
    const { 
      page = 1, 
      limit = 10, 
      branchId, 
      status, 
      userPhone, 
      startDate, 
      endDate 
    } = req.query;

    const skip = (page - 1) * limit;
    const where: any = {};

    if (branchId) {
      where.branchId = branchId;
    }

    if (status) {
      where.status = status;
    }

    if (userPhone) {
      where.userPhone = userPhone;
    }

    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string)
      };
    }

    // Branch users can only see orders from their branch
    if (req.user?.role === Role.BRANCH_USER) {
      where.branchId = req.user.branchId;
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          branch: {
            select: {
              id: true,
              name: true,
              address: true
            }
          },
          items: {
            include: {
              dish: {
                select: {
                  id: true,
                  name: true,
                  priceCents: true,
                  imageUrl: true
                }
              }
            }
          }
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.order.count({ where })
    ]);

    const response = createPaginatedResponse(orders, page, limit, total);
    res.json(response);
  })
);

// Get order by ID
router.get('/:id',
  authenticateToken,
  requireAnyRole,
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        branch: {
          select: {
            id: true,
            name: true,
            address: true,
            lat: true,
            lng: true
          }
        },
        items: {
          include: {
            dish: {
              select: {
                id: true,
                name: true,
                description: true,
                priceCents: true,
                imageUrl: true
              }
            }
          }
        }
      }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Branch users can only see orders from their branch
    if (req.user?.role === Role.BRANCH_USER && order.branchId !== req.user.branchId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(order);
  })
);

// Create order
router.post('/',
  authenticateToken,
  requireAnyRole,
  validateRequest(schemas.createOrder),
  auditCreate('Order'),
  asyncHandler(async (req, res) => {
    const { branchId, userName, userPhone, items } = req.body;

    // Branch users can only create orders for their branch
    if (req.user?.role === Role.BRANCH_USER && branchId !== req.user.branchId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Verify branch exists
    const branch = await prisma.branch.findUnique({
      where: { id: branchId }
    });

    if (!branch) {
      return res.status(404).json({ error: 'Branch not found' });
    }

    // Verify all dishes exist and are available
    const dishIds = items.map((item: any) => item.dishId);
    const dishes = await prisma.dish.findMany({
      where: { 
        id: { in: dishIds },
        available: true
      },
      include: {
        menu: {
          select: { branchId: true }
        }
      }
    });

    if (dishes.length !== dishIds.length) {
      return res.status(400).json({ error: 'One or more dishes not found or unavailable' });
    }

    // Verify all dishes belong to the specified branch
    const invalidDishes = dishes.filter(dish => dish.menu.branchId !== branchId);
    if (invalidDishes.length > 0) {
      return res.status(400).json({ error: 'One or more dishes do not belong to the specified branch' });
    }

    // Calculate total
    let totalCents = 0;
    const orderItems = items.map((item: any) => {
      const dish = dishes.find(d => d.id === item.dishId);
      const itemTotal = dish!.priceCents * item.qty;
      totalCents += itemTotal;
      
      return {
        dishId: item.dishId,
        qty: item.qty,
        priceCents: dish!.priceCents
      };
    });

    // Generate unique order number
    let orderNumber: number;
    let isUnique = false;
    
    while (!isUnique) {
      orderNumber = generateOrderNumber();
      const existingOrder = await prisma.order.findUnique({
        where: { orderNumber }
      });
      isUnique = !existingOrder;
    }

    // Create order
    const order = await prisma.order.create({
      data: {
        orderNumber: orderNumber!,
        branchId,
        userName,
        userPhone,
        totalCents,
        createdBy: req.user?.id,
        items: {
          create: orderItems
        }
      },
      include: {
        branch: {
          select: {
            id: true,
            name: true,
            address: true
          }
        },
        items: {
          include: {
            dish: {
              select: {
                id: true,
                name: true,
                priceCents: true,
                imageUrl: true
              }
            }
          }
        }
      }
    });

    // Emit real-time update
    const io = req.app.get('io');
    if (io) {
      io.to(`branch-${branchId}`).emit('new-order', {
        orderId: order.id,
        orderNumber: order.orderNumber,
        userName: order.userName,
        userPhone: order.userPhone,
        totalCents: order.totalCents,
        status: order.status,
        createdAt: order.createdAt
      });
    }

    res.status(201).json(order);
  })
);

// Update order status
router.put('/:id/status',
  authenticateToken,
  requireAnyRole,
  validateRequest(schemas.updateOrderStatus),
  auditUpdate('Order'),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status, cancelReason } = req.body;

    const order = await prisma.order.findUnique({
      where: { id },
      include: { branch: true }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Branch users can only update orders from their branch
    if (req.user?.role === Role.BRANCH_USER && order.branchId !== req.user.branchId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Validate status transition
    const validTransitions: { [key in OrderStatus]: OrderStatus[] } = {
      PENDING: ['ACCEPTED', 'CANCELED'],
      ACCEPTED: ['PREPARING', 'CANCELED'],
      PREPARING: ['READY', 'CANCELED'],
      READY: ['OUT_FOR_DELIVERY', 'COMPLETED', 'CANCELED'],
      OUT_FOR_DELIVERY: ['COMPLETED', 'CANCELED'],
      COMPLETED: [],
      CANCELED: []
    };

    if (!validTransitions[order.status].includes(status)) {
      return res.status(400).json({ 
        error: `Invalid status transition from ${order.status} to ${status}` 
      });
    }

    const updateData: any = {
      status,
      updatedBy: req.user?.id
    };

    if (status === 'CANCELED') {
      updateData.canceled = true;
      updateData.cancelReason = cancelReason;
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: updateData,
      include: {
        branch: {
          select: {
            id: true,
            name: true,
            address: true
          }
        },
        items: {
          include: {
            dish: {
              select: {
                id: true,
                name: true,
                priceCents: true,
                imageUrl: true
              }
            }
          }
        }
      }
    });

    // Emit real-time update
    const io = req.app.get('io');
    if (io) {
      const event: OrderStatusUpdateEvent = {
        orderId: order.id,
        orderNumber: order.orderNumber,
        status: updatedOrder.status,
        branchId: order.branchId,
        timestamp: new Date()
      };

      io.to(`branch-${order.branchId}`).emit('order-status-update', event);
    }

    res.json(updatedOrder);
  })
);

// Cancel order
router.put('/:id/cancel',
  authenticateToken,
  requireAnyRole,
  validateRequest(Joi.object({
    reason: Joi.string().max(200).required()
  })),
  auditUpdate('Order'),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { reason } = req.body;

    const order = await prisma.order.findUnique({
      where: { id }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Branch users can only cancel orders from their branch
    if (req.user?.role === Role.BRANCH_USER && order.branchId !== req.user.branchId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (order.status === 'CANCELED') {
      return res.status(400).json({ error: 'Order is already canceled' });
    }

    if (order.status === 'COMPLETED') {
      return res.status(400).json({ error: 'Cannot cancel completed order' });
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status: 'CANCELED',
        canceled: true,
        cancelReason: reason,
        updatedBy: req.user?.id
      },
      include: {
        branch: {
          select: {
            id: true,
            name: true,
            address: true
          }
        },
        items: {
          include: {
            dish: {
              select: {
                id: true,
                name: true,
                priceCents: true,
                imageUrl: true
              }
            }
          }
        }
      }
    });

    // Emit real-time update
    const io = req.app.get('io');
    if (io) {
      const event: OrderStatusUpdateEvent = {
        orderId: order.id,
        orderNumber: order.orderNumber,
        status: 'CANCELED',
        branchId: order.branchId,
        timestamp: new Date()
      };

      io.to(`branch-${order.branchId}`).emit('order-status-update', event);
    }

    res.json(updatedOrder);
  })
);

// Get orders by user phone
router.get('/user/:phone',
  authenticateToken,
  requireAnyRole,
  asyncHandler(async (req, res) => {
    const { phone } = req.params;
    const { page = 1, limit = 10, branchId } = req.query;

    const skip = (page - 1) * limit;
    const where: any = { userPhone: phone };

    if (branchId) {
      where.branchId = branchId;
    }

    // Branch users can only see orders from their branch
    if (req.user?.role === Role.BRANCH_USER) {
      where.branchId = req.user.branchId;
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          branch: {
            select: {
              id: true,
              name: true,
              address: true
            }
          },
          items: {
            include: {
              dish: {
                select: {
                  id: true,
                  name: true,
                  priceCents: true,
                  imageUrl: true
                }
              }
            }
          }
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.order.count({ where })
    ]);

    const response = createPaginatedResponse(orders, page, limit, total);
    res.json(response);
  })
);

// Get real-time orders feed for branch
router.get('/feed/:branchId',
  authenticateToken,
  requireAnyRole,
  asyncHandler(async (req, res) => {
    const { branchId } = req.params;
    const { status, limit = 50 } = req.query;

    // Branch users can only see their branch feed
    if (req.user?.role === Role.BRANCH_USER && branchId !== req.user.branchId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const where: any = { branchId };

    if (status) {
      where.status = status;
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: {
          include: {
            dish: {
              select: {
                id: true,
                name: true,
                priceCents: true,
                imageUrl: true
              }
            }
          }
        }
      },
      take: parseInt(limit as string),
      orderBy: { createdAt: 'desc' }
    });

    res.json(orders);
  })
);

export default router;
