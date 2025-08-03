import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronDown, User, Check } from 'lucide-react';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface MultiUserSelectProps {
  users: User[];
  selectedUserIds: string[];
  onSelectionChange: (userIds: string[]) => void;
  placeholder?: string;
  maxDisplayed?: number;
  isLoading?: boolean;
  disabled?: boolean;
}

const MultiUserSelect: React.FC<MultiUserSelectProps> = ({
  users,
  selectedUserIds,
  onSelectionChange,
  placeholder = "Select users...",
  maxDisplayed = 3,
  isLoading = false,
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedUsers = users.filter(user => selectedUserIds.includes(user.id));
  const filteredUsers = users.filter(user => 
    `${user.firstName} ${user.lastName} ${user.email}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleUserToggle = (userId: string) => {
    const newSelection = selectedUserIds.includes(userId)
      ? selectedUserIds.filter(id => id !== userId)
      : [...selectedUserIds, userId];
    
    onSelectionChange(newSelection);
  };

  const handleRemoveUser = (userId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectionChange(selectedUserIds.filter(id => id !== userId));
  };

  const getDisplayText = () => {
    if (selectedUsers.length === 0) return placeholder;
    if (selectedUsers.length === 1) {
      return `${selectedUsers[0].firstName} ${selectedUsers[0].lastName}`;
    }
    if (selectedUsers.length <= maxDisplayed) {
      return selectedUsers.map(user => `${user.firstName} ${user.lastName}`).join(', ');
    }
    return `${selectedUsers.slice(0, maxDisplayed).map(user => `${user.firstName} ${user.lastName}`).join(', ')} +${selectedUsers.length - maxDisplayed} more`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Selected Users Display */}
      <div
        className={`min-h-[42px] p-2 border border-gray-300 rounded-md bg-white cursor-pointer flex items-center justify-between ${
          disabled ? 'bg-gray-50 cursor-not-allowed' : 'hover:border-gray-400'
        } ${isOpen ? 'border-purple-500 ring-1 ring-purple-500' : ''}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        {selectedUsers.length === 0 ? (
          <span className="text-gray-500">{placeholder}</span>
        ) : (
          <div className="flex flex-wrap gap-1 flex-1">
            {selectedUsers.slice(0, maxDisplayed).map(user => (
              <span
                key={user.id}
                className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 text-sm rounded-full"
              >
                <User className="w-3 h-3" />
                {user.firstName} {user.lastName}
                {!disabled && (
                  <button
                    type="button"
                    onClick={(e) => handleRemoveUser(user.id, e)}
                    className="ml-1 hover:bg-purple-200 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </span>
            ))}
            {selectedUsers.length > maxDisplayed && (
              <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
                +{selectedUsers.length - maxDisplayed} more
              </span>
            )}
          </div>
        )}
        
        {!disabled && (
          <ChevronDown
            className={`w-4 h-4 text-gray-400 transition-transform ${
              isOpen ? 'transform rotate-180' : ''
            }`}
          />
        )}
      </div>

      {/* Dropdown */}
      {isOpen && !disabled && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-50 max-h-60 overflow-hidden">
          {/* Search Input */}
          <div className="p-2 border-b border-gray-100">
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-purple-500"
              autoFocus
            />
          </div>

          {/* User List */}
          <div className="max-h-48 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-gray-500">
                Loading users...
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                {searchTerm ? 'No users found' : 'No users available'}
              </div>
            ) : (
              filteredUsers.map(user => {
                const isSelected = selectedUserIds.includes(user.id);
                return (
                  <div
                    key={user.id}
                    className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50 ${
                      isSelected ? 'bg-purple-50' : ''
                    }`}
                    onClick={() => handleUserToggle(user.id)}
                  >
                    <div className={`w-4 h-4 border border-gray-300 rounded flex items-center justify-center ${
                      isSelected ? 'bg-purple-600 border-purple-600' : ''
                    }`}>
                      {isSelected && <Check className="w-3 h-3 text-white" />}
                    </div>
                    
                    <div className="flex items-center gap-2 flex-1">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                        <User className="w-4 h-4 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiUserSelect;
