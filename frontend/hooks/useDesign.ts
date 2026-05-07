'use client';

import { useCallback, useEffect, useRef } from 'react';
import api from '@/lib/api';
import { useDesignStore } from '@/store/designStore';

/**
 * Hook for design CRUD operations with debounced auto-save.
 */
export function useDesign(designId?: string) {
  const {
    nodes,
    edges,
    isDirty,
    designName,
    setDesign,
    setIsSaving,
    markSaved,
  } = useDesignStore();

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ─── Fetch design ──────────────────────────────

  const fetchDesign = useCallback(async (id: string) => {
    try {
      const { data } = await api.get(`/api/designs/${id}`);
      if (data.success) {
        setDesign({
          id: data.data.id,
          name: data.data.name,
          description: data.data.description,
          nodes: data.data.nodes || [],
          edges: data.data.edges || [],
        });
      }
    } catch (err) {
      console.error('[useDesign] Fetch error:', err);
    }
  }, [setDesign]);

  // ─── Save design (immediate) ──────────────────

  const saveDesign = useCallback(async () => {
    const state = useDesignStore.getState();
    if (!state.designId) return;

    setIsSaving(true);
    try {
      await api.put(`/api/designs/${state.designId}`, {
        name: state.designName,
        nodes: state.nodes,
        edges: state.edges,
      });
      markSaved();
    } catch (err) {
      console.error('[useDesign] Save error:', err);
      setIsSaving(false);
    }
  }, [setIsSaving, markSaved]);

  // ─── Debounced auto-save (2s after last change)

  useEffect(() => {
    if (!isDirty) return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      saveDesign();
    }, 2000);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [isDirty, nodes, edges, designName, saveDesign]);

  // ─── Fetch on mount ───────────────────────────

  useEffect(() => {
    if (designId) {
      fetchDesign(designId);
    }
  }, [designId, fetchDesign]);

  // ─── Create design ────────────────────────────

  const createDesign = useCallback(async (name: string) => {
    try {
      const { data } = await api.post('/api/designs', {
        name,
        nodes: [],
        edges: [],
      });
      if (data.success) {
        return data.data;
      }
    } catch (err) {
      console.error('[useDesign] Create error:', err);
    }
    return null;
  }, []);

  // ─── Delete design ────────────────────────────

  const deleteDesign = useCallback(async (id: string) => {
    try {
      const { data } = await api.delete(`/api/designs/${id}`);
      return data.success;
    } catch (err) {
      console.error('[useDesign] Delete error:', err);
      return false;
    }
  }, []);

  // ─── Share design ─────────────────────────────

  const shareDesign = useCallback(async (id: string) => {
    try {
      const { data } = await api.post(`/api/designs/${id}/share`);
      if (data.success) {
        return data.data;
      }
    } catch (err) {
      console.error('[useDesign] Share error:', err);
    }
    return null;
  }, []);

  return {
    fetchDesign,
    saveDesign,
    createDesign,
    deleteDesign,
    shareDesign,
  };
}
