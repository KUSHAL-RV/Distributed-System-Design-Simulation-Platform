import { Router, Response } from 'express';
import { z } from 'zod';
import { nanoid } from 'nanoid';
import prisma from '../lib/prisma';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/auth';
import { apiLimiter } from '../middleware/rateLimit';
import { AuthenticatedRequest } from '../types';

const router = Router();

// ─── Zod Schemas ─────────────────────────────────

const createDesignSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  description: z.string().max(1000).optional(),
  nodes: z.array(z.any()).default([]),
  edges: z.array(z.any()).default([]),
});

const updateDesignSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional().nullable(),
  nodes: z.array(z.any()).optional(),
  edges: z.array(z.any()).optional(),
});

const idParamSchema = z.object({
  id: z.string().min(1),
});

const slugParamSchema = z.object({
  slug: z.string().min(1),
});

// ─── GET /api/designs ────────────────────────────
// List all designs for the authenticated user

router.get(
  '/',
  authenticate,
  apiLimiter,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!.userId;

      const designs = await prisma.design.findMany({
        where: { userId },
        orderBy: { updatedAt: 'desc' },
        select: {
          id: true,
          name: true,
          description: true,
          isPublic: true,
          shareSlug: true,
          nodes: true,
          edges: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: { simulations: true },
          },
        },
      });

      res.json({
        success: true,
        data: designs,
      });
    } catch (err) {
      console.error('[Designs] List error:', err);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch designs.',
      });
    }
  }
);

// ─── POST /api/designs ───────────────────────────
// Create a new design

router.post(
  '/',
  authenticate,
  apiLimiter,
  validate({ body: createDesignSchema }),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const { name, description, nodes, edges } = req.body;

      const design = await prisma.design.create({
        data: {
          name,
          description,
          userId,
          nodes: nodes as any,
          edges: edges as any,
        },
      });

      res.status(201).json({
        success: true,
        data: design,
      });
    } catch (err) {
      console.error('[Designs] Create error:', err);
      res.status(500).json({
        success: false,
        error: 'Failed to create design.',
      });
    }
  }
);

// ─── GET /api/designs/:id ────────────────────────
// Get a single design (must own it)

router.get(
  '/:id',
  authenticate,
  apiLimiter,
  validate({ params: idParamSchema }),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;

      const design = await prisma.design.findFirst({
        where: { id, userId },
        include: {
          simulations: {
            orderBy: { createdAt: 'desc' },
            take: 10,
            select: {
              id: true,
              status: true,
              config: true,
              startedAt: true,
              endedAt: true,
              createdAt: true,
            },
          },
        },
      });

      if (!design) {
        res.status(404).json({
          success: false,
          error: 'Design not found.',
        });
        return;
      }

      res.json({
        success: true,
        data: design,
      });
    } catch (err) {
      console.error('[Designs] Get error:', err);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch design.',
      });
    }
  }
);

// ─── PUT /api/designs/:id ────────────────────────
// Update a design (must own it)

router.put(
  '/:id',
  authenticate,
  apiLimiter,
  validate({ params: idParamSchema, body: updateDesignSchema }),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      const { name, description, nodes, edges } = req.body;

      // Verify ownership
      const existing = await prisma.design.findFirst({
        where: { id, userId },
      });

      if (!existing) {
        res.status(404).json({
          success: false,
          error: 'Design not found.',
        });
        return;
      }

      const updated = await prisma.design.update({
        where: { id },
        data: {
          ...(name !== undefined && { name }),
          ...(description !== undefined && { description }),
          ...(nodes !== undefined && { nodes: nodes as any }),
          ...(edges !== undefined && { edges: edges as any }),
        },
      });

      res.json({
        success: true,
        data: updated,
      });
    } catch (err) {
      console.error('[Designs] Update error:', err);
      res.status(500).json({
        success: false,
        error: 'Failed to update design.',
      });
    }
  }
);

// ─── DELETE /api/designs/:id ─────────────────────
// Delete a design (must own it)

