'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Zap,
  Save,
  ArrowLeft,
  Play,
  Settings,
  Check,
  Loader2,
  Trash2,
  LayoutGrid,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import FlowCanvas from '@/components/builder/FlowCanvas';
import Sidebar from '@/components/builder/Sidebar';
import { useDesign } from '@/hooks/useDesign';
import { useDesignStore } from '@/store/designStore';

export default function DesignBuilderPage() {
  const params = useParams();
  const router = useRouter();
  const designId = params.id as string;

  const { saveDesign } = useDesign(designId);
  const {
    designName,
    isDirty,
    isSaving,
    lastSavedAt,
    selectedNodeId,
    nodes,
    setSelectedNode,
    setDesignName,
    updateNodeData,
    removeNode,
  } = useDesignStore();

  const [showConfig, setShowConfig] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  const handleManualSave = useCallback(() => {
    saveDesign();
  }, [saveDesign]);

  // Keyboard shortcut: Ctrl+S
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleManualSave();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleManualSave]);

  const handleNodeSelect = useCallback((nodeId: string | null) => {
    setSelectedNode(nodeId);
    if (nodeId) setShowConfig(true);
  }, [setSelectedNode]);

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  return (
    <div className="h-screen flex flex-col bg-gray-950">
      {/* ─── Top Bar ─────────────────────────────── */}
      <div className="h-14 border-b border-white/5 bg-gray-900/80 backdrop-blur-xl flex items-center justify-between px-4 shrink-0">
        {/* Left */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/dashboard')}
          >
            <ArrowLeft size={16} />
          </Button>

          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
              <Zap size={12} className="text-white" />
            </div>
            <input
              type="text"
              value={designName}
              onChange={(e) => setDesignName(e.target.value)}
              className="bg-transparent text-white text-sm font-semibold border-none outline-none focus:ring-0 max-w-[200px]"
              placeholder="Untitled Design"
            />
          </div>

          {/* Save status */}
          <div className="flex items-center gap-1.5 text-xs">
            {isSaving ? (
              <span className="flex items-center gap-1 text-amber-400">
                <Loader2 size={12} className="animate-spin" />
                Saving...
              </span>
            ) : isDirty ? (
              <span className="text-amber-400">• Unsaved changes</span>
            ) : lastSavedAt ? (
              <span className="flex items-center gap-1 text-emerald-400">
                <Check size={12} />
                Saved
              </span>
            ) : null}
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowConfig(!showConfig)}
          >
            <Settings size={16} />
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleManualSave}
            disabled={!isDirty}
          >
            <Save size={14} />
            Save
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => router.push(`/simulate/${designId}`)}
            disabled={nodes.length === 0}
          >
            <Play size={14} />
            Simulate
          </Button>
        </div>
      </div>

      {/* ─── Main area ───────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar />

        {/* Canvas */}
        <div className="flex-1 relative">
          <FlowCanvas onNodeSelect={handleNodeSelect} />
          
          {/* Empty State Overlay */}
          {nodes.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="max-w-md p-8 rounded-3xl bg-gray-900/40 backdrop-blur-md border border-white/5 text-center pointer-events-auto">
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-violet-500/10 flex items-center justify-center">
                  <Zap size={32} className="text-violet-400" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Build Your Architecture</h2>
                <p className="text-gray-400 mb-8 leading-relaxed">
                  Drag components from the sidebar to start building your system from scratch, or choose a pre-built template to save time.
                </p>
                <div className="flex flex-col gap-3">
                  <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Get Started</p>
                  <Button 
                    variant="primary" 
                    className="w-full justify-center"
                    onClick={() => router.push('/templates')}
                  >
                    <LayoutGrid size={18} className="mr-2" />
                    Browse Templates
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Config Panel (right side, shown when node selected) */}
        {selectedNode && showConfig && (
          <div className="w-72 border-l border-white/5 bg-gray-900/95 backdrop-blur-xl p-4 overflow-y-auto">
            <h3 className="text-sm font-semibold text-white mb-4">
              Node Configuration
            </h3>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Label</label>
                <input
                  type="text"
                  value={selectedNode.data.label}
                  onChange={(e) =>
                    updateNodeData(selectedNode.id, { label: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-1 focus:ring-violet-500/50"
                />
              </div>

              <div>
                <label className="text-xs text-gray-400 mb-1 block">
                  Base Latency (ms)
                </label>
                <input
                  type="number"
                  value={selectedNode.data.baseLatency || 50}
                  onChange={(e) =>
                    updateNodeData(selectedNode.id, {
                      baseLatency: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3 py-2 text-sm rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-1 focus:ring-violet-500/50"
                />
              </div>

              <div>
                <label className="text-xs text-gray-400 mb-1 block">
                  Max Concurrency
                </label>
                <input
                  type="number"
                  value={selectedNode.data.maxConcurrency || 100}
                  onChange={(e) =>
                    updateNodeData(selectedNode.id, {
                      maxConcurrency: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3 py-2 text-sm rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-1 focus:ring-violet-500/50"
                />
              </div>

              <div>
                <label className="text-xs text-gray-400 mb-1 block">
                  Jitter (ms)
                </label>
                <input
                  type="number"
                  value={selectedNode.data.jitterMs || 10}
                  onChange={(e) =>
                    updateNodeData(selectedNode.id, {
                      jitterMs: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3 py-2 text-sm rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-1 focus:ring-violet-500/50"
                />
              </div>

              <div>
                <label className="text-xs text-gray-400 mb-1 block">
                  Error Rate (0-1)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  value={selectedNode.data.errorRate || 0.01}
                  onChange={(e) =>
                    updateNodeData(selectedNode.id, {
                      errorRate: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3 py-2 text-sm rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-1 focus:ring-violet-500/50"
                />
              </div>

              {selectedNode.data.nodeType !== 'API_GATEWAY' && (
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">
                    Instances (Horizontal Scale)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={selectedNode.data.instances || 1}
                    onChange={(e) =>
                      updateNodeData(selectedNode.id, {
                        instances: parseInt(e.target.value) || 1,
                      })
                    }
                    className="w-full px-3 py-2 text-sm rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-1 focus:ring-violet-500/50"
                  />
                </div>
              )}

              {selectedNode.data.nodeType === 'LOAD_BALANCER' && (
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">
                    Routing Algorithm
                  </label>
                  <select
                    value={selectedNode.data.algorithm || 'ROUND_ROBIN'}
                    onChange={(e) =>
                      updateNodeData(selectedNode.id, {
                        algorithm: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 text-sm rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-1 focus:ring-violet-500/50 appearance-none"
                  >
                    <option value="ROUND_ROBIN" className="bg-gray-900">Round Robin</option>
                    <option value="RANDOM" className="bg-gray-900">Random Distribution</option>
                    <option value="LEAST_CONNECTIONS" className="bg-gray-900">Least Connections</option>
                  </select>
                </div>
              )}

              <div className="pt-6 border-t border-white/5">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (selectedNode) {
                      removeNode(selectedNode.id);
                      setSelectedNode(null);
                    }
                  }}
                  className="w-full text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 justify-start px-2"
                >
                  <Trash2 size={14} className="mr-2" />
                  Delete Node
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
