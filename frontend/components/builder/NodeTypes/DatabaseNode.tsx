'use client';

import React, { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Database } from 'lucide-react';
import { useSimulationStore } from '../../../store/simulationStore';

function DatabaseNode({ id, data, selected }: NodeProps) {
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
        bg-gradient-to-br from-amber-950/90 to-amber-900/80
        backdrop-blur-sm shadow-lg
        transition-all duration-200 ${pulseClass}
        ${selected && !isKilled ? 'border-amber-400 shadow-amber-500/30 shadow-xl' : 'border-amber-500/40'}
      `}
    >
      {isKilled && (
        <div className="absolute inset-0 flex items-center justify-center z-10 text-rose-500 pointer-events-none">
          <svg className="w-12 h-12 stroke-rose-500 opacity-90 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
      )}
      <div className="absolute -top-1.5 -right-1.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-gray-900 animate-pulse" />

      <div className="flex items-center gap-2.5">
        <div className="p-1.5 rounded-lg bg-amber-500/20">
          <Database size={18} className="text-amber-400" />
        </div>
        <div>
          <p className="text-xs font-medium text-amber-300/70 uppercase tracking-wider">Database</p>
          <p className="text-sm font-semibold text-white">{(data as any).label || 'Database'}</p>
        </div>
      </div>

      {(data as any).baseLatency != null && (
        <div className="mt-2 flex gap-2 text-xs text-amber-300/60">
          <span>{(data as any).baseLatency}ms</span>
          {(data as any).config?.dbType && (
            <>
              <span>•</span>
              <span>{(data as any).config.dbType}</span>
            </>
          )}
        </div>
      )}

      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-amber-400 !border-2 !border-amber-900" />
      <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-amber-400 !border-2 !border-amber-900" />
    </div>
  );
}

export default memo(DatabaseNode);
