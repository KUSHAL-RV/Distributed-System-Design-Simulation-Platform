'use client';

import React, { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Zap } from 'lucide-react';
import { useSimulationStore } from '../../../store/simulationStore';

function CacheNode({ id, data, selected }: NodeProps) {
  const status = useSimulationStore((state) => state.nodeStats[id]?.status);
  const pulseClass = status ? `sim-pulse-${status}` : '';
  return (
    <div
      className={`
        relative px-4 py-3 rounded-xl border-2 min-w-[160px]
        bg-gradient-to-br from-rose-950/90 to-rose-900/80
        backdrop-blur-sm shadow-lg
        transition-all duration-200 ${pulseClass}
        ${selected ? 'border-rose-400 shadow-rose-500/30 shadow-xl' : 'border-rose-500/40'}
      `}
    >
      <div className="absolute -top-1.5 -right-1.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-gray-900 animate-pulse" />

      <div className="flex items-center gap-2.5">
        <div className="p-1.5 rounded-lg bg-rose-500/20">
          <Zap size={18} className="text-rose-400" />
        </div>
        <div>
          <p className="text-xs font-medium text-rose-300/70 uppercase tracking-wider">Cache</p>
          <p className="text-sm font-semibold text-white">{(data as any).label || 'Cache'}</p>
        </div>
      </div>

      {(data as any).baseLatency != null && (
        <div className="mt-2 flex gap-2 text-xs text-rose-300/60">
          <span>{(data as any).baseLatency}ms</span>
          {(data as any).config?.ttl && (
            <>
              <span>•</span>
              <span>TTL: {(data as any).config.ttl}s</span>
            </>
          )}
        </div>
      )}

      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-rose-400 !border-2 !border-rose-900" />
      <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-rose-400 !border-2 !border-rose-900" />
    </div>
  );
}

export default memo(CacheNode);
