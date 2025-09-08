import express from 'express';
import { prisma } from '../config/database';
import { authenticateToken, requireAdmin, requireAnyRole, requireBranchAccess } from '../middleware/auth';
import { validateRequest, schemas } from '../middleware/validation';
import { auditCreate, auditUpdate, auditDelete } from '../middleware/audit';
import { asyncHandler } from '../middleware/error';
import { createPaginatedResponse } from '../utils/helpers';
import { Role } from '../types';

const router = express.Router();

// Get all menus
router.get('/',
  authenticateToken,
  requireAnyRole,
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, branchId, search } = req.query;

    const skip = (page - 1) * limit;
    const where: any = {};

    if (branchId) {
      where.branchId = branchId;
    }

    if (search) {
      where.name = { contains: search as string, mode: 'insensitive' };
    }

    // Branch users can only see menus from their branch
    if (req.user?.role === Role.BRANCH_USER) {
      where.branchId = req.user.branchId;
    }

    const [menus, total] = await Promise.all([
      prisma.menu.findMany({
        where,
        include: {
          branch: {
            select: {
              id: true,
              name: true,
              address: true
            }
          },
          dishes: {
            select: {
              id: true,
              name: true,
              priceCents: true,
              available: true,
              createdAt: true
            }
          },
          _count: {
            select: {
              dishes: true
            }
          }
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.menu.count({ where })
    ]);

    const response = createPaginatedResponse(menus, page, limit, total);
    res.json(response);
  })
);

// Get menu by ID
router.get('/:id',
  authenticateToken,
  requireAnyRole,
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const menu = await prisma.menu.findUnique({
      where: { id },
      include: {
        branch: {
          select: {
            id: true,
            name: true,
            address: true
          }
        },
        dishes: {
          include: {
            ingredients: {
              include: {
                ingredient: {
                  select: {
                    id: true,
                    name: true
                  }
                }
              }
            }
          },
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!menu) {
      return res.status(404).json({ error: 'Menu not found' });
    }

    // Branch users can only see menus from their branch
    if (req.user?.role === Role.BRANCH_USER && menu.branchId !== req.user.branchId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(menu);
  })
);

// Create menu
router.post('/',
  authenticateToken,
  requireAnyRole,
  validateRequest(schemas.createMenu),
  auditCreate('Menu'),
  asyncHandler(async (req, res) => {
    const { name, branchId } = req.body;

    // Branch users can only create menus for their branch
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

    // Check if menu with same name already exists for this branch
    const existingMenu = await prisma.menu.findFirst({
      where: {
        name,
        branchId
      }
    });

    if (existingMenu) {
      return res.status(409).json({ error: 'Menu with this name already exists for this branch' });
    }

    const menu = await prisma.menu.create({
      data: {
        name,
        branchId,
        createdBy: req.user?.id
      },
      include: {
        branch: {
          select: {
            id: true,
            name: true,
            address: true
          }
        }
      }
    });

    res.status(201).json(menu);
  })
);

// Update menu
router.put('/:id',
  authenticateToken,
  requireAnyRole,
  validateRequest(schemas.updateMenu),
  auditUpdate('Menu'),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;

    const menu = await prisma.menu.findUnique({
      where: { id }
    });

    if (!menu) {
      return res.status(404).json({ error: 'Menu not found' });
    }

    // Branch users can only update menus from their branch
    if (req.user?.role === Role.BRANCH_USER && menu.branchId !== req.user.branchId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Check if new name conflicts with existing menu in same branch
    if (name && name !== menu.name) {
      const existingMenu = await prisma.menu.findFirst({
        where: {
          name,
          branchId: menu.branchId,
          id: { not: id }
        }
      });

      if (existingMenu) {
        return res.status(409).json({ error: 'Menu with this name already exists for this branch' });
      }
    }

    const updatedMenu = await prisma.menu.update({
      where: { id },
      data: {
        name,
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
    });

    res.json(updatedMenu);
  })
);

// Delete menu
router.delete('/:id',
  authenticateToken,
  requireAnyRole,
  auditDelete('Menu'),
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const menu = await prisma.menu.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            dishes: true
          }
        }
      }
    });

    if (!menu) {
      return res.status(404).json({ error: 'Menu not found' });
    }

    // Branch users can only delete menus from their branch
    if (req.user?.role === Role.BRANCH_USER && menu.branchId !== req.user.branchId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (menu._count.dishes > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete menu with dishes. Please delete all dishes first.' 
      });
    }

    await prisma.menu.delete({
      where: { id }
    });

    res.json({ message: 'Menu deleted successfully' });
  })
);

// Get menu dishes
router.get('/:id/dishes',
  authenticateToken,
  requireAnyRole,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { available, search } = req.query;

    const menu = await prisma.menu.findUnique({
      where: { id }
    });

    if (!menu) {
      return res.status(404).json({ error: 'Menu not found' });
    }

    // Branch users can only see dishes from their branch menus
    if (req.user?.role === Role.BRANCH_USER && menu.branchId !== req.user.branchId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const where: any = { menuId: id };

    if (available !== undefined) {
      where.available = available === 'true';
    }

    if (search) {
      where.name = { contains: search as string, mode: 'insensitive' };
    }

    const dishes = await prisma.dish.findMany({
      where,
      include: {
        ingredients: {
          include: {
            ingredient: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    res.json(dishes);
  })
);

export default router;
