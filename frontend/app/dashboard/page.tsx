'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Zap,
  LogOut,
  Clock,
  Trash2,
  Share2,
  GitBranch,
  LayoutGrid,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import api from '@/lib/api';
import { useDesignStore } from '@/store/designStore';

interface Design {
  id: string;
  name: string;
  description?: string;
  nodes: any[];
  edges: any[];
  isPublic: boolean;
  shareSlug?: string;
  createdAt: string;
  updatedAt: string;
  _count: { simulations: number };
}

export default function DashboardPage() {
  const router = useRouter();
  const [designs, setDesigns] = useState<Design[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newDesignName, setNewDesignName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
      return;
    }
    const userData = localStorage.getItem('user');
    if (userData) setUser(JSON.parse(userData));
    fetchDesigns();
  }, [router]);

  const fetchDesigns = async () => {
    try {
      const { data } = await api.get('/api/designs');
      if (data.success) {
        setDesigns(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch designs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newDesignName.trim()) return;
    setIsCreating(true);
    try {
      const { data } = await api.post('/api/designs', {
        name: newDesignName,
        nodes: [],
        edges: [],
      });
      if (data.success) {
        useDesignStore.getState().resetDesign();
        router.push(`/design/${data.data.id}`);
      }
    } catch (err) {
      console.error('Failed to create design:', err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this design?')) return;
    try {
      await api.delete(`/api/designs/${id}`);
      setDesigns((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      console.error('Failed to delete design:', err);
    }
  };

  const handleLogout = async () => {
    try {
      await api.delete('/api/auth/logout');
    } catch (err) {
      console.error('Logout request failed:', err);
    }
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const getNodeCount = (nodes: any[]) => {
    return Array.isArray(nodes) ? nodes.length : 0;
  };

  const getTimeAgo = (date: string) => {
    const now = new Date();
    const d = new Date(date);
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  return (
    <div className="min-h-screen">
      {/* ─── Nav ─────────────────────────────────── */}
      <nav className="sticky top-0 z-50 border-b border-white/5 bg-gray-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
              <Zap size={16} className="text-white" />
            </div>
            <span className="text-lg font-bold text-white">LiveSysDesign</span>
          </div>
          <div className="flex items-center gap-4">
            {user && (
              <span className="text-sm text-gray-400">
                {user.name}
              </span>
            )}
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut size={16} />
              Logout
            </Button>
          </div>
        </div>
      </nav>

      {/* ─── Content ─────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-bold text-white">Dashboard</h1>
            <p className="text-gray-400 mt-1">
              You have {designs.length} active system architecture{designs.length !== 1 ? 's' : ''}.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button 
              variant="secondary" 
              className="border-white/10 hover:bg-white/5"
              onClick={() => router.push('/templates')}
            >
              <LayoutGrid size={18} className="mr-2" />
              Browse Templates
            </Button>
            <Button 
              variant="primary"
              className="shadow-lg shadow-violet-500/20"
              onClick={() => setShowCreateModal(true)}
            >
              <Plus size={18} className="mr-2" />
              New Design
            </Button>
          </div>
        </div>

        {/* Designs Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-48 rounded-2xl border border-white/5 bg-white/[0.02] animate-pulse"
              />
            ))}
          </div>
        ) : designs.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-violet-500/10 flex items-center justify-center">
              <GitBranch size={28} className="text-violet-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">No designs yet</h3>
            <p className="text-gray-400 mb-6 max-w-sm mx-auto">
              Create your first distributed system design and start simulating.
            </p>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus size={18} />
              Create First Design
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {designs.map((design) => (
              <Card
                key={design.id}
                hover
                onClick={() => router.push(`/design/${design.id}`)}
                className="group"
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-white truncate">
                        {design.name}
                      </h3>
                      {design.description && (
                        <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                          {design.description}
                        </p>
                      )}
                    </div>
                    {design.isPublic && (
                      <Badge variant="info" size="sm">
                        <Share2 size={10} className="mr-1" />
                        Shared
                      </Badge>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                    <span className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      {getNodeCount(design.nodes)} nodes
                    </span>
                    <span>
                      {design._count.simulations} sim{design._count.simulations !== 1 ? 's' : ''}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={10} />
                      {getTimeAgo(design.updatedAt)}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/design/${design.id}`);
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(design.id);
                      }}
                    >
                      <Trash2 size={14} className="text-red-400" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* ─── Create Modal ────────────────────────── */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Design"
      >
        <div className="space-y-4">
          <Input
            label="Design Name"
            placeholder="e.g., Netflix Architecture, E-Commerce Platform"
            value={newDesignName}
            onChange={(e) => setNewDesignName(e.target.value)}
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="secondary"
              onClick={() => setShowCreateModal(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              isLoading={isCreating}
              disabled={!newDesignName.trim()}
            >
              Create Design
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
