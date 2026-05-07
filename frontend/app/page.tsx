'use client';

import React from 'react';
import Link from 'next/link';
import { Zap, GitBranch, AlertTriangle, BarChart3, Globe, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const FEATURES = [
  {
    icon: Globe,
    title: 'Visual Architecture Builder',
    description: 'Drag-and-drop distributed system components. API gateways, services, databases, caches, queues — all visually connected.',
    color: 'violet',
  },
  {
    icon: Zap,
    title: 'Real-Time Traffic Simulation',
    description: 'Generate thousands of concurrent requests. Watch traffic flow through your system with animated visualizations.',
    color: 'amber',
  },
  {
    icon: AlertTriangle,
    title: 'Failure Injection',
    description: 'Kill services, slow databases, drop packets, create network partitions. See exactly how your system responds.',
    color: 'rose',
  },
  {
    icon: BarChart3,
    title: 'Live Metrics Dashboard',
    description: 'P50/P95/P99 latency, throughput, error rates — all updating in real-time with beautiful charts.',
    color: 'emerald',
  },
  {
    icon: GitBranch,
    title: 'Load Balancer Strategies',
    description: 'Round Robin, Least Connections, Weighted, Random. Configure and compare different algorithms.',
    color: 'sky',
  },
];

const colorClasses: Record<string, { bg: string; text: string; border: string }> = {
  violet: { bg: 'bg-violet-500/10', text: 'text-violet-400', border: 'border-violet-500/20' },
  amber: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
  rose: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20' },
  emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
  sky: { bg: 'bg-sky-500/10', text: 'text-sky-400', border: 'border-sky-500/20' },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* ─── Nav ─────────────────────────────────── */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-gray-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
              <Zap size={16} className="text-white" />
            </div>
            <span className="text-lg font-bold text-white">LiveSysDesign</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">Log In</Button>
            </Link>
            <Link href="/register">
              <Button variant="primary" size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── Hero ────────────────────────────────── */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/15 rounded-full blur-[120px]" />
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-sky-600/10 rounded-full blur-[100px]" />
        </div>

        <div className="relative max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-violet-500/20 bg-violet-500/10 mb-8 animate-slide-up">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-sm text-violet-300">10,000 concurrent simulated requests · &lt;100ms latency</span>
          </div>

          {/* Heading */}
          <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6 animate-slide-up delay-100">
            <span className="text-white">Design, Simulate &</span>
            <br />
            <span className="bg-gradient-to-r from-violet-400 via-indigo-400 to-sky-400 bg-clip-text text-transparent">
              Stress-Test
            </span>
            <span className="text-white"> Distributed Systems</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 animate-slide-up delay-200">
            Stop drawing static diagrams. Build interactive architectures, simulate
            real traffic, inject failures, and observe your system in real time.
          </p>

          {/* CTA */}
          <div className="flex items-center justify-center gap-4 animate-slide-up delay-300">
            <Link href="/register">
              <Button variant="primary" size="lg">
                Start Building Free
                <ArrowRight size={18} />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="secondary" size="lg">
                View Demo
              </Button>
            </Link>
          </div>

          {/* Tech badges */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-12 animate-slide-up delay-400">
            {['Next.js', 'GoLang', 'Kafka', 'Redis', 'PostgreSQL', 'Socket.io'].map((tech) => (
              <span
                key={tech}
                className="px-3 py-1 text-xs font-medium text-gray-400 rounded-full border border-white/5 bg-white/5"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Features ────────────────────────────── */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Everything you need to simulate
              <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent"> real distributed systems</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Go beyond static diagrams. LiveSysDesign gives you the tools to build, test, and understand complex architectures.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((feature, index) => {
              const Icon = feature.icon;
              const colors = colorClasses[feature.color];
              return (
                <div
                  key={feature.title}
                  className={`
                    p-6 rounded-2xl border border-white/5 bg-white/[0.02]
                    hover:bg-white/[0.04] hover:border-white/10
                    transition-all duration-300 hover:-translate-y-1
                    animate-slide-up
                  `}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className={`w-10 h-10 rounded-xl ${colors.bg} flex items-center justify-center mb-4`}>
                    <Icon size={20} className={colors.text} />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── CTA Footer ─────────────────────────── */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="p-12 rounded-3xl border border-white/5 bg-gradient-to-br from-violet-950/50 to-indigo-950/50 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-600/5 to-indigo-600/5" />
            <div className="relative">
              <h2 className="text-3xl font-bold text-white mb-4">Ready to simulate?</h2>
              <p className="text-gray-400 mb-8 max-w-lg mx-auto">
                Start designing your distributed architecture and see it come to life in seconds.
              </p>
              <Link href="/register">
                <Button variant="primary" size="lg">
                  Get Started — It&apos;s Free
                  <ArrowRight size={18} />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Footer ──────────────────────────────── */}
      <footer className="border-t border-white/5 py-8 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
              <Zap size={12} className="text-white" />
            </div>
            <span className="text-sm text-gray-500">LiveSysDesign</span>
          </div>
          <p className="text-sm text-gray-600">Built with Next.js, GoLang, Kafka & Redis</p>
        </div>
      </footer>
    </div>
  );
}
