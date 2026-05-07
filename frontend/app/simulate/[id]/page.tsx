'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ReactFlow, ReactFlowProvider, Background, BackgroundVariant, Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { ArrowLeft, Zap } from 'lucide-react';
import { Button } from '@/components/ui/Button';

import { useDesign } from '../../../hooks/useDesign';
import { useDesignStore } from '../../../store/designStore';
import { useSimulation } from '../../../hooks/useSimulation';
import { MetricsDashboard } from '../../../components/simulate/MetricsDashboard';
import { AnimatedEdge } from '../../../components/simulate/AnimatedEdge';
import { nodeTypes } from '../../../components/builder/NodeTypes';
import { FailurePanel } from '../../../components/simulate/FailurePanel';
import { InsightsPanel } from '../../../components/simulate/InsightsPanel';
import { useSimulationStore } from '../../../store/simulationStore';

// We register our custom edge
const edgeTypes = {
  animated: AnimatedEdge,
  default: AnimatedEdge, // Overriding default temporarily for visualization!
};

export default function SimulatorPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  
  const { fetchDesign } = useDesign(id);
  const { nodes, edges, designName } = useDesignStore();
  const { isActive } = useSimulation(id);
  const { activeSimulationId } = useSimulationStore();

  const [loading, setLoading] = useState(true);

  // Fetch the design on mount
  useEffect(() => {
    if (id) {
      setLoading(true);
      fetchDesign(id).finally(() => setLoading(false));
    }
  }, [id, fetchDesign]);

  // Transform standard edges into animated edges when running
  const activeEdges = useMemo(() => {
    if (!edges) return [];
    return edges.map((e: Edge) => ({
      ...e,
      type: isActive ? 'animated' : 'default',
      animated: isActive,
    }));
  }, [edges, isActive]);

  const handleDownloadCSV = async () => {
    if (!isActive || !activeSimulationId) return;
    try {
      const response = await fetch(
        `http://localhost:4000/api/designs/${id}/simulate/export?simId=${activeSimulationId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      );
      
      if (!response.ok) throw new Error('Failed to download CSV');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `simulation-report-${activeSimulationId.slice(0, 8)}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('[Export] Error:', err);
      alert('Failed to export CSV. Please check console for details.');
    }
  };

  if (loading) return <div className="p-8 text-white h-screen bg-zinc-950">Loading simulation architecture...</div>;
  if (!nodes.length) return <div className="p-8 text-rose-500 h-screen bg-zinc-950">Failed to load design.</div>;

  return (
    <div className="h-screen w-full flex flex-col bg-zinc-950 overflow-hidden">
      {/* Top Bar */}
      <div className="h-14 border-b border-white/5 bg-gray-900/80 backdrop-blur-xl flex items-center justify-between px-4 shrink-0 z-10">
        <div className="flex items-center gap-4">
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
            <span className="text-sm font-semibold text-white">{designName} — Simulation</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {isActive && (
            <Button variant="secondary" size="sm" onClick={handleDownloadCSV} className="text-xs">
              <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export CSV
            </Button>
          )}
          <div className="flex items-center gap-2 px-3 py-1 bg-zinc-950 rounded-full border border-white/5">
            <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
            <span className="text-xs text-zinc-400 font-medium tracking-wide">
              {isActive ? 'SIMULATION LIVE' : 'OFFLINE'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chaos Failure Controller */}
        <FailurePanel designId={id} />

        {/* React Flow Canvas (Read Only) */}
        <div className="flex-1 relative">
          <InsightsPanel designId={id} />
          
          <ReactFlowProvider>
            <ReactFlow
              nodes={nodes as any}
              edges={activeEdges as any}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes as any}
              fitView
              nodesDraggable={false}
              nodesConnectable={false}
              elementsSelectable={false}
              proOptions={{ hideAttribution: true }}
              colorMode="dark"
            >
              <Background variant={BackgroundVariant.Dots} gap={24} size={2} color="#ffffff15" />
            </ReactFlow>
          </ReactFlowProvider>
        </div>

        {/* Real-time Metrics Dashboard */}
        <MetricsDashboard />
      </div>
    </div>
  );
}
