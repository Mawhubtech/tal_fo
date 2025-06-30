import { useState, useCallback } from 'react';
import { Pipeline } from '../services/pipelineService';

export const usePipelineModal = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPipeline, setSelectedPipeline] = useState<Pipeline | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  const openCreateModal = useCallback(() => {
    setSelectedPipeline(null);
    setShowCreateModal(true);
  }, []);

  const openEditModal = useCallback((pipeline: Pipeline) => {
    setSelectedPipeline(pipeline);
    setShowCreateModal(true);
  }, []);

  const closeModal = useCallback(() => {
    setShowCreateModal(false);
    setSelectedPipeline(null);
    setModalLoading(false);
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setModalLoading(loading);
  }, []);

  return {
    showCreateModal,
    selectedPipeline,
    modalLoading,
    openCreateModal,
    openEditModal,
    closeModal,
    setModalLoading: setLoading,
    isEditing: !!selectedPipeline,
  };
};
