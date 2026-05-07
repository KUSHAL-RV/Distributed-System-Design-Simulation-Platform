'use client';

import React, { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Globe } from 'lucide-react';
import { useSimulationStore } from '../../../store/simulationStore';

function ApiGatewayNode({ id, data, selected }: NodeProps) {
  const nodeStats = useSimulationStore((state) => state.nodeStats[id]);
  const status = nodeStats?.status;
  const isKilled = nodeStats?.lastStatusCode === 502;
  const isPartitioned = nodeStats?.lastStatusCode === 503;
  
  let pulseClass = status ? `sim-pulse-${status}` : '';
  if (isKilled) pulseClass = 'sim-pulse-critical grayscale brightness-50 border-rose-500/80';
  if (isPartitioned) pulseClass = 'sim-pulse-warning opacity-70 border-dashed border-indigo-500/80';

  return (
    <div
      className={`
        relative px-4 py-3 rounded-xl border-2 min-w-[160px]
        bg-gradient-to-br from-violet-950/90 to-violet-900/80
        backdrop-blur-sm shadow-lg
        transition-all duration-200 ${pulseClass}
        ${selected && !isKilled ? 'border-violet-400 shadow-violet-500/30 shadow-xl' : 'border-violet-500/40'}
      `}
    >
      {isKilled && (
        <div className="absolute inset-0 flex items-center justify-center z-10 text-rose-500 pointer-events-none">
          <svg className="w-12 h-12 stroke-rose-500 opacity-90 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
      )}
      {/* Status indicator */}
      <div className="absolute -top-1.5 -right-1.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-gray-900 animate-pulse" />

      <div className="flex items-center gap-2.5">
        <div className="p-1.5 rounded-lg bg-violet-500/20">
          <Globe size={18} className="text-violet-400" />
        </div>
        <div>
          <p className="text-xs font-medium text-violet-300/70 uppercase tracking-wider">Gateway</p>
          <p className="text-sm font-semibold text-white">{(data as any).label || 'API Gateway'}</p>
        </div>
      </div>

      {(data as any).baseLatency != null && (
        <div className="mt-2 flex gap-2 text-xs text-violet-300/60">
          <span>{(data as any).baseLatency}ms</span>
          <span>•</span>
          <span>{(data as any).maxConcurrency || '∞'} conc.</span>
        </div>
      )}

      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-violet-400 !border-2 !border-violet-900"
      />
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-violet-400 !border-2 !border-violet-900"
      />
    </div>
  );
}

export default memo(ApiGatewayNode);
