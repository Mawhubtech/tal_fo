import { useState, useRef, useEffect } from 'react';
import { User } from 'lucide-react';

interface TeamMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
}

interface TeamMemberMentionProps {
  teamMembers: TeamMember[];
  selectedUserIds: string[];
  onUserToggle: (userId: string) => void;
  onUsersChange: (userIds: string[]) => void;
  placeholder?: string;
  className?: string;
}

export function TeamMemberMention({
  teamMembers,
  selectedUserIds,
  onUserToggle,
  onUsersChange,
  placeholder = 'Tag team members...',
  className = '',
}: TeamMemberMentionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter team members based on search
  const filteredMembers = teamMembers.filter((member) => {
    const fullName = `${member.firstName} ${member.lastName}`.toLowerCase();
    const email = member.email.toLowerCase();
    const search = searchTerm.toLowerCase();
    return fullName.includes(search) || email.includes(search);
  });

  // Get selected team members
  const selectedMembers = teamMembers.filter((member) =>
    selectedUserIds.includes(member.id)
  );

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggleMember = (userId: string) => {
    onUserToggle(userId);
  };

  const handleRemoveMember = (userId: string) => {
    const newSelectedIds = selectedUserIds.filter((id) => id !== userId);
    onUsersChange(newSelectedIds);
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setIsOpen(true);
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Selected Members Tags */}
      {selectedMembers.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {selectedMembers.map((member) => (
            <div
              key={member.id}
              className="flex items-center gap-1 px-2 py-1 text-sm bg-blue-100 text-blue-800 rounded-md"
            >
              {member.avatar ? (
                <img
                  src={member.avatar}
                  alt={`${member.firstName} ${member.lastName}`}
                  className="w-5 h-5 rounded-full"
                />
              ) : (
                <div className="flex items-center justify-center w-5 h-5 bg-blue-200 rounded-full">
                  <User className="w-3 h-3" />
                </div>
              )}
              <span>
                {member.firstName} {member.lastName}
              </span>
              <button
                type="button"
                onClick={() => handleRemoveMember(member.id)}
                className="ml-1 text-blue-600 hover:text-blue-800"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input Field */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          onFocus={handleInputFocus}
          placeholder={placeholder}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {filteredMembers.length === 0 ? (
            <div className="px-4 py-3 text-sm text-gray-500 text-center">
              No team members found
            </div>
          ) : (
            <div className="py-1">
              {filteredMembers.map((member) => {
                const isSelected = selectedUserIds.includes(member.id);
                return (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => handleToggleMember(member.id)}
                    className={`w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-50 ${
                      isSelected ? 'bg-blue-50' : ''
                    }`}
                  >
                    {member.avatar ? (
                      <img
                        src={member.avatar}
                        alt={`${member.firstName} ${member.lastName}`}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <div className="flex items-center justify-center w-8 h-8 bg-gray-200 rounded-full">
                        <User className="w-4 h-4 text-gray-600" />
                      </div>
                    )}
                    <div className="flex-1 text-left">
                      <div className="font-medium text-gray-900">
                        {member.firstName} {member.lastName}
                        {isSelected && (
                          <span className="ml-2 text-blue-600">✓</span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        {member.email}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
