'use client';

import { useEffect, useState } from 'react';
import { useSimulationStore } from '../../store/simulationStore';
import { useDesignStore } from '../../store/designStore';
import { BrainCircuit, AlertTriangle, Cpu } from 'lucide-react';
import { Card } from '../ui/Card';
import api from '../../lib/api';

export function InsightsPanel({ designId }: { designId: string }) {
  const { isActive, activeSimulationId } = useSimulationStore();
  const { nodes } = useDesignStore();
  const [insights, setInsights] = useState<any[]>([]);

  // Periodically poll AI insights every 3 seconds if active
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isActive && activeSimulationId) {
      interval = setInterval(async () => {
        try {
          const res = await api.get(`/api/designs/${designId}/simulate/insights?simId=${activeSimulationId}`);
          setInsights(res.data.data || []);
        } catch (err) {
          // Silent catch to prevent spamming console if ML engine dies temporarily
        }
      }, 3000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, activeSimulationId, designId]);

  if (!isActive || insights.length === 0) return null;

  return (
    <div className="absolute top-16 right-4 z-50 flex flex-col gap-3 w-80 animate-in slide-in-from-right-4 fade-in duration-300">
      <div className="flex items-center gap-2 bg-zinc-950/80 backdrop-blur border border-indigo-500/30 px-3 py-1.5 rounded-full w-fit shadow-[0_0_15px_rgba(99,102,241,0.2)]">
        <BrainCircuit size={16} className="text-indigo-400 animate-pulse" />
        <span className="text-xs font-semibold text-indigo-100">Live AI Analysis</span>
      </div>

      {insights.map((insight, i) => {
        const node = nodes.find(n => n.id === insight.nodeId);
        return (
          <Card key={i} className="bg-zinc-900/95 backdrop-blur-xl border border-rose-500/30 shadow-xl overflow-hidden">
            <div className="h-1 w-full bg-gradient-to-r from-rose-500 to-amber-500" />
            <div className="p-4 flex flex-col gap-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-bold text-rose-500 flex items-center gap-1.5">
                    <AlertTriangle size={14} />
                    {insight.type} DETECTED
                  </h3>
                  <p className="text-xs text-white mt-1 font-medium bg-zinc-800/50 px-2 py-1 rounded inline-block">
                    Node: {node?.data.label || insight.nodeId}
                  </p>
                </div>
                <div className="bg-rose-500/10 text-rose-400 text-[10px] font-bold px-2 py-0.5 rounded border border-rose-500/20">
                  {Math.round(insight.confidence * 100)}% CONF
                </div>
              </div>
              
              <p className="text-xs text-zinc-400">
                {insight.reason}
              </p>

              <div className="grid grid-cols-2 gap-2 mt-1">
                <div className="bg-zinc-950/50 rounded-lg p-2 border border-white/5">
                  <span className="text-[10px] text-zinc-500 uppercase font-semibold block mb-1">Latency</span>
                  <span className="text-sm text-white font-medium flex items-center gap-1">
                    <Cpu size={12} className="text-amber-500" />
                    {Math.round(insight.avgLatency)}ms
                  </span>
                </div>
                <div className="bg-zinc-950/50 rounded-lg p-2 border border-white/5">
                  <span className="text-[10px] text-zinc-500 uppercase font-semibold block mb-1">Error Rate</span>
                  <span className="text-sm text-white font-medium text-rose-400">
                    {Math.round(insight.errorRate * 100)}%
                  </span>
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
