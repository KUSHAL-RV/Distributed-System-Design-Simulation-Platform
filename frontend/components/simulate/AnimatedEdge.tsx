'use client';

import React from 'react';
import { BaseEdge, EdgeProps, getBezierPath } from '@xyflow/react';
import { useSimulationStore } from '../../store/simulationStore';

export function AnimatedEdge({
  source,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
}: EdgeProps) {
  const nodeStats = useSimulationStore((state) => state.nodeStats[source]);
  const isPartitioned = nodeStats?.lastStatusCode === 503;

  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const strokeColor = isPartitioned ? '#ef4444' : '#ffffff40';
  const strokeDasharray = isPartitioned ? '5 5' : 'none';

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={{ ...style, strokeWidth: 2, stroke: strokeColor, strokeDasharray }} />
      {!isPartitioned && (
        <circle r="4" fill="#8b5cf6" className="animate-edge-particle opacity-80" style={{ filter: 'drop-shadow(0 0 4px #8b5cf6)' }}>
          <animateMotion dur="1s" repeatCount="indefinite" path={edgePath} />
        </circle>
      )}
    </>
  );
}
