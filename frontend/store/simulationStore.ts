import { create } from 'zustand';

export interface MetricPayload {
  simulationId: string;
  nodeId: string;
  timestamp: number;
  latency: number;
  success: boolean;
  statusCode: number;
}

export interface NodeStats {
  latencyP50: number;
  latencyP95: number;
  latencyP99: number;
  errorRate: number;
  totalRequests: number;
  status: 'healthy' | 'warning' | 'critical';
  lastStatusCode?: number; // E.g., 502 = Kill, 503 = Partition, 504 = Drop
  // internal history ring buffer
  _history: number[];
  _failures: number;
}

export interface TimeSeriesPoint {
  time: string;
  p50: number;
  p99: number;
  rps: number;
  errors: number;
}

interface SimulationState {
  isActive: boolean;
  activeSimulationId: string | null;
  nodeStats: Record<string, NodeStats>;
  globalSeries: TimeSeriesPoint[];
  
  // Actions
  startSimulation: (id: string) => void;
  stopSimulation: () => void;
  recordMetricBatch: (metrics: MetricPayload[]) => void;
}

const HISTORY_SIZE = 100;
const CHART_MAX_POINTS = 60; // 1 minute window at 1 tick/sec

export const useSimulationStore = create<SimulationState>((set) => ({
  isActive: false,
  activeSimulationId: null,
  nodeStats: {},
  globalSeries: [],

  startSimulation: (id) => set((state) => {
    // If it's a reconnection to the same sim, don't wipe data
    if (state.activeSimulationId === id) {
      return { isActive: true };
    }
    return {
      isActive: true,
      activeSimulationId: id,
      nodeStats: {},
      globalSeries: [],
    };
  }),

  stopSimulation: () => set({
    isActive: false,
    activeSimulationId: null,
  }),

  recordMetricBatch: (metrics) => set((state) => {
    const newNodeStats = { ...state.nodeStats };
    const newGlobalSeries = [...state.globalSeries];
    
    metrics.forEach(metric => {
      // 1. Update Node Stats
      const existingNode = newNodeStats[metric.nodeId] || {
        latencyP50: 0, latencyP95: 0, latencyP99: 0,
        errorRate: 0, totalRequests: 0, status: 'healthy' as const,
        lastStatusCode: 200,
        _history: [], _failures: 0
      };

      const node = { ...existingNode, _history: [...existingNode._history] };
      node.lastStatusCode = metric.statusCode;
      node.totalRequests++;
      if (!metric.success) node._failures++;
      node._history.push(metric.latency);
      if (node._history.length > HISTORY_SIZE) node._history.shift();

      if (node._history.length >= 5) {
        const sorted = [...node._history].sort((a, b) => a - b);
        node.latencyP50 = sorted[Math.floor(sorted.length * 0.5)];
        node.latencyP95 = sorted[Math.floor(sorted.length * 0.95)];
      } else {
        node.latencyP50 = metric.latency;
      }

      node.errorRate = node._failures / node.totalRequests;
      node.status = node.errorRate > 0.05 ? 'critical' : (node.errorRate > 0.01 ? 'warning' : 'healthy');
      newNodeStats[metric.nodeId] = node;

      // 2. Global series
      const timeStr = new Date(metric.timestamp).toLocaleTimeString();
      let lastPoint = newGlobalSeries[newGlobalSeries.length - 1];

      if (!lastPoint || lastPoint.time !== timeStr) {
        newGlobalSeries.push({ 
          time: timeStr, p50: metric.latency, p99: metric.latency, rps: 1, errors: metric.success ? 0 : 1 
        });
        if (newGlobalSeries.length > CHART_MAX_POINTS) newGlobalSeries.shift();
      } else {
        // Clone the point to avoid mutating read-only state
        const updatedPoint = { ...lastPoint };
        updatedPoint.rps++;
        if (!metric.success) updatedPoint.errors++;
        updatedPoint.p50 = Math.round((updatedPoint.p50 + metric.latency) / 2);
        updatedPoint.p99 = Math.max(updatedPoint.p99, metric.latency);
        newGlobalSeries[newGlobalSeries.length - 1] = updatedPoint;
      }
    });

    return { nodeStats: newNodeStats, globalSeries: newGlobalSeries };
  })
}));
