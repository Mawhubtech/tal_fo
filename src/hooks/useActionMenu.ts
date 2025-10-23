import { useState, useCallback, useEffect } from 'react';

export const useActionMenu = () => {
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);

  const toggleActionMenu = useCallback((id: string) => {
    setActionMenuOpen(current => current === id ? null : id);
  }, []);

  const closeActionMenu = useCallback(() => {
    setActionMenuOpen(null);
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (actionMenuOpen && !(event.target as Element).closest('[data-action-menu]')) {
        closeActionMenu();
      }
    };

    if (actionMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [actionMenuOpen, closeActionMenu]);

  return {
    actionMenuOpen,
    toggleActionMenu,
    closeActionMenu,
    isMenuOpen: (id: string) => actionMenuOpen === id,
  };
};
