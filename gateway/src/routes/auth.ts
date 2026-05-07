import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { sessionStore } from '../lib/redis';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/auth';
import { authLimiter } from '../middleware/rateLimit';
import { AuthenticatedRequest, JwtPayload } from '../types';

const router = Router();

// ─── Zod Schemas ─────────────────────────────────

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

// ─── Token Helpers ───────────────────────────────

const JWT_SECRET = process.env.JWT_SECRET || 'default-dev-secret';
const JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || 'default-refresh-secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

function generateTokens(payload: JwtPayload) {
  const accessToken = jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  } as jwt.SignOptions);

  const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRES_IN,
  } as jwt.SignOptions);

  return { accessToken, refreshToken };
}

// ─── POST /api/auth/register ─────────────────────

router.post(
  '/register',
  authLimiter,
  validate({ body: registerSchema }),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { email, name, password } = req.body;

      // Check if user exists
      const existing = await prisma.user.findUnique({
        where: { email },
      });

      if (existing) {
        res.status(409).json({
          success: false,
          error: 'An account with this email already exists.',
        });
        return;
      }

      // Hash password
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create user
      const user = await prisma.user.create({
        data: {
          email,
          name,
          password: hashedPassword,
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
        },
      });

      // Generate tokens
      const payload: JwtPayload = {
        userId: user.id,
        email: user.email,
        role: user.role,
      };
      const tokens = generateTokens(payload);

      // Store session
      await sessionStore.sadd(`user:${user.id}:sessions`, tokens.refreshToken);
      await sessionStore.expire(`user:${user.id}:sessions`, 7 * 24 * 60 * 60); // 7 days

      res.status(201).json({
        success: true,
        data: {
          user,
          ...tokens,
        },
      });
    } catch (err) {
      console.error('[Auth] Register error:', err);
      res.status(500).json({
        success: false,
        error: 'Internal server error during registration.',
      });
    }
  }
);

// ─── POST /api/auth/login ────────────────────────

router.post(
  '/login',
  authLimiter,
  validate({ body: loginSchema }),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        res.status(401).json({
          success: false,
          error: 'Invalid email or password.',
        });
        return;
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        res.status(401).json({
          success: false,
          error: 'Invalid email or password.',
        });
        return;
      }

      // Generate tokens
      const payload: JwtPayload = {
        userId: user.id,
        email: user.email,
        role: user.role,
      };
      const tokens = generateTokens(payload);

      // Store session
      await sessionStore.sadd(`user:${user.id}:sessions`, tokens.refreshToken);
      await sessionStore.expire(`user:${user.id}:sessions`, 7 * 24 * 60 * 60);

      res.status(200).json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            createdAt: user.createdAt,
          },
          ...tokens,
        },
      });
    } catch (err) {
      console.error('[Auth] Login error:', err);
      res.status(500).json({
        success: false,
        error: 'Internal server error during login.',
      });
    }
  }
);

// ─── POST /api/auth/refresh ──────────────────────

router.post(
  '/refresh',
  validate({ body: refreshSchema }),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { refreshToken } = req.body;

      // Verify refresh token
      const decoded = jwt.verify(
        refreshToken,
        JWT_REFRESH_SECRET
      ) as JwtPayload;

      // Check if session exists
      const isValid = await sessionStore.sismember(
        `user:${decoded.userId}:sessions`,
        refreshToken
      );

      if (!isValid) {
        res.status(401).json({
          success: false,
          error: 'Invalid or expired refresh token.',
        });
        return;
      }

      // Rotate: remove old, issue new
      await sessionStore.srem(`user:${decoded.userId}:sessions`, refreshToken);

      const payload: JwtPayload = {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
      };
      const tokens = generateTokens(payload);

      await sessionStore.sadd(`user:${decoded.userId}:sessions`, tokens.refreshToken);
      await sessionStore.expire(
        `user:${decoded.userId}:sessions`,
        7 * 24 * 60 * 60
      );

      res.status(200).json({
        success: true,
        data: tokens,
      });
    } catch (err) {
      if (err instanceof jwt.TokenExpiredError) {
        res.status(401).json({
          success: false,
          error: 'Refresh token expired. Please login again.',
        });
        return;
      }
      console.error('[Auth] Refresh error:', err);
      res.status(500).json({
        success: false,
        error: 'Internal server error.',
      });
    }
  }
);

// ─── DELETE /api/auth/logout ─────────────────────

router.delete(
  '/logout',
  authenticate,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!.userId;

      // Clear all sessions for user
      await sessionStore.del(`user:${userId}:sessions`);

      res.status(200).json({
        success: true,
        message: 'Logged out successfully.',
      });
    } catch (err) {
      console.error('[Auth] Logout error:', err);
      res.status(500).json({
        success: false,
        error: 'Internal server error.',
      });
    }
  }
);

export default router;
