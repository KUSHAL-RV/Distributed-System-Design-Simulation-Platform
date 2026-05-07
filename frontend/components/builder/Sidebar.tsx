'use client';

import React from 'react';
import { Globe, GitBranch, Box, Database, Zap, List, Search } from 'lucide-react';

const COMPONENT_PALETTE = [
  {
    type: 'apiGateway',
    nodeType: 'API_GATEWAY',
    label: 'API Gateway',
    description: 'Entry point for all client requests',
    icon: Globe,
    color: 'violet',
    defaults: { baseLatency: 10, maxConcurrency: 1000 },
  },
  {
    type: 'loadBalancer',
    nodeType: 'LOAD_BALANCER',
    label: 'Load Balancer',
    description: 'Distributes traffic across services',
    icon: GitBranch,
    color: 'sky',
    defaults: { baseLatency: 5, maxConcurrency: 5000 },
  },
  {
    type: 'service',
    nodeType: 'SERVICE',
    label: 'Service',
    description: 'Backend microservice instance',
    icon: Box,
    color: 'emerald',
    defaults: { baseLatency: 50, maxConcurrency: 100 },
  },
  {
    type: 'database',
    nodeType: 'DATABASE',
    label: 'Database',
    description: 'Persistent data storage (SQL/NoSQL)',
    icon: Database,
    color: 'amber',
    defaults: { baseLatency: 20, maxConcurrency: 50 },
  },
  {
    type: 'cache',
    nodeType: 'CACHE',
    label: 'Cache',
    description: 'In-memory cache (Redis, Memcached)',
    icon: Zap,
    color: 'rose',
    defaults: { baseLatency: 2, maxConcurrency: 500 },
  },
  {
    type: 'queue',
    nodeType: 'QUEUE',
    label: 'Message Queue',
    description: 'Async message broker (Kafka, RabbitMQ)',
    icon: List,
    color: 'teal',
    defaults: { baseLatency: 5, maxConcurrency: 10000 },
  },
];

const colorMap: Record<string, string> = {
  violet: 'from-violet-500/10 to-violet-500/5 border-violet-500/20 hover:border-violet-400/40 hover:shadow-violet-500/10',
  sky: 'from-sky-500/10 to-sky-500/5 border-sky-500/20 hover:border-sky-400/40 hover:shadow-sky-500/10',
  emerald: 'from-emerald-500/10 to-emerald-500/5 border-emerald-500/20 hover:border-emerald-400/40 hover:shadow-emerald-500/10',
  amber: 'from-amber-500/10 to-amber-500/5 border-amber-500/20 hover:border-amber-400/40 hover:shadow-amber-500/10',
  rose: 'from-rose-500/10 to-rose-500/5 border-rose-500/20 hover:border-rose-400/40 hover:shadow-rose-500/10',
  teal: 'from-teal-500/10 to-teal-500/5 border-teal-500/20 hover:border-teal-400/40 hover:shadow-teal-500/10',
};

const iconColorMap: Record<string, string> = {
  violet: 'text-violet-400',
  sky: 'text-sky-400',
  emerald: 'text-emerald-400',
  amber: 'text-amber-400',
  rose: 'text-rose-400',
  teal: 'text-teal-400',
};

export default function Sidebar() {
  const [search, setSearch] = React.useState('');

  const filtered = COMPONENT_PALETTE.filter(
    (c) =>
      c.label.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase())
  );

  const onDragStart = (
    event: React.DragEvent,
    component: (typeof COMPONENT_PALETTE)[0]
  ) => {
    event.dataTransfer.setData('application/reactflow-type', component.type);
    event.dataTransfer.setData('application/reactflow-label', component.label);
    event.dataTransfer.setData('application/reactflow-nodetype', component.nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="w-72 h-full bg-gray-900/95 border-r border-white/5 flex flex-col backdrop-blur-xl">
      {/* Header */}
      <div className="px-4 py-4 border-b border-white/5">
        <h2 className="text-sm font-semibold text-white mb-3">Components</h2>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search components..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-violet-500/50"
          />
        </div>
      </div>

      {/* Component list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {filtered.map((component) => {
          const Icon = component.icon;
          return (
            <div
              key={component.type}
              draggable
              onDragStart={(e) => onDragStart(e, component)}
              className={`
                p-3 rounded-xl border cursor-grab active:cursor-grabbing
                bg-gradient-to-r ${colorMap[component.color]}
                transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5
              `}
            >
              <div className="flex items-center gap-2.5">
                <div className={`p-1.5 rounded-lg bg-black/20`}>
                  <Icon size={16} className={iconColorMap[component.color]} />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">
                    {component.label}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {component.description}
                  </p>
                </div>
              </div>
              <div className="mt-2 flex gap-2 text-xs text-gray-500">
                <span>{component.defaults.baseLatency}ms</span>
                <span>•</span>
                <span>{component.defaults.maxConcurrency} conc.</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer hint */}
      <div className="px-4 py-3 border-t border-white/5">
        <p className="text-xs text-gray-500 text-center">
          Drag components onto the canvas
        </p>
      </div>
    </div>
  );
}
