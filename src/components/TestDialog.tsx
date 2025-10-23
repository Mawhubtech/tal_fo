import React from 'react';

interface TestProps {
  isOpen: boolean;
  onClose: () => void;
}

const TestDialog: React.FC<TestProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div>
      <button onClick={onClose}>Close</button>
    </div>
  );
};

export default TestDialog;
