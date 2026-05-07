'use client';

import React, { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { List } from 'lucide-react';
import { useSimulationStore } from '../../../store/simulationStore';

function QueueNode({ id, data, selected }: NodeProps) {
  const status = useSimulationStore((state) => state.nodeStats[id]?.status);
  const pulseClass = status ? `sim-pulse-${status}` : '';
  return (
    <div
      className={`
        relative px-4 py-3 rounded-xl border-2 min-w-[160px]
        bg-gradient-to-br from-teal-950/90 to-teal-900/80
        backdrop-blur-sm shadow-lg
        transition-all duration-200 ${pulseClass}
        ${selected ? 'border-teal-400 shadow-teal-500/30 shadow-xl' : 'border-teal-500/40'}
      `}
    >
      <div className="absolute -top-1.5 -right-1.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-gray-900 animate-pulse" />

      <div className="flex items-center gap-2.5">
        <div className="p-1.5 rounded-lg bg-teal-500/20">
          <List size={18} className="text-teal-400" />
        </div>
        <div>
          <p className="text-xs font-medium text-teal-300/70 uppercase tracking-wider">Queue</p>
          <p className="text-sm font-semibold text-white">{(data as any).label || 'Message Queue'}</p>
        </div>
      </div>

      {(data as any).config?.partitions && (
        <div className="mt-2 flex gap-2 text-xs text-teal-300/60">
          <span>{(data as any).config.partitions} partitions</span>
        </div>
      )}

      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-teal-400 !border-2 !border-teal-900" />
      <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-teal-400 !border-2 !border-teal-900" />
    </div>
  );
}

export default memo(QueueNode);
