import express from 'express';
import { prisma } from '../config/database';
import { hashPassword, comparePassword, generateToken } from '../utils/auth';
import { validateRequest, schemas } from '../middleware/validation';
import { authenticateToken } from '../middleware/auth';
import { auditLogin } from '../middleware/audit';
import { asyncHandler } from '../middleware/error';
import { config } from '../config/env';
import { Role } from '../types';
import Joi from 'joi';

const router = express.Router();

// Login
router.post('/login', 
  validateRequest(schemas.login),
  auditLogin(),
  asyncHandler(async (req, res) => {
    const { phone, password } = req.body;

    // Find user by phone
    const user = await prisma.user.findUnique({
      where: { phone },
      include: { branch: true }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (user.isBlocked) {
      return res.status(401).json({ error: 'Account is blocked' });
    }

    // For now, we'll use a simple password check
    // In production, you should hash passwords when creating users
    const isValidPassword = await comparePassword(password, user.password || '');
    
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken({
      userId: user.id,
      role: user.role,
      branchId: user.branchId || undefined
    });

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        branchId: user.branchId,
        branch: user.branch
      }
    });
  })
);

// Register (Admin only)
router.post('/register',
  authenticateToken,
  validateRequest(schemas.createUser),
  asyncHandler(async (req, res) => {
    if (req.user?.role !== Role.ADMIN) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { name, phone, role, branchId, password } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { phone }
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

    // Hash password
    const hashedPassword = await hashPassword(password || 'defaultPassword123');

    const user = await prisma.user.create({
      data: {
        name,
        phone,
        role,
        branchId: branchId || null,
        password: hashedPassword
      },
      include: { branch: true }
    });

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        branchId: user.branchId,
        branch: user.branch
      }
    });
  })
);

// Get current user
router.get('/me',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: { branch: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user.id,
      name: user.name,
      phone: user.phone,
      role: user.role,
      branchId: user.branchId,
      branch: user.branch,
      isBlocked: user.isBlocked,
      createdAt: user.createdAt
    });
  })
);

// Logout (client-side token removal)
router.post('/logout',
  authenticateToken,
  asyncHandler(async (req, res) => {
    // In a more sophisticated setup, you might want to blacklist the token
    res.json({ message: 'Logged out successfully' });
  })
);

// Change password
router.put('/change-password',
  authenticateToken,
  validateRequest(Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().min(6).required()
  })),
  asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user!.id;

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isValidPassword = await comparePassword(currentPassword, user.password || '');
    
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    const hashedNewPassword = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword }
    });

    res.json({ message: 'Password changed successfully' });
  })
);

export default router;
