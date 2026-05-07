'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Zap, User } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import api from '@/lib/api';

interface SharedDesign {
  id: string;
  name: string;
  description?: string;
  nodes: any[];
  edges: any[];
  createdAt: string;
  updatedAt: string;
  user: { name: string };
}

export default function SharedDesignPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [design, setDesign] = useState<SharedDesign | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDesign = async () => {
      try {
        const { data } = await api.get(`/api/designs/shared/${slug}`);
        if (data.success) {
          setDesign(data.data);
        }
      } catch (err: any) {
        setError(err.response?.data?.error || 'Design not found.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchDesign();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !design) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Design Not Found</h1>
          <p className="text-gray-400">{error || 'This shared design does not exist.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="border-b border-white/5 bg-gray-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
              <Zap size={16} className="text-white" />
            </div>
            <span className="text-lg font-bold text-white">LiveSysDesign</span>
          </div>
          <Badge variant="info">
            <User size={10} className="mr-1" />
            Shared by {design.user.name}
          </Badge>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white">{design.name}</h1>
          {design.description && (
            <p className="text-gray-400 mt-2">{design.description}</p>
          )}
        </div>

        <Card>
          <CardContent>
            <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
              <span>{Array.isArray(design.nodes) ? design.nodes.length : 0} components</span>
              <span>{Array.isArray(design.edges) ? design.edges.length : 0} connections</span>
            </div>
            <div className="h-[500px] rounded-xl bg-gray-950 border border-white/5 flex items-center justify-center">
              <p className="text-gray-500 text-sm">
                Read-only view — interactive canvas available in Phase 3
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
