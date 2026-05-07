'use client';

import { useSimulationStore } from '../../store/simulationStore';
import { Card } from '../ui/Card';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';

export function MetricsDashboard() {
  const { isActive, globalSeries, nodeStats } = useSimulationStore();

  if (!isActive && globalSeries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-zinc-500 p-8 text-center gap-4">
        <div className="w-12 h-12 rounded-full border-2 border-zinc-800 border-t-indigo-500 animate-spin" />
        <p className="text-sm font-medium">Establishing connection to simulation engine...</p>
        <p className="text-xs text-zinc-600">Real-time metrics will appear here once the simulation starts processing traffic.</p>
      </div>
    );
  }

  // Calculate aggregates
  const activeNodes = Object.keys(nodeStats).length;
  const currentRPS = globalSeries.length > 0 ? globalSeries[globalSeries.length - 1].rps : 0;
  const currentErrors = globalSeries.length > 0 ? globalSeries[globalSeries.length - 1].errors : 0;

  return (
    <div className="flex flex-col gap-4 p-4 h-full overflow-y-auto w-[400px] border-l border-white/10 bg-zinc-950/40 backdrop-blur-xl">
      <h2 className="text-xl font-semibold tracking-tight text-white mb-2">Live Telemetry</h2>
      
      {/* Top Stats Row */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="p-4 flex flex-col glass-card border border-indigo-500/20">
          <span className="text-xs text-zinc-400 uppercase font-semibold">Throughput</span>
          <span className="text-2xl font-bold text-white">{currentRPS} <span className="text-sm text-zinc-500 font-normal">rps</span></span>
        </Card>
        <Card className="p-4 flex flex-col glass-card border border-rose-500/20">
          <span className="text-xs text-zinc-400 uppercase font-semibold">Active Errors</span>
          <span className="text-2xl font-bold text-rose-400">{currentErrors} <span className="text-sm text-zinc-500 font-normal">/sec</span></span>
        </Card>
      </div>

      {/* Latency History */}
      <Card className="p-4 flex flex-col glass-card mt-2">
        <h3 className="text-sm font-medium text-zinc-300 mb-4">Global Latency (ms)</h3>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={globalSeries}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
              <XAxis dataKey="time" stroke="#ffffff40" fontSize={10} tickMargin={8} minTickGap={20} />
              <YAxis stroke="#ffffff40" fontSize={10} width={30} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#09090b', border: '1px solid #ffffff20', borderRadius: '8px' }}
                itemStyle={{ color: '#e4e4e7' }}
              />
              <Line type="linear" dataKey="p50" stroke="#10b981" strokeWidth={2} dot={false} name="P50" isAnimationActive={false} />
              <Line type="linear" dataKey="p99" stroke="#f59e0b" strokeWidth={2} dot={false} name="P99" isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Traffic History */}
      <Card className="p-4 flex flex-col glass-card">
        <h3 className="text-sm font-medium text-zinc-300 mb-4">Throughput (RPS)</h3>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={globalSeries}>
              <defs>
                <linearGradient id="colorRps" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
              <XAxis dataKey="time" stroke="#ffffff40" fontSize={10} minTickGap={20} />
              <YAxis stroke="#ffffff40" fontSize={10} width={30} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#09090b', border: '1px solid #ffffff20', borderRadius: '8px' }}
              />
              <Area type="linear" dataKey="rps" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorRps)" name="Requests" isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
      
      {/* Active Node Stats List */}
      <Card className="p-4 glass-card mt-2">
        <h3 className="text-sm font-medium text-zinc-300 mb-3">Nodes Tracking ({activeNodes})</h3>
        <div className="flex flex-col gap-2 max-h-40 overflow-y-auto">
          {Object.entries(nodeStats).map(([id, stats]) => (
            <div key={id} className="flex items-center justify-between p-2 rounded bg-white/5 border border-white/5 text-sm">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  stats.status === 'healthy' ? 'bg-emerald-500' :
                  stats.status === 'warning' ? 'bg-amber-500' : 'bg-rose-500'
                }`} />
                <span className="text-zinc-300 truncate max-w-[120px]" title={id}>{id.split('-')[0]}</span>
              </div>
              <div className="flex gap-3 text-xs">
                <span className="text-zinc-400">P95: <span className="text-white">{stats.latencyP95}ms</span></span>
                <span className="text-zinc-400">Err: <span className={stats.errorRate > 0 ? 'text-rose-400' : 'text-white'}>{(stats.errorRate * 100).toFixed(1)}%</span></span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
