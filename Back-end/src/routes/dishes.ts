import express from 'express';
import { prisma } from '../config/database';
import { authenticateToken, requireAdmin, requireAnyRole, requireBranchAccess } from '../middleware/auth';
import { validateRequest, schemas } from '../middleware/validation';
import Joi from 'joi';
import { auditCreate, auditUpdate, auditDelete } from '../middleware/audit';
import { asyncHandler } from '../middleware/error';
import { createPaginatedResponse } from '../utils/helpers';
import { Role } from '../types';

const router = express.Router();

// Get all dishes
router.get('/',
  authenticateToken,
  requireAnyRole,
  asyncHandler(async (req, res) => {
    const { 
      page = 1, 
      limit = 10, 
      menuId, 
      branchId, 
      available, 
      search 
    } = req.query;

    const skip = (page - 1) * limit;
    const where: any = {};

    if (menuId) {
      where.menuId = menuId;
    }

    if (branchId) {
      where.menu = { branchId };
    }

    if (available !== undefined) {
      where.available = available === 'true';
    }

    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    // Branch users can only see dishes from their branch
    if (req.user?.role === Role.BRANCH_USER) {
      where.menu = { branchId: req.user.branchId };
    }

    const [dishes, total] = await Promise.all([
      prisma.dish.findMany({
        where,
        include: {
          menu: {
            select: {
              id: true,
              name: true,
              branch: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          },
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
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.dish.count({ where })
    ]);

    const response = createPaginatedResponse(dishes, page, limit, total);
    res.json(response);
  })
);

// Get dish by ID
router.get('/:id',
  authenticateToken,
  requireAnyRole,
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const dish = await prisma.dish.findUnique({
      where: { id },
      include: {
        menu: {
          include: {
            branch: {
              select: {
                id: true,
                name: true,
                address: true
              }
            }
          }
        },
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
      }
    });

    if (!dish) {
      return res.status(404).json({ error: 'Dish not found' });
    }

    // Branch users can only see dishes from their branch
    if (req.user?.role === Role.BRANCH_USER && dish.menu.branchId !== req.user.branchId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(dish);
  })
);

// Create dish
router.post('/',
  authenticateToken,
  requireAnyRole,
  validateRequest(schemas.createDish),
  auditCreate('Dish'),
  asyncHandler(async (req, res) => {
    const { name, description, imageUrl, priceCents, menuId, ingredients } = req.body;

    // Verify menu exists and get branch info
    const menu = await prisma.menu.findUnique({
      where: { id: menuId },
      include: { branch: true }
    });

    if (!menu) {
      return res.status(404).json({ error: 'Menu not found' });
    }

    // Branch users can only create dishes for their branch menus
    if (req.user?.role === Role.BRANCH_USER && menu.branchId !== req.user.branchId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Check if dish with same name already exists in this menu
    const existingDish = await prisma.dish.findFirst({
      where: {
        name,
        menuId
      }
    });

    if (existingDish) {
      return res.status(409).json({ error: 'Dish with this name already exists in this menu' });
    }

    // Verify all ingredients exist
    const ingredientIds = ingredients.map((ing: any) => ing.ingredientId);
    const existingIngredients = await prisma.ingredient.findMany({
      where: { id: { in: ingredientIds } }
    });

    if (existingIngredients.length !== ingredientIds.length) {
      return res.status(400).json({ error: 'One or more ingredients not found' });
    }

    // Create dish with ingredients
    const dish = await prisma.dish.create({
      data: {
        name,
        description,
        imageUrl,
        priceCents,
        menuId,
        createdBy: req.user?.id,
        ingredients: {
          create: ingredients.map((ing: any) => ({
            ingredientId: ing.ingredientId,
            qtyUnit: ing.qtyUnit,
            required: ing.required !== false
          }))
        }
      },
      include: {
        menu: {
          include: {
            branch: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
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
      }
    });

    res.status(201).json(dish);
  })
);

// Update dish
router.put('/:id',
  authenticateToken,
  requireAnyRole,
  validateRequest(schemas.updateDish),
  auditUpdate('Dish'),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, description, imageUrl, priceCents, available, ingredients } = req.body;

    const dish = await prisma.dish.findUnique({
      where: { id },
      include: {
        menu: {
          include: { branch: true }
        }
      }
    });

    if (!dish) {
      return res.status(404).json({ error: 'Dish not found' });
    }

    // Branch users can only update dishes from their branch
    if (req.user?.role === Role.BRANCH_USER && dish.menu.branchId !== req.user.branchId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Check if new name conflicts with existing dish in same menu
    if (name && name !== dish.name) {
      const existingDish = await prisma.dish.findFirst({
        where: {
          name,
          menuId: dish.menuId,
          id: { not: id }
        }
      });

      if (existingDish) {
        return res.status(409).json({ error: 'Dish with this name already exists in this menu' });
      }
    }

    // Update dish
    const updatedDish = await prisma.dish.update({
      where: { id },
      data: {
        name,
        description,
        imageUrl,
        priceCents,
        available,
        updatedBy: req.user?.id
      }
    });

    // Update ingredients if provided
    if (ingredients) {
      // Delete existing ingredients
      await prisma.dishIngredient.deleteMany({
        where: { dishId: id }
      });

      // Verify all ingredients exist
      const ingredientIds = ingredients.map((ing: any) => ing.ingredientId);
      const existingIngredients = await prisma.ingredient.findMany({
        where: { id: { in: ingredientIds } }
      });

      if (existingIngredients.length !== ingredientIds.length) {
        return res.status(400).json({ error: 'One or more ingredients not found' });
      }

      // Create new ingredients
      await prisma.dishIngredient.createMany({
        data: ingredients.map((ing: any) => ({
          dishId: id,
          ingredientId: ing.ingredientId,
          qtyUnit: ing.qtyUnit,
          required: ing.required !== false
        }))
      });
    }

    // Fetch updated dish with relations
    const finalDish = await prisma.dish.findUnique({
      where: { id },
      include: {
        menu: {
          include: {
            branch: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
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
      }
    });

    res.json(finalDish);
  })
);

// Delete dish
router.delete('/:id',
  authenticateToken,
  requireAnyRole,
  auditDelete('Dish'),
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const dish = await prisma.dish.findUnique({
      where: { id },
      include: {
        menu: {
          include: { branch: true }
        },
        _count: {
          select: {
            orderItems: true
          }
        }
      }
    });

    if (!dish) {
      return res.status(404).json({ error: 'Dish not found' });
    }

    // Branch users can only delete dishes from their branch
    if (req.user?.role === Role.BRANCH_USER && dish.menu.branchId !== req.user.branchId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (dish._count.orderItems > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete dish with order history. Consider marking as unavailable instead.' 
      });
    }

    await prisma.dish.delete({
      where: { id }
    });

    res.json({ message: 'Dish deleted successfully' });
  })
);

// Toggle dish availability
router.put('/:id/availability',
  authenticateToken,
  requireAnyRole,
  validateRequest(Joi.object({
    available: Joi.boolean().required()
  })),
  auditUpdate('Dish'),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { available } = req.body;

    const dish = await prisma.dish.findUnique({
      where: { id },
      include: {
        menu: {
          include: { branch: true }
        }
      }
    });

    if (!dish) {
      return res.status(404).json({ error: 'Dish not found' });
    }

    // Branch users can only update dishes from their branch
    if (req.user?.role === Role.BRANCH_USER && dish.menu.branchId !== req.user.branchId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updatedDish = await prisma.dish.update({
      where: { id },
      data: {
        available,
        updatedBy: req.user?.id
      },
      include: {
        menu: {
          include: {
            branch: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    });

    res.json(updatedDish);
  })
);

// Get dish order history
router.get('/:id/orders',
  authenticateToken,
  requireAnyRole,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { page = 1, limit = 10, startDate, endDate } = req.query;

    const dish = await prisma.dish.findUnique({
      where: { id },
      include: {
        menu: {
          include: { branch: true }
        }
      }
    });

    if (!dish) {
      return res.status(404).json({ error: 'Dish not found' });
    }

    // Branch users can only see orders from their branch
    if (req.user?.role === Role.BRANCH_USER && dish.menu.branchId !== req.user.branchId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const skip = (page - 1) * limit;
    const where: any = {
      items: {
        some: {
          dishId: id
        }
      }
    };

    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string)
      };
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: {
            where: { dishId: id },
            select: {
              qty: true,
              priceCents: true
            }
          },
          branch: {
            select: {
              id: true,
              name: true
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

export default router;
