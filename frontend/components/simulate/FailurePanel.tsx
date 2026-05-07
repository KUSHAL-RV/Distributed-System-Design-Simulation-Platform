'use client';

import { useState } from 'react';
import { useSimulationStore } from '../../store/simulationStore';
import { useDesignStore } from '../../store/designStore';
import { ShieldAlert, ZapOff, Scissors, Snail, CheckCircle2 } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import api from '../../lib/api';

const FAILURE_MODES = [
  { id: 'KILL', label: 'Kill Node', icon: ShieldAlert, color: 'text-rose-500', desc: '100% Error Rate' },
  { id: 'SLOW', label: 'Slow Down', icon: Snail, color: 'text-amber-500', desc: '5x Latency' },
  { id: 'DROP', label: 'Drop Packets', icon: ZapOff, color: 'text-orange-500', desc: '50% Failures' },
  { id: 'PARTITION', label: 'Network Partition', icon: Scissors, color: 'text-indigo-500', desc: 'Absolute Isolation' },
];

export function FailurePanel({ designId }: { designId: string }) {
  const { isActive, activeSimulationId } = useSimulationStore();
  const { nodes } = useDesignStore();
  
  const [targetNode, setTargetNode] = useState<string>('');
  const [activeFailures, setActiveFailures] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  if (!isActive) return null;

  const handleInject = async (type: string) => {
    if (!targetNode || !activeSimulationId) return;
    setLoading(true);
    try {
      await api.post(`/api/designs/${designId}/simulate/inject`, {
        simId: activeSimulationId,
        nodeId: targetNode,
        failureType: type
      });
      setActiveFailures(prev => ({ ...prev, [targetNode]: type }));
    } catch (err) {
      console.error('Failed to inject', err);
    }
    setLoading(false);
  };

  const handleRemove = async (nodeId: string) => {
    if (!activeSimulationId) return;
    setLoading(true);
    try {
      await api.post(`/api/designs/${designId}/simulate/remove`, {
        simId: activeSimulationId,
        nodeId
      });
      setActiveFailures(prev => {
        const next = { ...prev };
        delete next[nodeId];
        return next;
      });
    } catch (err) {
      console.error('Failed to remove failure', err);
    }
    setLoading(false);
  };

  return (
    <div className="w-[300px] border-r border-white/10 bg-zinc-950/40 backdrop-blur-xl h-full p-4 flex flex-col gap-4 overflow-y-auto">
      <div className="flex items-center gap-2 mb-2">
        <ShieldAlert className="text-rose-500" size={20} />
        <h2 className="text-lg font-bold text-white tracking-tight">Chaos Control</h2>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Target Node</label>
        <select 
          className="w-full bg-zinc-900 border border-white/20 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-rose-500/50 cursor-pointer hover:bg-zinc-800 transition-colors"
          value={targetNode}
          onChange={(e) => setTargetNode(e.target.value)}
        >
          <option value="" className="bg-zinc-900">Choose a node to target...</option>
          {nodes.map(n => (
            <option key={n.id} value={n.id} className="bg-zinc-900 py-2">
              {n.data.label || n.type} ({n.id.split('-')[0]})
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 gap-2 mt-2">
        {FAILURE_MODES.map((mode) => (
          <button
            key={mode.id}
            onClick={() => handleInject(mode.id)}
            disabled={!targetNode || loading || activeFailures[targetNode] === mode.id}
            className={`flex items-center text-left p-3 rounded-lg border transition-all duration-200 ${
              !targetNode || activeFailures[targetNode] === mode.id ? 'opacity-50 cursor-not-allowed bg-white/5 border-transparent' : 'bg-white/5 hover:bg-white/10 border-white/10 hover:border-rose-500/50 cursor-pointer'
            }`}
          >
            <mode.icon className={`w-5 h-5 mr-3 ${mode.color}`} />
            <div>
              <div className="text-sm font-semibold text-white">{mode.label}</div>
              <div className="text-xs text-zinc-400">{mode.desc}</div>
            </div>
          </button>
        ))}
      </div>

      {Object.keys(activeFailures).length > 0 && (
        <div className="mt-4 flex flex-col gap-2">
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Active Failures</label>
          {Object.entries(activeFailures).map(([nodeId, type]) => {
            const node = nodes.find(n => n.id === nodeId);
            return (
              <Card key={nodeId} className="p-3 bg-rose-500/10 border border-rose-500/20 flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-white">{node?.data.label || nodeId}</span>
                  <span className="text-xs text-rose-400 font-bold bg-rose-500/20 px-2 py-0.5 rounded uppercase">{type}</span>
                </div>
                <Button variant="secondary" size="sm" onClick={() => handleRemove(nodeId)} disabled={loading} className="w-full text-xs py-1">
                  <CheckCircle2 size={12} className="mr-1 text-emerald-500" />
                  Restore Node
                </Button>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
