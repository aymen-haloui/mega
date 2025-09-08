import express from 'express';
import { prisma } from '../config/database';
import { authenticateToken, requireAdmin, requireAnyRole, requireBranchAccess } from '../middleware/auth';
import { validateRequest, schemas } from '../middleware/validation';
import Joi from 'joi';
import { auditCreate, auditUpdate, auditDelete } from '../middleware/audit';
import { asyncHandler } from '../middleware/error';
import { createPaginatedResponse } from '../utils/helpers';
import { Role, IngredientAvailabilityResponse, IngredientAvailabilityUpdateEvent } from '../types';

const router = express.Router();

// Get all ingredients
router.get('/',
  authenticateToken,
  requireAnyRole,
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, search } = req.query;

    const skip = (page - 1) * limit;
    const where: any = {};

    if (search) {
      where.name = { contains: search as string, mode: 'insensitive' };
    }

    const [ingredients, total] = await Promise.all([
      prisma.ingredient.findMany({
        where,
        include: {
          _count: {
            select: {
              dishLinks: true,
              branchAvails: true
            }
          }
        },
        skip,
        take: limit,
        orderBy: { name: 'asc' }
      }),
      prisma.ingredient.count({ where })
    ]);

    const response = createPaginatedResponse(ingredients, page, limit, total);
    res.json(response);
  })
);

// Get ingredient by ID
router.get('/:id',
  authenticateToken,
  requireAnyRole,
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const ingredient = await prisma.ingredient.findUnique({
      where: { id },
      include: {
        dishLinks: {
          include: {
            dish: {
              select: {
                id: true,
                name: true,
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
                }
              }
            }
          }
        },
        branchAvails: {
          include: {
            branch: {
              select: {
                id: true,
                name: true,
                address: true
              }
            }
          }
        }
      }
    });

    if (!ingredient) {
      return res.status(404).json({ error: 'Ingredient not found' });
    }

    res.json(ingredient);
  })
);

// Create ingredient (Admin only)
router.post('/',
  authenticateToken,
  requireAdmin,
  validateRequest(Joi.object({
    name: Joi.string().min(2).max(100).required()
  })),
  auditCreate('Ingredient'),
  asyncHandler(async (req, res) => {
    const { name } = req.body;

    // Check if ingredient already exists
    const existingIngredient = await prisma.ingredient.findUnique({
      where: { name }
    });

    if (existingIngredient) {
      return res.status(409).json({ error: 'Ingredient with this name already exists' });
    }

    const ingredient = await prisma.ingredient.create({
      data: {
        name,
        createdBy: req.user?.id
      }
    });

    res.status(201).json(ingredient);
  })
);

// Update ingredient (Admin only)
router.put('/:id',
  authenticateToken,
  requireAdmin,
  validateRequest(Joi.object({
    name: Joi.string().min(2).max(100).required()
  })),
  auditUpdate('Ingredient'),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;

    const ingredient = await prisma.ingredient.findUnique({
      where: { id }
    });

    if (!ingredient) {
      return res.status(404).json({ error: 'Ingredient not found' });
    }

    // Check if new name conflicts with existing ingredient
    if (name !== ingredient.name) {
      const existingIngredient = await prisma.ingredient.findUnique({
        where: { name }
      });

      if (existingIngredient) {
        return res.status(409).json({ error: 'Ingredient with this name already exists' });
      }
    }

    const updatedIngredient = await prisma.ingredient.update({
      where: { id },
      data: { name }
    });

    res.json(updatedIngredient);
  })
);

// Delete ingredient (Admin only)
router.delete('/:id',
  authenticateToken,
  requireAdmin,
  auditDelete('Ingredient'),
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const ingredient = await prisma.ingredient.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            dishLinks: true,
            branchAvails: true
          }
        }
      }
    });

    if (!ingredient) {
      return res.status(404).json({ error: 'Ingredient not found' });
    }

    if (ingredient._count.dishLinks > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete ingredient that is used in dishes. Please remove from all dishes first.' 
      });
    }

    await prisma.ingredient.delete({
      where: { id }
    });

    res.json({ message: 'Ingredient deleted successfully' });
  })
);

// Get ingredient availability across branches
router.get('/:id/availability',
  authenticateToken,
  requireAnyRole,
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const ingredient = await prisma.ingredient.findUnique({
      where: { id }
    });

    if (!ingredient) {
      return res.status(404).json({ error: 'Ingredient not found' });
    }

    const branchAvails = await prisma.branchIngredientAvailability.findMany({
      where: { ingredientId: id },
      include: {
        branch: {
          select: {
            id: true,
            name: true,
            address: true
          }
        }
      },
      orderBy: { branch: { name: 'asc' } }
    });

    const response: IngredientAvailabilityResponse = {
      ingredient,
      branches: branchAvails.map(avail => ({
        branchId: avail.branchId,
        branchName: avail.branch.name,
        available: avail.available,
        updatedAt: avail.updatedAt
      }))
    };

    res.json(response);
  })
);

