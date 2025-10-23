import { useState, useMemo, useCallback } from 'react';
import { Pipeline } from '../services/pipelineService';

export const usePipelineFilters = (pipelines: Pipeline[]) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [visibilityFilter, setVisibilityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const filteredPipelines = useMemo(() => {
    return pipelines.filter(pipeline => {
      const matchesSearch = pipeline.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           pipeline.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesVisibility = visibilityFilter === 'all' || pipeline.visibility === visibilityFilter;
      const matchesStatus = statusFilter === 'all' || pipeline.status === statusFilter;
      const matchesType = typeFilter === 'all' || pipeline.type === typeFilter;
      
      return matchesSearch && matchesVisibility && matchesStatus && matchesType;
    });
  }, [pipelines, searchTerm, visibilityFilter, statusFilter, typeFilter]);

  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setVisibilityFilter('all');
    setStatusFilter('all');
    setTypeFilter('all');
  }, []);

  const hasActiveFilters = useMemo(() => {
    return searchTerm !== '' || visibilityFilter !== 'all' || statusFilter !== 'all' || typeFilter !== 'all';
  }, [searchTerm, visibilityFilter, statusFilter, typeFilter]);

  return {
    searchTerm,
    setSearchTerm,
    visibilityFilter,
    setVisibilityFilter,
    statusFilter,
    setStatusFilter,
    typeFilter,
    setTypeFilter,
    filteredPipelines,
    clearFilters,
    hasActiveFilters,
  };
};
