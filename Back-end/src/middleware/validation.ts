import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

export const validateRequest = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }
    
    next();
  };
};

// Common validation schemas
export const schemas = {
  createUser: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).required(),
    role: Joi.string().valid('ADMIN', 'BRANCH_USER').required(),
    branchId: Joi.string().uuid().optional(),
    password: Joi.string().min(6).optional()
  }),

  updateUser: Joi.object({
    name: Joi.string().min(2).max(100).optional(),
    phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).optional(),
    role: Joi.string().valid('ADMIN', 'BRANCH_USER').optional(),
    branchId: Joi.string().uuid().optional(),
    isBlocked: Joi.boolean().optional(),
    notes: Joi.string().max(500).optional()
  }),

  createBranch: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    address: Joi.string().min(5).max(200).required(),
    lat: Joi.number().min(-90).max(90).required(),
    lng: Joi.number().min(-180).max(180).required()
  }),

  updateBranch: Joi.object({
    name: Joi.string().min(2).max(100).optional(),
    address: Joi.string().min(5).max(200).optional(),
    lat: Joi.number().min(-90).max(90).optional(),
    lng: Joi.number().min(-180).max(180).optional()
  }),

  createMenu: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    branchId: Joi.string().uuid().required()
  }),

  createDish: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    description: Joi.string().max(500).optional(),
    imageUrl: Joi.string().uri().optional(),
    priceCents: Joi.number().integer().min(0).required(),
    menuId: Joi.string().uuid().required(),
    ingredients: Joi.array().items(
      Joi.object({
        ingredientId: Joi.string().uuid().required(),
        qtyUnit: Joi.number().min(0).optional(),
        required: Joi.boolean().optional()
      })
    ).min(1).required()
  }),

  updateDish: Joi.object({
    name: Joi.string().min(2).max(100).optional(),
    description: Joi.string().max(500).optional(),
    imageUrl: Joi.string().uri().optional(),
    priceCents: Joi.number().integer().min(0).optional(),
    available: Joi.boolean().optional(),
    ingredients: Joi.array().items(
      Joi.object({
        ingredientId: Joi.string().uuid().required(),
        qtyUnit: Joi.number().min(0).optional(),
        required: Joi.boolean().optional()
      })
    ).optional()
  }),

  createOrder: Joi.object({
    branchId: Joi.string().uuid().required(),
    userName: Joi.string().min(2).max(100).required(),
    userPhone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).required(),
    items: Joi.array().items(
      Joi.object({
        dishId: Joi.string().uuid().required(),
        qty: Joi.number().integer().min(1).required()
      })
    ).min(1).required()
  }),

  updateOrderStatus: Joi.object({
    status: Joi.string().valid(
      'PENDING', 'ACCEPTED', 'PREPARING', 'READY', 
      'OUT_FOR_DELIVERY', 'COMPLETED', 'CANCELED'
    ).required(),
    cancelReason: Joi.string().max(200).optional()
  }),

  login: Joi.object({
    phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).required(),
    password: Joi.string().min(6).required()
  }),

  userSearch: Joi.object({
    search: Joi.string().min(1).max(100).optional(),
    role: Joi.string().valid('ADMIN', 'BRANCH_USER').optional(),
    branchId: Joi.string().uuid().optional(),
    isBlocked: Joi.boolean().optional(),
    page: Joi.number().integer().min(1).optional(),
    limit: Joi.number().integer().min(1).max(100).optional()
  }),

  orderSearch: Joi.object({
    branchId: Joi.string().uuid().optional(),
    status: Joi.string().valid(
      'PENDING', 'ACCEPTED', 'PREPARING', 'READY', 
      'OUT_FOR_DELIVERY', 'COMPLETED', 'CANCELED'
    ).optional(),
    userPhone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).optional(),
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().optional(),
    page: Joi.number().integer().min(1).optional(),
    limit: Joi.number().integer().min(1).max(100).optional()
  })
};