router.delete(
  '/:id',
  authenticate,
  apiLimiter,
  validate({ params: idParamSchema }),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;

      // Verify ownership
      const existing = await prisma.design.findFirst({
        where: { id, userId },
      });

      if (!existing) {
        res.status(404).json({
          success: false,
          error: 'Design not found.',
        });
        return;
      }

      await prisma.design.delete({ where: { id } });

      res.json({
        success: true,
        message: 'Design deleted successfully.',
      });
    } catch (err) {
      console.error('[Designs] Delete error:', err);
      res.status(500).json({
        success: false,
        error: 'Failed to delete design.',
      });
    }
  }
);

// ─── POST /api/designs/:id/simulate ───────────────
// Start a new simulation via gRPC to Go engine

router.post(
  '/:id/simulate',
  authenticate,
  apiLimiter,
  validate({ params: idParamSchema }),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;

      // Verify ownership
      const existing = await prisma.design.findFirst({
        where: { id, userId },
      });

      if (!existing) {
        res.status(404).json({
          success: false,
          error: 'Design not found.',
        });
        return;
      }

      // We need to pass the graph to Go engine
      const graphJson = JSON.stringify({
        nodes: existing.nodes,
        edges: existing.edges,
      });

      // Create a simulation run record
      const simRun = await prisma.simulation.create({
        data: {
          designId: id,
          status: 'RUNNING',
          config: {},
        },
      });

      // Import the gRPC client dynamically or at top. Using require here for safe mounting
      const { grpcClient } = require('../lib/grpcClient');

      try {
        const response = await grpcClient.startSimulation({
          simulation_id: simRun.id,
          design_id: id,
          graph_json: graphJson,
        });

        if (!response.success) {
          throw new Error(response.message);
        }

        res.status(200).json({
          success: true,
          data: {
            simulationId: simRun.id,
            message: 'Simulation started.',
          },
        });
      } catch (error: any) {
        console.error('[Designs] gRPC Start error:', error);
        // Mark failed
        await prisma.simulation.update({
          where: { id: simRun.id },
          data: { status: 'FAILED' },
        }).catch(console.error);

        res.status(500).json({
          success: false,
          error: 'Simulation engine rejected the request.',
        });
      }
    } catch (err) {
      console.error('[Designs] Simulate error:', err);
      res.status(500).json({
        success: false,
        error: 'Failed to start simulation.',
      });
    }
  }
);

// ─── POST /api/designs/:id/simulate/inject ───────
router.post(
  '/:id/simulate/inject',
  authenticate,
  apiLimiter,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { nodeId, failureType, simId } = req.body;
      const { grpcClient } = require('../lib/grpcClient');

      const response = await grpcClient.injectFailure({
        simulation_id: simId,
        node_id: nodeId,
        failure_type: failureType,
      });

      res.status(200).json({ success: response.success, message: response.message });
    } catch (err) {
      console.error('[Designs] Inject failure error:', err);
      res.status(500).json({ success: false, error: 'Failed' });
    }
  }
);

// ─── POST /api/designs/:id/simulate/remove ───────
router.post(
  '/:id/simulate/remove',
  authenticate,
  apiLimiter,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { nodeId, simId } = req.body;
      const { grpcClient } = require('../lib/grpcClient');

      const response = await grpcClient.removeFailure({
        simulation_id: simId,
        node_id: nodeId,
      });

      res.status(200).json({ success: response.success, message: response.message });
    } catch (err) {
      console.error('[Designs] Remove failure error:', err);
      res.status(500).json({ success: false, error: 'Failed' });
    }
  }
);

// ─── GET /api/designs/:id/simulate/insights ───────
router.get(
  '/:id/simulate/insights',
  authenticate,
  apiLimiter,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { simId } = req.query;
      if (!simId) {
        res.status(400).json({ success: false, error: 'Missing simId query' });
        return;
      }
      // AI Engine runs on arbitrary Port 6000
      const aiResponse = await fetch(`http://127.0.0.1:6000/insights/${simId}`);
      if (!aiResponse.ok) {
        throw new Error('AI Engine backend is failing or unresponsive');
      }
      
      const payload = (await aiResponse.json()) as any;
      res.status(200).json({
        success: true,
        data: payload.insights,
      });
      
    } catch (err) {
      console.error('[Designs] Insights proxy error:', err);
      // Fail gracefully returning empty insights if AI Engine isn't active
      res.status(200).json({ success: true, data: [] });
    }
  }
);

