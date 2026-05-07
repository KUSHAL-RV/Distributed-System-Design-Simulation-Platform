'use client';

import React, { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { GitBranch } from 'lucide-react';
import { useSimulationStore } from '../../../store/simulationStore';

function LoadBalancerNode({ id, data, selected }: NodeProps) {
  const status = useSimulationStore((state) => state.nodeStats[id]?.status);
  const pulseClass = status ? `sim-pulse-${status}` : '';
  return (
    <div
      className={`
        relative px-4 py-3 rounded-xl border-2 min-w-[160px]
        bg-gradient-to-br from-sky-950/90 to-sky-900/80
        backdrop-blur-sm shadow-lg
        transition-all duration-200 ${pulseClass}
        ${selected ? 'border-sky-400 shadow-sky-500/30 shadow-xl' : 'border-sky-500/40'}
      `}
    >
      <div className="absolute -top-1.5 -right-1.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-gray-900 animate-pulse" />

      <div className="flex items-center gap-2.5">
        <div className="p-1.5 rounded-lg bg-sky-500/20">
          <GitBranch size={18} className="text-sky-400" />
        </div>
        <div>
          <p className="text-xs font-medium text-sky-300/70 uppercase tracking-wider">Load Balancer</p>
          <p className="text-sm font-semibold text-white">{(data as any).label || 'Load Balancer'}</p>
        </div>
      </div>

      {(data as any).config?.algorithm && (
        <div className="mt-2 text-xs text-sky-300/60">
          <span className="px-1.5 py-0.5 rounded bg-sky-500/10 border border-sky-500/20">
            {(data as any).config.algorithm}
          </span>
        </div>
      )}

      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-sky-400 !border-2 !border-sky-900" />
      <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-sky-400 !border-2 !border-sky-900" />
    </div>
  );
}

export default memo(LoadBalancerNode);
