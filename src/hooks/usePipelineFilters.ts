import { useState, useMemo, useCallback } from 'react';
import { Pipeline } from '../services/pipelineService';

export const usePipelineFilters = (pipelines: Pipeline[]) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [visibilityFilter, setVisibilityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredPipelines = useMemo(() => {
    return pipelines.filter(pipeline => {
      const matchesSearch = pipeline.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           pipeline.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesVisibility = visibilityFilter === 'all' || pipeline.visibility === visibilityFilter;
      const matchesStatus = statusFilter === 'all' || pipeline.status === statusFilter;
      
      return matchesSearch && matchesVisibility && matchesStatus;
    });
  }, [pipelines, searchTerm, visibilityFilter, statusFilter]);

  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setVisibilityFilter('all');
    setStatusFilter('all');
  }, []);

  const hasActiveFilters = useMemo(() => {
    return searchTerm !== '' || visibilityFilter !== 'all' || statusFilter !== 'all';
  }, [searchTerm, visibilityFilter, statusFilter]);

  return {
    searchTerm,
    setSearchTerm,
    visibilityFilter,
    setVisibilityFilter,
    statusFilter,
    setStatusFilter,
    filteredPipelines,
    clearFilters,
    hasActiveFilters,
  };
};
