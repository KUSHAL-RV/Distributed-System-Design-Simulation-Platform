'use client';

import React from 'react';
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  ReactFlowProvider,
  type Node,
  type Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  ApiGatewayNode,
  LoadBalancerNode,
  ServiceNode,
  DatabaseNode,
  CacheNode,
  QueueNode,
} from '@/components/builder/NodeTypes';

const nodeTypes = {
  apiGateway: ApiGatewayNode,
  loadBalancer: LoadBalancerNode,
  service: ServiceNode,
  database: DatabaseNode,
  cache: CacheNode,
  queue: QueueNode,
};

interface TemplatePreviewProps {
  nodes: Node[];
  edges: Edge[];
}

function TemplatePreviewInner({ nodes, edges }: TemplatePreviewProps) {
  return (
    <div className="w-full h-[400px] bg-gray-950 rounded-xl overflow-hidden border border-white/10">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes as any}
        fitView
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        panOnDrag={true}
        zoomOnScroll={true}
        proOptions={{ hideAttribution: true }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="#374151"
        />
      </ReactFlow>
    </div>
  );
}

export function TemplatePreview(props: TemplatePreviewProps) {
  return (
    <ReactFlowProvider>
      <TemplatePreviewInner {...props} />
    </ReactFlowProvider>
  );
}
