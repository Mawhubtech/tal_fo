import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, User, Clock, Lock, Users, Flag } from 'lucide-react';
import Button from '../../../components/Button';
import { 
  useCandidateNotes, 
  useCreateCandidateNote, 
  useUpdateCandidateNote, 
  useDeleteCandidateNote,
  useCoreSignalCandidateNotes,
  useCreateCoreSignalCandidateNote
} from '../../../hooks/useCandidateNotes';
import { CandidateNote, CreateCandidateNoteDto, UpdateCandidateNoteDto } from '../../../services/candidateNotesApiService';
import { useAuthContext } from '../../../contexts/AuthContext';
import ConfirmationModal from '../../../components/ConfirmationModal';

interface CandidateNotesProps {
  candidateId?: string;
  candidateName?: string;
  coreSignalId?: string;
  candidateData?: any; // Raw candidate data for creating candidate if needed
  onCandidateCreated?: (candidateId: string) => void;
}

const CandidateNotes: React.FC<CandidateNotesProps> = ({ candidateId, candidateName, coreSignalId, candidateData, onCandidateCreated }) => {
  const { user } = useAuthContext();
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [deleteConfirmNoteId, setDeleteConfirmNoteId] = useState<string | null>(null);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [editNoteContent, setEditNoteContent] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [isImportant, setIsImportant] = useState(false);
  const [localCandidateId, setLocalCandidateId] = useState<string | undefined>(candidateId);

  // Update localCandidateId when candidateId prop changes
  useEffect(() => {
    if (candidateId) {
      setLocalCandidateId(candidateId);
    }
  }, [candidateId]);

  // Use CoreSignal hooks if we have coreSignalId but no candidateId
  const usesCoreSignalFlow = !localCandidateId && !!coreSignalId;

  // Regular candidate notes hooks
  const { 
    data: regularNotesResponse, 
    isLoading: isLoadingRegular, 
    error: errorRegular 
  } = useCandidateNotes(localCandidateId || '');
  
  const createNoteMutation = useCreateCandidateNote();
  const updateNoteMutation = useUpdateCandidateNote();
  const deleteNoteMutation = useDeleteCandidateNote();

  // CoreSignal notes hooks
  const { 
    data: coreSignalNotesResponse, 
    isLoading: isLoadingCoreSignal, 
    error: errorCoreSignal 
  } = useCoreSignalCandidateNotes(coreSignalId);
  
  const createCoreSignalNoteMutation = useCreateCoreSignalCandidateNote();

  // Choose which data to use based on the flow
  const notesResponse = usesCoreSignalFlow ? coreSignalNotesResponse : regularNotesResponse;
  const isLoading = usesCoreSignalFlow ? isLoadingCoreSignal : isLoadingRegular;
  const error = usesCoreSignalFlow ? errorCoreSignal : errorRegular;

  const handleAddNote = async () => {
    if (!newNoteContent.trim()) return;

    try {
      if (usesCoreSignalFlow && coreSignalId) {
        // Use CoreSignal flow - create candidate if needed
        const noteData = {
          content: newNoteContent.trim(),
          isPrivate,
          isImportant,
          candidateData, // Include candidate data for backend to create candidate if needed
        };

        const result = await createCoreSignalNoteMutation.mutateAsync({ 
          coreSignalId, 
          noteData 
        });

        // Update local candidate ID and notify parent
        setLocalCandidateId(result.candidateId);
        if (onCandidateCreated) {
          onCandidateCreated(result.candidateId);
        }
      } else if (localCandidateId) {
        // Use regular flow - candidate already exists
        const noteData: CreateCandidateNoteDto = {
          candidateId: localCandidateId,
          content: newNoteContent.trim(),
          isPrivate,
          isImportant,
        };

        await createNoteMutation.mutateAsync({ candidateId: localCandidateId, noteData });
      }

      // Reset form
      setNewNoteContent('');
      setIsPrivate(false);
      setIsImportant(false);
      setIsAddingNote(false);
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const handleEditNote = (note: CandidateNote) => {
    setEditingNoteId(note.id);
    setEditNoteContent(note.content);
  };

  const handleUpdateNote = async (noteId: string) => {
    if (!editNoteContent.trim()) return;

    const noteData: UpdateCandidateNoteDto = {
      content: editNoteContent.trim(),
    };

    try {
      await updateNoteMutation.mutateAsync({ candidateId, noteId, noteData });
      setEditingNoteId(null);
      setEditNoteContent('');
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      await deleteNoteMutation.mutateAsync({ candidateId, noteId });
      setDeleteConfirmNoteId(null);
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const formatDate = (dateString: string) => {
    // Parse the date string - the backend sends ISO string with UTC timezone
    const date = new Date(dateString);
    const now = new Date();
    
    // Calculate difference in milliseconds
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInSeconds = Math.floor(diffInMs / 1000);

    // Format time in user's local timezone
    const timeOptions: Intl.DateTimeFormatOptions = { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true // Use 12-hour format with AM/PM
    };

    if (diffInSeconds < 10) {
      return 'Just now';
    } else if (diffInSeconds < 60) {
      return `${diffInSeconds} second${diffInSeconds === 1 ? '' : 's'} ago`;
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
    } else if (diffInHours < 24 && date.toDateString() === now.toDateString()) {
      // More precise same-day detection
      return `Today at ${date.toLocaleTimeString(undefined, timeOptions)}`;
    } else if (diffInDays === 1 || (diffInHours < 48 && date.getDate() === now.getDate() - 1)) {
      return `Yesterday at ${date.toLocaleTimeString(undefined, timeOptions)}`;
    } else if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
    } else {
      const dateOptions: Intl.DateTimeFormatOptions = {
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      };
      return date.toLocaleDateString(undefined, dateOptions);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-3"></div>
            <div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="text-center text-red-600">
          <p>Failed to load notes</p>
          <p className="text-sm text-gray-500 mt-1">Please try again later</p>
        </div>
      </div>
    );
  }

  const notes = notesResponse?.notes || [];

  return (
    <div className="space-y-4">
      {/* Add Note Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-gray-900">Candidate Notes</h4>
          {!isAddingNote && (
            <Button 
              variant="primary" 
              size="sm" 
              onClick={() => setIsAddingNote(true)}
              className="text-xs bg-purple-600 text-white border-purple-600 hover:bg-purple-700 hover:border-purple-700"
            >
              <Plus className="w-3 h-3 mr-1" />
              Add Note
            </Button>
          )}
        </div>

        {isAddingNote && (
          <div className="space-y-3">
            <textarea
              value={newNoteContent}
              onChange={(e) => setNewNoteContent(e.target.value)}
              placeholder={`Add a note about ${candidateName || 'this candidate'}...`}
              className="w-full p-3 border border-gray-200 rounded-lg text-sm resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
              rows={3}
              disabled={createNoteMutation.isPending || createCoreSignalNoteMutation.isPending}
            />
            
            {/* Note Options */}
            <div className="flex items-center space-x-4 text-sm">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={isPrivate}
                  onChange={(e) => setIsPrivate(e.target.checked)}
                  className="mr-1.5 text-purple-600 focus:ring-purple-500"
                />
                <Lock className="w-3 h-3 mr-1" />
                Private
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={isImportant}
                  onChange={(e) => setIsImportant(e.target.checked)}
                  className="mr-1.5 text-purple-600 focus:ring-purple-500"
                />
                <Flag className="w-3 h-3 mr-1" />
                Important
              </label>
            </div>

            <div className="flex space-x-2">
              <Button 
                variant="primary" 
                size="sm" 
                onClick={handleAddNote}
                disabled={!newNoteContent.trim() || createNoteMutation.isPending || createCoreSignalNoteMutation.isPending}
                className="bg-purple-600 text-white hover:bg-purple-700"
              >
                {(createNoteMutation.isPending || createCoreSignalNoteMutation.isPending) ? 'Saving...' : 'Save Note'}
              </Button>
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={() => {
                  setIsAddingNote(false);
                  setNewNoteContent('');
                  setIsPrivate(false);
                  setIsImportant(false);
                }}
                disabled={createNoteMutation.isPending || createCoreSignalNoteMutation.isPending}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Notes List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h4 className="font-medium text-gray-900 mb-3">
          Previous Notes {notes.length > 0 && <span className="text-gray-500 font-normal">({notes.length})</span>}
        </h4>
        
        {notes.length === 0 ? (
          <div className="text-sm text-gray-500 text-center py-4">
            <p>No notes added yet.</p>
            <p className="mt-2">Start documenting your interactions and observations about this candidate.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notes.map((note) => (
              <div key={note.id} className="border border-gray-100 rounded-lg p-3 hover:border-gray-200 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <User className="w-3 h-3" />
                    <span>{note.author ? `${note.author.firstName} ${note.author.lastName}` : 'Unknown Author'}</span>
                    <Clock className="w-3 h-3 ml-2" />
                    <span>{formatDate(note.createdAt)}</span>
                    {note.isPrivate && (
                      <>
                        <Lock className="w-3 h-3 ml-2 text-orange-500" />
                        <span className="text-orange-600">Private</span>
                      </>
                    )}
                    {note.isImportant && (
                      <>
                        <Flag className="w-3 h-3 ml-2 text-red-500" />
                        <span className="text-red-600">Important</span>
                      </>
                    )}
                    {note.sharedWithTeam && (
                      <>
                        <Users className="w-3 h-3 ml-2 text-blue-500" />
                        <span className="text-blue-600">{note.sharedWithTeam.name}</span>
                      </>
                    )}
                  </div>
                  
                  {/* Only show edit/delete for own notes */}
                  {note.authorId === user?.id && (
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleEditNote(note)}
                        className="p-1 text-gray-400 hover:text-purple-600 transition-colors"
                        title="Edit note"
                      >
                        <Edit className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmNoteId(note.id)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete note"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>

                {editingNoteId === note.id ? (
                  <div className="space-y-2">
                    <textarea
                      value={editNoteContent}
                      onChange={(e) => setEditNoteContent(e.target.value)}
                      className="w-full p-2 border border-gray-200 rounded text-sm resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                      rows={3}
                      disabled={updateNoteMutation.isPending}
                    />
                    <div className="flex space-x-2">
                      <Button 
                        variant="primary" 
                        size="sm" 
                        onClick={() => handleUpdateNote(note.id)}
                        disabled={!editNoteContent.trim() || updateNoteMutation.isPending}
                        className="text-xs bg-purple-600 text-white hover:bg-purple-700"
                      >
                        {updateNoteMutation.isPending ? 'Saving...' : 'Save'}
                      </Button>
                      <Button 
                        variant="secondary" 
                        size="sm" 
                        onClick={() => {
                          setEditingNoteId(null);
                          setEditNoteContent('');
                        }}
                        disabled={updateNoteMutation.isPending}
                        className="text-xs"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-gray-700 whitespace-pre-wrap">
                    {note.content}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmNoteId && (
        <ConfirmationModal
          isOpen={true}
          onClose={() => setDeleteConfirmNoteId(null)}
          onConfirm={() => handleDeleteNote(deleteConfirmNoteId)}
          title="Delete Note"
          message="Are you sure you want to delete this note? This action cannot be undone."
          confirmText="Delete"
          type="danger"
        />
      )}
    </div>
  );
};

export default CandidateNotes;
