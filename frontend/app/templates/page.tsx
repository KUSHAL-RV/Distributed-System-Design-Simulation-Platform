'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Filter, LayoutGrid, ArrowLeft, Loader2 } from 'lucide-react';
import api from '@/lib/api';
import { useDesignStore } from '@/store/designStore';
import { TemplateCard } from '@/components/templates/TemplateCard';
import { TemplatePreview } from '@/components/templates/TemplatePreview';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

export default function TemplatesPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState<'All' | 'Beginner' | 'Intermediate' | 'Advanced'>('All');
  const [previewTemplate, setPreviewTemplate] = useState<any | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const { data } = await api.get('/api/templates');
      setTemplates(data.data);
    } catch (err) {
      console.error('Failed to fetch templates:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUseTemplate = async (id: string) => {
    setCreating(true);
    try {
      // Get full template with nodes/edges
      const { data: templateRes } = await api.get(`/api/templates/${id}`);
      const template = templateRes.data;

      // Create new design
      const { data: designRes } = await api.post('/api/designs', {
        name: template.name,
        description: template.description,
        nodes: template.nodes,
        edges: template.edges,
      });

      useDesignStore.getState().resetDesign();
      router.push(`/design/${designRes.data.id}`);
    } catch (err) {
      console.error('Failed to create design from template:', err);
      setCreating(false);
    }
  };

  const handlePreview = async (id: string) => {
    try {
      const { data } = await api.get(`/api/templates/${id}`);
      setPreviewTemplate(data.data);
    } catch (err) {
      console.error('Failed to fetch template preview:', err);
    }
  };

  const filtered = templates.filter((t) => {
    const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase()) || 
                         t.description.toLowerCase().includes(search.toLowerCase());
    const matchesDifficulty = difficulty === 'All' || t.difficulty === difficulty;
    return matchesSearch && matchesDifficulty;
  });

  return (
    <div className="min-h-screen bg-gray-950 text-white pb-20">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-violet-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4 group"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              Back to Dashboard
            </button>
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500">
              Architecture Templates
            </h1>
            <p className="text-gray-400 mt-2 text-lg">
              Jumpstart your system design with industry-standard patterns.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative min-w-[240px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input
                type="text"
                placeholder="Search templates..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all"
              />
            </div>
            
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
              <Filter size={16} className="text-gray-500" />
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as any)}
                className="bg-transparent text-sm text-gray-300 focus:outline-none cursor-pointer"
              >
                <option value="All">All Levels</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
          </div>
        </div>

        {/* Templates Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 size={40} className="text-violet-500 animate-spin" />
            <p className="text-gray-400 animate-pulse">Loading templates gallery...</p>
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onUse={handleUseTemplate}
                onPreview={handlePreview}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="p-4 rounded-full bg-white/5 mb-4">
              <LayoutGrid size={40} className="text-gray-600" />
            </div>
            <h3 className="text-xl font-semibold text-white">No templates found</h3>
            <p className="text-gray-500 mt-1">Try adjusting your search or filters.</p>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      <Modal
        isOpen={!!previewTemplate}
        onClose={() => setPreviewTemplate(null)}
        title={previewTemplate?.name || 'Template Preview'}
      >
        <div className="space-y-6">
          <p className="text-gray-400 text-sm">
            {previewTemplate?.description}
          </p>
          
          <TemplatePreview
            nodes={previewTemplate?.nodes || []}
            edges={previewTemplate?.edges || []}
          />

          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setPreviewTemplate(null)}>
              Close
            </Button>
            <Button
              variant="primary"
              disabled={creating}
              onClick={() => {
                const id = previewTemplate.id;
                setPreviewTemplate(null);
                handleUseTemplate(id);
              }}
            >
              {creating ? (
                <>
                  <Loader2 size={16} className="animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                'Use This Template'
              )}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Global Loading Overlay */}
      {creating && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex flex-col items-center justify-center">
          <Loader2 size={48} className="text-violet-500 animate-spin mb-4" />
          <h2 className="text-xl font-bold text-white">Initializing Workspace</h2>
          <p className="text-gray-400 mt-2">Deploying template nodes to your canvas...</p>
        </div>
      )}
    </div>
  );
}
