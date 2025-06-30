import { useState, useEffect, useCallback } from 'react';
import { pipelineService, Pipeline, CreatePipelineDto } from '../services/pipelineService';

export const usePipelines = () => {
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPipelines = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await pipelineService.getAllPipelines();
      setPipelines(data);
    } catch (err) {
      setError('Failed to load pipelines. Please try again.');
      console.error('Error loading pipelines:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPipelines();
  }, [loadPipelines]);

  const createPipeline = useCallback(async (data: CreatePipelineDto) => {
    try {
      setError(null);
      await pipelineService.createPipeline(data);
      await loadPipelines();
      return true;
    } catch (err) {
      setError('Failed to create pipeline. Please try again.');
      console.error('Error creating pipeline:', err);
      return false;
    }
  }, [loadPipelines]);

  const updatePipeline = useCallback(async (id: string, data: CreatePipelineDto) => {
    try {
      setError(null);
      await pipelineService.updatePipeline(id, data);
      await loadPipelines();
      return true;
    } catch (err) {
      setError('Failed to update pipeline. Please try again.');
      console.error('Error updating pipeline:', err);
      return false;
    }
  }, [loadPipelines]);

  const deletePipeline = useCallback(async (id: string) => {
    try {
      setError(null);
      await pipelineService.deletePipeline(id);
      await loadPipelines();
      return true;
    } catch (err) {
      setError('Failed to delete pipeline. Please try again.');
      console.error('Error deleting pipeline:', err);
      return false;
    }
  }, [loadPipelines]);

  const duplicatePipeline = useCallback(async (id: string) => {
    try {
      setError(null);
      await pipelineService.duplicatePipeline(id);
      await loadPipelines();
      return true;
    } catch (err) {
      setError('Failed to duplicate pipeline. Please try again.');
      console.error('Error duplicating pipeline:', err);
      return false;
    }
  }, [loadPipelines]);

  const createDefaultPipeline = useCallback(async () => {
    try {
      setError(null);
      await pipelineService.createDefaultPipeline();
      await loadPipelines();
      return true;
    } catch (err) {
      setError('Failed to create default pipeline. Please try again.');
      console.error('Error creating default pipeline:', err);
      return false;
    }
  }, [loadPipelines]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    pipelines,
    loading,
    error,
    createPipeline,
    updatePipeline,
    deletePipeline,
    duplicatePipeline,
    createDefaultPipeline,
    refreshPipelines: loadPipelines,
    clearError,
  };
};
