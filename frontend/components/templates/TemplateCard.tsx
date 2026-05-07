'use client';

import React from 'react';
import { Layers, CheckCircle2, Play, Eye } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

interface TemplateCardProps {
  template: {
    id: string;
    name: string;
    description: string;
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
    nodeCount: number;
    useCases: string[];
  };
  onUse: (id: string) => void;
  onPreview: (id: string) => void;
}

export function TemplateCard({ template, onUse, onPreview }: TemplateCardProps) {
  const difficultyColor = {
    Beginner: 'success' as const,
    Intermediate: 'warning' as const,
    Advanced: 'danger' as const,
  };

  return (
    <Card className="group relative overflow-hidden flex flex-col h-full hover:border-violet-500/30 transition-all duration-300">
      {/* Glow effect on hover */}
      <div className="absolute -inset-1 bg-gradient-to-r from-violet-600/20 to-indigo-600/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500" />
      
      <div className="relative p-6 flex flex-col h-full space-y-4">
        <div className="flex justify-between items-start">
          <div className="p-2 rounded-lg bg-violet-500/10 text-violet-400">
            <Layers size={20} />
          </div>
          <Badge variant={difficultyColor[template.difficulty]}>
            {template.difficulty}
          </Badge>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white group-hover:text-violet-400 transition-colors">
            {template.name}
          </h3>
          <p className="text-sm text-gray-400 mt-1 line-clamp-2">
            {template.description}
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Layers size={12} />
            {template.nodeCount} Nodes
          </span>
          <span>•</span>
          <span>Arch Template</span>
        </div>

        <div className="flex-1">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Use Cases
          </p>
          <div className="flex flex-wrap gap-1.5">
            {template.useCases.map((uc) => (
              <div
                key={uc}
                className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] text-gray-400"
              >
                <CheckCircle2 size={10} className="text-emerald-500/70" />
                {uc}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onPreview(template.id)}
            className="flex items-center justify-center gap-2"
          >
            <Eye size={14} />
            Preview
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => onUse(template.id)}
            className="flex items-center justify-center gap-2 shadow-lg shadow-violet-500/20"
          >
            <Play size={14} />
            Use
          </Button>
        </div>
      </div>
    </Card>
  );
}
