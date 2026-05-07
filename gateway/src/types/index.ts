import { Request } from 'express';

// ─── Auth ────────────────────────────────────────

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

// ─── Design ──────────────────────────────────────

export interface DesignNode {
  id: string;
  type: 'API_GATEWAY' | 'LOAD_BALANCER' | 'SERVICE' | 'DATABASE' | 'CACHE' | 'QUEUE';
  position: { x: number; y: number };
  data: {
    label: string;
    baseLatency?: number;
    maxConcurrency?: number;
    jitterMs?: number;
    errorRate?: number;
    config?: Record<string, unknown>;
  };
}

export interface DesignEdge {
  id: string;
  source: string;
  target: string;
  data?: {
    weight?: number; // traffic split percentage
  };
}

// ─── Simulation ──────────────────────────────────

export interface SimulationConfig {
  rps: number;
  burstFactor: number;
  duration: number; // seconds
  failureScenarios: FailureScenario[];
}

export interface FailureScenario {
  nodeId: string;
  type: 'kill' | 'slow' | 'drop_packets' | 'partition';
  params: {
    slowFactor?: number;
    dropRate?: number;
    partitionTarget?: string;
    delayMs?: number;
  };
  triggerAt?: number; // seconds after start
}

// ─── Metrics ─────────────────────────────────────

export interface NodeMetrics {
  latencyMs: number;
  queueDepth: number;
  errorRate: number;
  throughput: number;
  status: 'healthy' | 'degraded' | 'failed';
}

// ─── API Response ────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
