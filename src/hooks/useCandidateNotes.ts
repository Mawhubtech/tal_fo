import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { candidateNotesApiService, CandidateNote, CreateCandidateNoteDto, UpdateCandidateNoteDto, CandidateNotesQueryDto, CandidateNotesResponse } from '../services/candidateNotesApiService';
import { toast } from '../components/ToastContainer';

// Query keys
export const candidateNotesKeys = {
  all: ['candidateNotes'] as const,
  lists: () => [...candidateNotesKeys.all, 'list'] as const,
  list: (candidateId: string, filters?: CandidateNotesQueryDto) => [...candidateNotesKeys.lists(), candidateId, filters] as const,
  details: () => [...candidateNotesKeys.all, 'detail'] as const,
  detail: (candidateId: string, noteId: string) => [...candidateNotesKeys.details(), candidateId, noteId] as const,
};

/**
 * Hook to fetch notes for a candidate
 */
export const useCandidateNotes = (candidateId: string, query?: CandidateNotesQueryDto) => {
  return useQuery({
    queryKey: candidateNotesKeys.list(candidateId, query),
    queryFn: () => candidateNotesApiService.getNotes(candidateId, query),
    enabled: !!candidateId,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to fetch a specific note
 */
export const useCandidateNote = (candidateId: string, noteId: string) => {
  return useQuery({
    queryKey: candidateNotesKeys.detail(candidateId, noteId),
    queryFn: () => candidateNotesApiService.getNote(candidateId, noteId),
    enabled: !!candidateId && !!noteId,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to create a new note
 */
export const useCreateCandidateNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ candidateId, noteData }: { candidateId: string; noteData: CreateCandidateNoteDto }) =>
      candidateNotesApiService.createNote(candidateId, noteData),
    onSuccess: (newNote: CandidateNote) => {
      // Just invalidate and refetch - this ensures we get the correct server data with proper timestamps
      queryClient.invalidateQueries({
        queryKey: candidateNotesKeys.lists(),
      });

      toast.success('Note added successfully', 'Your note has been added to the candidate.');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to add note';
      toast.error('Failed to add note', message);
    },
  });
};

/**
 * Hook to update a note
 */
export const useUpdateCandidateNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ candidateId, noteId, noteData }: { candidateId: string; noteId: string; noteData: UpdateCandidateNoteDto }) =>
      candidateNotesApiService.updateNote(candidateId, noteId, noteData),
    onSuccess: (updatedNote: CandidateNote) => {
      // Update the specific note in cache
      queryClient.setQueryData<CandidateNote>(
        candidateNotesKeys.detail(updatedNote.candidateId, updatedNote.id),
        updatedNote
      );

      // Update the note in the list cache
      queryClient.setQueryData<CandidateNotesResponse>(
        candidateNotesKeys.list(updatedNote.candidateId),
        (oldData) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            notes: oldData.notes.map(note => 
              note.id === updatedNote.id ? updatedNote : note
            ),
          };
        }
      );

      // Invalidate queries to ensure data consistency
      queryClient.invalidateQueries({
        queryKey: candidateNotesKeys.lists(),
      });

      toast.success('Note updated successfully', 'Your note has been updated.');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to update note';
      toast.error('Failed to update note', message);
    },
  });
};

/**
 * Hook to delete a note
 */
export const useDeleteCandidateNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ candidateId, noteId }: { candidateId: string; noteId: string }) =>
      candidateNotesApiService.deleteNote(candidateId, noteId),
    onSuccess: (_, { candidateId, noteId }) => {
      // Remove the note from the list cache
      queryClient.setQueryData<CandidateNotesResponse>(
        candidateNotesKeys.list(candidateId),
        (oldData) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            notes: oldData.notes.filter(note => note.id !== noteId),
            total: oldData.total - 1,
          };
        }
      );

      // Remove the specific note from cache
      queryClient.removeQueries({
        queryKey: candidateNotesKeys.detail(candidateId, noteId),
      });

      // Invalidate queries to ensure data consistency
      queryClient.invalidateQueries({
        queryKey: candidateNotesKeys.lists(),
      });

      toast.success('Note deleted successfully', 'The note has been removed.');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to delete note';
      toast.error('Failed to delete note', message);
    },
  });
};
