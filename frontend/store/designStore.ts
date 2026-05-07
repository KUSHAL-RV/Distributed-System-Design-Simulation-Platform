'use client';

import { create } from 'zustand';

export interface DesignNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: {
    label: string;
    nodeType: 'API_GATEWAY' | 'LOAD_BALANCER' | 'SERVICE' | 'DATABASE' | 'CACHE' | 'QUEUE';
    baseLatency?: number;
    maxConcurrency?: number;
    jitterMs?: number;
    errorRate?: number;
    instances?: number;
    algorithm?: string;
    config?: Record<string, unknown>;
  };
}

export interface DesignEdge {
  id: string;
  source: string;
  target: string;
  animated?: boolean;
  style?: Record<string, unknown>;
  data?: {
    weight?: number;
  };
}

interface DesignState {
  // Current design
  designId: string | null;
  designName: string;
  description: string;
  nodes: DesignNode[];
  edges: DesignEdge[];
  selectedNodeId: string | null;
  isDirty: boolean;
  isSaving: boolean;
  lastSavedAt: string | null;

  // Actions
  setDesign: (design: {
    id: string;
    name: string;
    description?: string;
    nodes: DesignNode[];
    edges: DesignEdge[];
  }) => void;
  setNodes: (nodes: DesignNode[]) => void;
  setEdges: (edges: DesignEdge[]) => void;
  addNode: (node: DesignNode) => void;
  removeNode: (nodeId: string) => void;
  updateNodeData: (nodeId: string, data: Partial<DesignNode['data']>) => void;
  setSelectedNode: (nodeId: string | null) => void;
  setDesignName: (name: string) => void;
  setIsSaving: (isSaving: boolean) => void;
  markSaved: () => void;
  resetDesign: () => void;
}

export const useDesignStore = create<DesignState>((set) => ({
  designId: null,
  designName: 'Untitled Design',
  description: '',
  nodes: [],
  edges: [],
  selectedNodeId: null,
  isDirty: false,
  isSaving: false,
  lastSavedAt: null,

  setDesign: (design) =>
    set({
      designId: design.id,
      designName: design.name,
      description: design.description || '',
      nodes: design.nodes,
      edges: design.edges,
      isDirty: false,
      lastSavedAt: new Date().toISOString(),
    }),

  setNodes: (nodes) => set({ nodes, isDirty: true }),
  setEdges: (edges) => set({ edges, isDirty: true }),

  addNode: (node) =>
    set((state) => ({
      nodes: [...state.nodes, node],
      isDirty: true,
    })),

  removeNode: (nodeId) =>
    set((state) => ({
      nodes: state.nodes.filter((n) => n.id !== nodeId),
      edges: state.edges.filter(
        (e) => e.source !== nodeId && e.target !== nodeId
      ),
      selectedNodeId:
        state.selectedNodeId === nodeId ? null : state.selectedNodeId,
      isDirty: true,
    })),

  updateNodeData: (nodeId, data) =>
    set((state) => ({
      nodes: state.nodes.map((n) =>
        n.id === nodeId ? { ...n, data: { ...n.data, ...data } } : n
      ),
      isDirty: true,
    })),

  setSelectedNode: (nodeId) => set({ selectedNodeId: nodeId }),
  setDesignName: (name) => set({ designName: name, isDirty: true }),
  setIsSaving: (isSaving) => set({ isSaving }),
  markSaved: () =>
    set({ isDirty: false, isSaving: false, lastSavedAt: new Date().toISOString() }),
  resetDesign: () =>
    set({
      designId: null,
      designName: 'Untitled Design',
      description: '',
      nodes: [],
      edges: [],
      selectedNodeId: null,
      isDirty: false,
      isSaving: false,
      lastSavedAt: null,
    }),
}));