// Update ingredient availability for a branch
router.put('/:id/availability/:branchId',
  authenticateToken,
  requireAnyRole,
  validateRequest(Joi.object({
    available: Joi.boolean().required()
  })),
  auditUpdate('BranchIngredientAvailability'),
  asyncHandler(async (req, res) => {
    const { id: ingredientId, branchId } = req.params;
    const { available } = req.body;

    // Branch users can only update availability for their branch
    if (req.user?.role === Role.BRANCH_USER && branchId !== req.user.branchId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Verify ingredient exists
    const ingredient = await prisma.ingredient.findUnique({
      where: { id: ingredientId }
    });

    if (!ingredient) {
      return res.status(404).json({ error: 'Ingredient not found' });
    }

    // Verify branch exists
    const branch = await prisma.branch.findUnique({
      where: { id: branchId }
    });

    if (!branch) {
      return res.status(404).json({ error: 'Branch not found' });
    }

    // Update or create availability record
    const availability = await prisma.branchIngredientAvailability.upsert({
      where: {
        branchId_ingredientId: {
          branchId,
          ingredientId
        }
      },
      update: {
        available,
        updatedBy: req.user?.id
      },
      create: {
        branchId,
        ingredientId,
        available,
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
        ingredient: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    // Emit real-time update
    const io = req.app.get('io');
    if (io) {
      const event: IngredientAvailabilityUpdateEvent = {
        ingredientId,
        branchId,
        available,
        timestamp: new Date()
      };

      io.to(`branch-${branchId}`).emit('ingredient-availability-update', event);
    }

    res.json(availability);
  })
);

// Get availability map (heatmap data)
router.get('/availability/map',
  authenticateToken,
  requireAnyRole,
  asyncHandler(async (req, res) => {
    const { branchId } = req.query;

    const where: any = {};
    if (branchId) {
      where.branchId = branchId;
    }

    // Branch users can only see their branch data
    if (req.user?.role === Role.BRANCH_USER) {
      where.branchId = req.user.branchId;
    }

    const availabilities = await prisma.branchIngredientAvailability.findMany({
      where,
      include: {
        ingredient: {
          select: {
            id: true,
            name: true
          }
        },
        branch: {
          select: {
            id: true,
            name: true,
            address: true
          }
        }
      },
      orderBy: [
        { branch: { name: 'asc' } },
        { ingredient: { name: 'asc' } }
      ]
    });

    // Group by ingredient
    const mapData = availabilities.reduce((acc, avail) => {
      const ingredientId = avail.ingredientId;
      if (!acc[ingredientId]) {
        acc[ingredientId] = {
          ingredient: avail.ingredient,
          branches: []
        };
      }
      acc[ingredientId].branches.push({
        branchId: avail.branchId,
        branchName: avail.branch.name,
        available: avail.available,
        updatedAt: avail.updatedAt
      });
      return acc;
    }, {} as any);

    res.json(Object.values(mapData));
  })
);

// Bulk update ingredient availability
router.put('/bulk-availability',
  authenticateToken,
  requireAnyRole,
  validateRequest(Joi.object({
    branchId: Joi.string().uuid().required(),
    updates: Joi.array().items(
      Joi.object({
        ingredientId: Joi.string().uuid().required(),
        available: Joi.boolean().required()
      })
    ).min(1).required()
  })),
  auditUpdate('BranchIngredientAvailability'),
  asyncHandler(async (req, res) => {
    const { branchId, updates } = req.body;

    // Branch users can only update their branch
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

    // Verify all ingredients exist
    const ingredientIds = updates.map((u: any) => u.ingredientId);
    const ingredients = await prisma.ingredient.findMany({
      where: { id: { in: ingredientIds } }
    });

    if (ingredients.length !== ingredientIds.length) {
      return res.status(400).json({ error: 'One or more ingredients not found' });
    }

    // Update all availabilities
    const results = await Promise.all(
      updates.map((update: any) =>
        prisma.branchIngredientAvailability.upsert({
          where: {
            branchId_ingredientId: {
              branchId,
              ingredientId: update.ingredientId
            }
          },
          update: {
            available: update.available,
            updatedBy: req.user?.id
          },
          create: {
            branchId,
            ingredientId: update.ingredientId,
            available: update.available,
            updatedBy: req.user?.id
          }
        })
      )
    );

    // Emit real-time updates
    const io = req.app.get('io');
    if (io) {
      updates.forEach((update: any) => {
        const event: IngredientAvailabilityUpdateEvent = {
          ingredientId: update.ingredientId,
          branchId,
          available: update.available,
          timestamp: new Date()
        };
        io.to(`branch-${branchId}`).emit('ingredient-availability-update', event);
      });
    }

    res.json({ 
      message: 'Bulk update completed',
      updated: results.length
    });
  })
);

export default router;
