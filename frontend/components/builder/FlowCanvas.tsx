'use client';

import React, { useCallback, useRef, useMemo } from 'react';
import {
  ReactFlow,
  Controls,
  MiniMap,
  Background,
  BackgroundVariant,
  addEdge,
  useNodesState,
  useEdgesState,
  type Connection,
  type Edge,
  type Node,
  type NodeTypes,
  ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import {
  ApiGatewayNode,
  LoadBalancerNode,
  ServiceNode,
  DatabaseNode,
  CacheNode,
  QueueNode,
} from './NodeTypes';
import { useDesignStore } from '@/store/designStore';

const nodeTypes: NodeTypes = {
  apiGateway: ApiGatewayNode,
  loadBalancer: LoadBalancerNode,
  service: ServiceNode,
  database: DatabaseNode,
  cache: CacheNode,
  queue: QueueNode,
};

interface FlowCanvasProps {
  onNodeSelect?: (nodeId: string | null) => void;
}

function FlowCanvasInner({ onNodeSelect }: FlowCanvasProps) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { nodes: storeNodes, edges: storeEdges, setNodes: setStoreNodes, setEdges: setStoreEdges, addNode } = useDesignStore();

  const [nodes, setNodes, onNodesChange] = useNodesState(storeNodes as Node[]);
  const [edges, setEdges, onEdgesChange] = useEdgesState(storeEdges as Edge[]);

  // Sync nodes/edges back to store on change
  const handleNodesChange = useCallback(
    (changes: any) => {
      onNodesChange(changes);
      // Debounce sync to store
      setTimeout(() => {
        setStoreNodes(nodes as any);
      }, 100);
    },
    [onNodesChange, nodes, setStoreNodes]
  );

  const handleEdgesChange = useCallback(
    (changes: any) => {
      onEdgesChange(changes);
      setTimeout(() => {
        setStoreEdges(edges as any);
      }, 100);
    },
    [onEdgesChange, edges, setStoreEdges]
  );

  // Connect two nodes
  const onConnect = useCallback(
    (connection: Connection) => {
      const newEdge = {
        ...connection,
        animated: true,
        style: { stroke: '#8b5cf6', strokeWidth: 2 },
      };
      setEdges((eds) => addEdge(newEdge, eds));
      const updatedEdges = addEdge(newEdge as Edge, edges);
      setStoreEdges(updatedEdges as any);
    },
    [setEdges, edges, setStoreEdges]
  );

  // Handle node click for selection
  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      onNodeSelect?.(node.id);
    },
    [onNodeSelect]
  );

  // Handle pane click to deselect
  const onPaneClick = useCallback(() => {
    onNodeSelect?.(null);
  }, [onNodeSelect]);

  const onNodesDelete = useCallback(
    (deleted: Node[]) => {
      const remainingNodes = nodes.filter((n) => !deleted.find((d) => d.id === n.id));
      setStoreNodes(remainingNodes as any);
    },
    [nodes, setStoreNodes]
  );

  const onEdgesDelete = useCallback(
    (deleted: Edge[]) => {
      const remainingEdges = edges.filter((e) => !deleted.find((d) => d.id === e.id));
      setStoreEdges(remainingEdges as any);
    },
    [edges, setStoreEdges]
  );

  // Handle drag & drop from sidebar
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow-type');
      const label = event.dataTransfer.getData('application/reactflow-label');
      const nodeType = event.dataTransfer.getData('application/reactflow-nodetype');

      if (!type) return;

      const bounds = reactFlowWrapper.current?.getBoundingClientRect();
      if (!bounds) return;

      const position = {
        x: event.clientX - bounds.left - 80,
        y: event.clientY - bounds.top - 20,
      };

      const newNode: Node = {
        id: `${type}-${Date.now()}`,
        type,
        position,
        data: {
          label: label || type,
          nodeType: nodeType || 'SERVICE',
          baseLatency: 50,
          maxConcurrency: 100,
          jitterMs: 10,
          errorRate: 0.01,
        },
      };

      setNodes((nds) => [...nds, newNode]);
      addNode(newNode as any);
      onNodeSelect?.(newNode.id);
    },
    [setNodes, addNode, onNodeSelect]
  );

  // Sync store changes to local state
  React.useEffect(() => {
    setNodes(storeNodes as Node[]);
  }, [storeNodes, setNodes]);

  React.useEffect(() => {
    setEdges(storeEdges as Edge[]);
  }, [storeEdges, setEdges]);

  return (
    <div ref={reactFlowWrapper} className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onNodesDelete={onNodesDelete}
        onEdgesDelete={onEdgesDelete}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        onDragOver={onDragOver}
        onDrop={onDrop}
        nodeTypes={nodeTypes}
        fitView
        className="bg-gray-950"
        defaultEdgeOptions={{
          animated: true,
          style: { stroke: '#8b5cf6', strokeWidth: 2 },
        }}
        proOptions={{ hideAttribution: true }}
      >
        <Controls
          className="!bg-gray-900/90 !border-white/10 !rounded-xl !shadow-xl [&>button]:!bg-gray-800 [&>button]:!border-white/10 [&>button]:!text-white [&>button:hover]:!bg-gray-700"
        />
        <MiniMap
          className="!bg-gray-900/90 !border-white/10 !rounded-xl"
          nodeColor="#8b5cf6"
          maskColor="rgb(0, 0, 0, 0.7)"
        />
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

export default function FlowCanvas(props: FlowCanvasProps) {
  return (
    <ReactFlowProvider>
      <FlowCanvasInner {...props} />
    </ReactFlowProvider>
  );
}