// ─── GET /api/designs/:id/simulate/history ───────
router.get(
  '/:id/simulate/history',
  authenticate,
  apiLimiter,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { simId } = req.query;
      if (!simId || typeof simId !== 'string') {
        res.status(400).json({ success: false, error: 'Missing simId query' });
        return;
      }

      // @ts-ignore - Prisma Language Server cache bypass
      const metrics = await prisma.simulationMetric.findMany({
        where: { simulationId: simId },
        orderBy: { timestamp: 'asc' },
      });

      res.status(200).json({ success: true, data: metrics });
    } catch (err) {
      console.error('[Designs] DB History error:', err);
      res.status(500).json({ success: false, error: 'Failed to fetch history' });
    }
  }
);

// ─── GET /api/designs/:id/simulate/export ────────
router.get(
  '/:id/simulate/export',
  authenticate,
  apiLimiter,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { simId } = req.query;
      if (!simId || typeof simId !== 'string') {
        res.status(400).json({ success: false, error: 'Missing simId query' });
        return;
      }

      // @ts-ignore - Prisma Language Server cache bypass
      const metrics = await prisma.simulationMetric.findMany({
        where: { simulationId: simId },
        orderBy: { timestamp: 'asc' },
      });

      // Construct native CSV payload dynamically without 3rd-party libs
      const headers = "timestamp,nodeId,latency,success,statusCode\n";
      const rows = metrics.map((m: any) => 
        `${m.timestamp.toISOString()},${m.nodeId},${m.latency},${m.success},${m.statusCode}`
      ).join("\n");

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="simulation-${simId}.csv"`);
      res.status(200).send(headers + rows);
      
    } catch (err) {
      console.error('[Designs] Export CSV error:', err);
      res.status(500).json({ success: false, error: 'Failed to generate CSV' });
    }
  }
);

// ─── POST /api/designs/:id/share ─────────────────
// Generate a shareable public link

router.post(
  '/:id/share',
  authenticate,
  apiLimiter,
  validate({ params: idParamSchema }),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;

      // Verify ownership
      const existing = await prisma.design.findFirst({
        where: { id, userId },
      });

      if (!existing) {
        res.status(404).json({
          success: false,
          error: 'Design not found.',
        });
        return;
      }

      // Generate or return existing share slug
      const shareSlug = existing.shareSlug || nanoid(12);

      const updated = await prisma.design.update({
        where: { id },
        data: {
          isPublic: true,
          shareSlug,
        },
      });

      res.json({
        success: true,
        data: {
          shareSlug: updated.shareSlug,
          publicUrl: `${process.env.CORS_ORIGIN || 'http://localhost:3000'}/shared/${updated.shareSlug}`,
        },
      });
    } catch (err) {
      console.error('[Designs] Share error:', err);
      res.status(500).json({
        success: false,
        error: 'Failed to share design.',
      });
    }
  }
);

// ─── GET /api/designs/shared/:slug ───────────────
// Public access to a shared design (no auth required)

router.get(
  '/shared/:slug',
  apiLimiter,
  validate({ params: slugParamSchema }),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { slug } = req.params;

      const design = await prisma.design.findUnique({
        where: { shareSlug: slug },
        select: {
          id: true,
          name: true,
          description: true,
          nodes: true,
          edges: true,
          createdAt: true,
          updatedAt: true,
          user: {
            select: {
              name: true,
            },
          },
        },
      });

      if (!design) {
        res.status(404).json({
          success: false,
          error: 'Shared design not found.',
        });
        return;
      }

      res.json({
        success: true,
        data: design,
      });
    } catch (err) {
      console.error('[Designs] Shared get error:', err);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch shared design.',
      });
    }
  }
);

export default router;
