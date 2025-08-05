import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Calendar, 
  Plus, 
  Filter, 
  Search,
  ChevronLeft, 
  ChevronRight,
  Clock,
  MapPin,
  Users,
  Trash2,
  Edit,
  Video,
  AlertCircle,
  UserPlus,
  Check,
  X,
  Mail,
  HelpCircle,
  RefreshCw
} from 'lucide-react';
import { calendarApiService, CalendarEvent } from '../services/calendarApiService';
import { EventInviteModal } from '../components/calendar/EventInviteModal';
import EventInvitationsManager from '../components/calendar/EventInvitationsManager';
import { useEventInvitations } from '../hooks/useCalendarInvitations';
import { useAuthContext } from '../contexts/AuthContext';
import { GoogleCalendarSync } from '../components/GoogleCalendarSync';
import { InterviewCalendarEvent } from '../components/InterviewCalendarEvent';
import { toast } from '../components/ToastContainer';

/**
 * CalendarPage Component
 * 
 * TIMEZONE HANDLING:
 * - User inputs times in their local timezone
 * - Times are preserved as local times when creating events
 * - Display uses browser's local timezone for consistency
 * - All-day events are handled without time components
 * - Default times: 9:00 AM - 10:00 AM for new events
 */

const CalendarPage: React.FC = () => {
  const { user } = useAuthContext();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showDateEventsModal, setShowDateEventsModal] = useState(false);
  const [showEventFormModal, setShowEventFormModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showInvitationsManager, setShowInvitationsManager] = useState(false);
  const [eventFormMode, setEventFormMode] = useState<'create' | 'edit'>('create');
  const [searchTerm, setSearchTerm] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<CalendarEvent | null>(null);
  const [showGoogleCalendarSync, setShowGoogleCalendarSync] = useState(false);

  // Get event invitations for the selected event
  const { data: eventInvitationsData } = useEventInvitations(selectedEvent?.id || '');

  // Form state for event (used for both create and edit)
  const [eventForm, setEventForm] = useState({
    id: '',
    title: '',
    description: '',
    startDate: '',
    startTime: '09:00', // Default to 9:00 AM
    endDate: '',
    endTime: '10:00', // Default to 10:00 AM (1 hour duration)
    location: '',
    meetingLink: '',
    notes: '',
    type: 'meeting',
    priority: 'medium',
    status: 'scheduled',
    isAllDay: false,
    isRecurring: false,
    recurrencePattern: '',
    recurrenceEndDate: '',
    attendeeIds: [] as string[]
  });

  const queryClient = useQueryClient();

  // Handle Google Calendar OAuth callback
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const calendarConnected = urlParams.get('calendar_connected');
    const error = urlParams.get('error');

    if (calendarConnected === 'true') {
      toast.success('Google Calendar Connected!', 'You can now sync your events with Google Calendar');
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (error) {
      toast.error('Connection Failed', decodeURIComponent(error));
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Fetch calendar events
  const { 
    data: events = [], 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['calendar', 'events', currentDate.getFullYear(), currentDate.getMonth()],
    queryFn: () => calendarApiService.getEvents({
      startDate: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString(),
      endDate: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).toISOString()
    }),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Delete event mutation
  const deleteEventMutation = useMutation({
    mutationFn: (eventId: string) => calendarApiService.deleteEvent(eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar', 'events'] });
      setShowEventModal(false);
      setSelectedEvent(null);
      setSuccessMessage('Event deleted successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    },
    onError: (error: any) => {
      console.error('Failed to delete event:', error);
      const message = error.response?.data?.message || 'Failed to delete event';
      setErrorMessage(message);
      setTimeout(() => setErrorMessage(null), 5000);
    }
  });

  // Create event mutation
  const createEventMutation = useMutation({
    mutationFn: (eventData: any) => calendarApiService.createEvent(eventData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar', 'events'] });
      setShowEventFormModal(false);
      resetEventForm();
      setSuccessMessage('Event created successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    },
    onError: (error: any) => {
      console.error('Failed to create event:', error);
      const message = error.response?.data?.message || 'Failed to create event';
      setErrorMessage(message);
      setTimeout(() => setErrorMessage(null), 5000);
    }
  });

  // Update event mutation
  const updateEventMutation = useMutation({
    mutationFn: ({ eventId, eventData }: { eventId: string; eventData: any }) => 
      calendarApiService.updateEvent(eventId, eventData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar', 'events'] });
      setShowEventFormModal(false);
      setShowEventModal(false);
      setSelectedEvent(null);
      setSuccessMessage('Event updated successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    },
    onError: (error: any) => {
      console.error('Failed to update event:', error);
      const message = error.response?.data?.message || 'Failed to update event';
      setErrorMessage(message);
      setTimeout(() => setErrorMessage(null), 5000);
    }
  });

  // Helper functions for event form
  const resetEventForm = () => {
    setEventForm({
      id: '',
      title: '',
      description: '',
      startDate: '',
      startTime: '09:00', // Default start time
      endDate: '',
      endTime: '10:00', // Default end time (1 hour later)
      location: '',
      meetingLink: '',
      notes: '',
      type: 'meeting',
      priority: 'medium',
      status: 'scheduled',
      isAllDay: false,
      isRecurring: false,
      recurrencePattern: '',
      recurrenceEndDate: '',
      attendeeIds: []
    });
  };

  const openCreateEventModal = (date?: Date) => {
    resetEventForm();
    if (date) {
      const dateStr = date.toISOString().split('T')[0];
      // Set default times for new events
      const defaultStartTime = '09:00';
      const defaultEndTime = '10:00';
      
      setEventForm(prev => ({
        ...prev,
        startDate: dateStr,
        endDate: dateStr,
        startTime: defaultStartTime,
        endTime: defaultEndTime
      }));
    }
    setEventFormMode('create');
    setShowEventFormModal(true);
  };

  const openEditEventModal = (event: CalendarEvent) => {
    // Parse the existing event data for editing
    const startDate = new Date(event.startDate);
    const endDate = new Date(event.endDate);
    
    setEventForm({
      id: event.id,
      title: event.title,
      description: event.description || '',
      startDate: startDate.toISOString().split('T')[0],
      startTime: event.isAllDay ? '' : startDate.toTimeString().slice(0, 5),
      endDate: endDate.toISOString().split('T')[0],
      endTime: event.isAllDay ? '' : endDate.toTimeString().slice(0, 5),
      location: event.location || '',
      meetingLink: event.meetingLink || '',
      notes: event.notes || '',
      type: event.type,
      priority: event.priority,
      status: event.status,
      isAllDay: event.isAllDay,
      isRecurring: event.isRecurring,
      recurrencePattern: event.recurrencePattern || '',
      recurrenceEndDate: event.recurrenceEndDate || '',
      attendeeIds: event.attendees?.map(a => a.id) || []
    });
    
    setEventFormMode('edit');
    setShowEventModal(false);
    setShowEventFormModal(true);
  };

  // Handle event creation with proper timezone handling
  // This function ensures that times entered by the user are preserved in their local timezone
  const handleCreateEvent = () => {
    if (!eventForm.title || !eventForm.startDate) return;

    // Helper function to create proper local datetime
    const createLocalDateTime = (date: string, time?: string, isAllDay?: boolean) => {
      if (isAllDay) {
        // For all-day events, use just the date without time
        return date;
      }
      
      // Ensure we have a valid time
      const validTime = time && time.match(/^\d{2}:\d{2}$/) ? time : '09:00';
      
      // Create a local datetime string in ISO format
      // This approach preserves the user's intended local time
      const localDateTime = new Date(`${date}T${validTime}:00`);
      
      // Convert to ISO string which will be in UTC but represents the correct time
      return localDateTime.toISOString();
    };

    const eventData = {
      title: eventForm.title,
      description: eventForm.description || undefined,
      type: eventForm.type as any,
      priority: eventForm.priority as any,
      startDate: createLocalDateTime(
        eventForm.startDate, 
        eventForm.startTime, 
        eventForm.isAllDay
      ),
      endDate: createLocalDateTime(
        eventForm.endDate || eventForm.startDate, 
        eventForm.endTime, 
        eventForm.isAllDay
      ),
      location: eventForm.location || undefined,
      meetingLink: eventForm.meetingLink || undefined,
      notes: eventForm.notes || undefined,
      isAllDay: eventForm.isAllDay,
      isRecurring: eventForm.isRecurring,
      recurrencePattern: eventForm.recurrencePattern || undefined,
      recurrenceEndDate: eventForm.recurrenceEndDate || undefined,
      attendeeIds: eventForm.attendeeIds.length > 0 ? eventForm.attendeeIds : undefined
    };

    createEventMutation.mutate(eventData);
  };

  // Handle event update with proper timezone handling
  const handleUpdateEvent = () => {
    if (!eventForm.title || !eventForm.startDate) return;

    // Helper function to create proper local datetime
    const createLocalDateTime = (date: string, time?: string, isAllDay?: boolean) => {
      if (isAllDay) {
        // For all-day events, use just the date without time
        return date;
      }
      
      // Ensure we have a valid time
      const validTime = time && time.match(/^\d{2}:\d{2}$/) ? time : '09:00';
      
      // Create a local datetime string in ISO format
      // This approach preserves the user's intended local time
      const localDateTime = new Date(`${date}T${validTime}:00`);
      
      // Convert to ISO string which will be in UTC but represents the correct time
      return localDateTime.toISOString();
    };

    const eventData = {
      title: eventForm.title,
      description: eventForm.description || undefined,
      type: eventForm.type as any,
      priority: eventForm.priority as any,
      status: eventForm.status as any,
      startDate: createLocalDateTime(
        eventForm.startDate, 
        eventForm.startTime, 
        eventForm.isAllDay
      ),
      endDate: createLocalDateTime(
        eventForm.endDate || eventForm.startDate, 
        eventForm.endTime, 
        eventForm.isAllDay
      ),
      location: eventForm.location || undefined,
      meetingLink: eventForm.meetingLink || undefined,
      notes: eventForm.notes || undefined,
      isAllDay: eventForm.isAllDay,
      isRecurring: eventForm.isRecurring,
      recurrencePattern: eventForm.recurrencePattern || undefined,
      recurrenceEndDate: eventForm.recurrenceEndDate || undefined,
      attendeeIds: eventForm.attendeeIds.length > 0 ? eventForm.attendeeIds : undefined
    };

    updateEventMutation.mutate({ eventId: eventForm.id, eventData });
  };

  // Filter events based on search and filters
  const filteredEvents = (Array.isArray(events) ? events : events?.events || []).filter((event: CalendarEvent) => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || event.status === filterStatus;
    const matchesType = filterType === 'all' || event.type === filterType;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  // Navigation functions
  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
      return newDate;
    });
  };

  const navigateToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  // Handle date selection
  const handleDateClick = (date: Date) => {
    console.log('Date clicked:', date);
    setSelectedDate(date);
    const dayEvents = getEventsForDate(date);
    console.log('Events for date:', dayEvents);
    
    // Always show the modal, even if no events
    setShowDateEventsModal(true);
  };

  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    return filteredEvents.filter(event => {
      const eventDate = new Date(event.startDate);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  // Generate calendar grid
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const current = new Date(startDate);
    
    while (current <= lastDay || current.getDay() !== 0) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };

  const calendarDays = generateCalendarDays();

  // Event type colors
  const getEventTypeColor = (type: string) => {
    const colors = {
      interview: 'bg-purple-500',
      meeting: 'bg-purple-600',
      call: 'bg-purple-400',
      review: 'bg-purple-700',
      deadline: 'bg-red-500',
      follow_up: 'bg-purple-300',
      other: 'bg-gray-500'
    };
    return colors[type as keyof typeof colors] || colors.other;
  };

  // Priority indicators
  const getPriorityIndicator = (priority: string) => {
    const indicators = {
      urgent: '🟣',
      high: '�',
      medium: '�',
      low: '�'
    };
    return indicators[priority as keyof typeof indicators] || '🟣';
  };

  const formatEventTime = (event: CalendarEvent) => {
    if (event.isAllDay) return 'All day';
    return calendarApiService.formatEventTime(event);
  };

  // Check if current user is the creator of the event
  const isEventCreator = (event: CalendarEvent) => {
    return user && event.createdBy && user.id === event.createdBy.id;
  };

  // Handle delete confirmation
  const handleDeleteClick = (event: CalendarEvent) => {
    setEventToDelete(event);
    setShowDeleteConfirmation(true);
  };

  const handleConfirmDelete = () => {
    if (eventToDelete) {
      deleteEventMutation.mutate(eventToDelete.id);
      setShowDeleteConfirmation(false);
      setEventToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirmation(false);
    setEventToDelete(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-6 h-6 text-purple-600" />
                <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
              </div>
              
              {/* Navigation */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigateMonth('prev')}
                  className="p-2 text-purple-600 hover:text-purple-900 hover:bg-purple-50 rounded-md"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {!selectedDate && (
                  <button
                    onClick={navigateToToday}
                    className="px-3 py-1 text-sm font-medium text-purple-600 hover:bg-purple-50 rounded-md"
                  >
                    Today
                  </button>
                )}
                {selectedDate && (
                  <button
                    onClick={() => setSelectedDate(null)}
                    className="px-3 py-1 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-md"
                  >
                    Clear Selection
                  </button>
                )}
                <button
                  onClick={() => navigateMonth('next')}
                  className="p-2 text-purple-600 hover:text-purple-900 hover:bg-purple-50 rounded-md"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              
              <div className="text-xl font-semibold text-gray-900">
                {selectedDate ? (
                  selectedDate.toDateString() === new Date().toDateString() 
                    ? currentDate.toLocaleDateString([], { month: 'long', year: 'numeric' })
                    : selectedDate.toLocaleDateString([], { 
                        weekday: 'long', 
                        month: 'long', 
                        day: 'numeric',
                        year: 'numeric' 
                      })
                ) : (
                  currentDate.toLocaleDateString([], { month: 'long', year: 'numeric' })
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* Filters */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="scheduled">Scheduled</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="no_show">No Show</option>
              </select>

              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="interview">Interviews</option>
                <option value="meeting">Meetings</option>
                <option value="review">Reviews</option>
                <option value="deadline">Deadlines</option>
                <option value="personal">Personal</option>
                <option value="other">Other</option>
              </select>

              <button
                onClick={() => openCreateEventModal()}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                <Plus className="w-4 h-4" />
                New Event
              </button>

              <button
                onClick={() => setShowGoogleCalendarSync(true)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                <RefreshCw className="w-4 h-4" />
                Google Sync
              </button>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <Check className="w-5 h-5 text-green-500 mr-2" />
              <p className="text-green-700 font-medium">{successMessage}</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
              <p className="text-red-700 font-medium">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Calendar Grid */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Days of week header */}
          <div className="grid grid-cols-7 border-b border-gray-200">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="p-4 text-center font-semibold text-gray-600">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7">
            {calendarDays.map((date, index) => {
              const isCurrentMonth = date.getMonth() === currentDate.getMonth();
              const isToday = date.toDateString() === new Date().toDateString();
              const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
              const dayEvents = getEventsForDate(date);

              return (
                <div
                  key={index}
                  onClick={() => handleDateClick(date)}
                  className={`min-h-[120px] p-2 border-r border-b border-gray-200 ${
                    !isCurrentMonth ? 'bg-gray-50' : 'bg-white'
                  } hover:bg-gray-50 cursor-pointer ${
                    isSelected ? 'ring-2 ring-purple-500 bg-purple-50' : ''
                  }`}
                >
                  <div className={`text-sm font-medium mb-1 ${
                    isToday && !isSelected ? 'text-blue-600 bg-blue-100 rounded-full w-6 h-6 flex items-center justify-center' :
                    isSelected ? 'text-purple-600 bg-purple-100 rounded-full w-6 h-6 flex items-center justify-center' :
                    isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                  }`}>
                    {date.getDate()}
                  </div>

                  {/* Events for this day */}
                  <div className="space-y-1">
                    {dayEvents.slice(0, 3).map((event) => (
                      <div key={event.id}>
                        {event.type === 'interview' ? (
                          <InterviewCalendarEvent
                            event={event}
                            isCompact={true}
                            onClick={() => {
                              setSelectedEvent(event);
                              setShowEventModal(true);
                            }}
                          />
                        ) : (
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedEvent(event);
                              setShowEventModal(true);
                            }}
                            className={`text-xs p-1 rounded text-white truncate cursor-pointer hover:opacity-80 ${getEventTypeColor(event.type)}`}
                          >
                            <span className="mr-1">{getPriorityIndicator(event.priority)}</span>
                            {event.title}
                          </div>
                        )}
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <div 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDateClick(date);
                        }}
                        className="text-xs text-gray-500 font-medium cursor-pointer hover:text-gray-700"
                      >
                        +{dayEvents.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Loading and Error States */}
        {isLoading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading calendar events...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-8">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <p className="text-red-600">Failed to load calendar events</p>
          </div>
        )}

        {/* Event Detail Modal */}
        {showEventModal && selectedEvent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
            <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {selectedEvent.title}
                  </h3>
                  <div className="flex items-center gap-3 mt-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium text-white ${getEventTypeColor(selectedEvent.type)}`}>
                      {selectedEvent.type}
                    </span>
                    <span className="text-base text-gray-600">
                      {getPriorityIndicator(selectedEvent.priority)} {selectedEvent.priority} priority
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setShowEventModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold p-2 hover:bg-gray-100 rounded-full"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                {selectedEvent.description && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                    <p className="text-gray-700 leading-relaxed">{selectedEvent.description}</p>
                  </div>
                )}

                <div className="flex items-center gap-3 text-base text-gray-600 p-3 bg-blue-50 rounded-lg">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <span className="font-medium">{formatEventTime(selectedEvent)}</span>
                </div>

                {selectedEvent.location && (
                  <div className="flex items-center gap-3 text-base text-gray-600 p-3 bg-green-50 rounded-lg">
                    <MapPin className="w-5 h-5 text-green-600" />
                    <span className="font-medium">{selectedEvent.location}</span>
                  </div>
                )}

                {selectedEvent.meetingLink && (
                  <div className="flex items-center gap-3 text-base text-gray-600 p-3 bg-purple-50 rounded-lg">
                    <Video className="w-5 h-5 text-purple-600" />
                    <a 
                      href={selectedEvent.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-600 hover:text-purple-800 font-medium hover:underline"
                    >
                      Join Meeting
                    </a>
                  </div>
                )}

                <div className="flex items-center gap-3 text-base text-gray-600 p-3 bg-gray-50 rounded-lg">
                  <span className={`px-3 py-2 rounded-full text-sm font-medium ${
                    selectedEvent.status === 'completed' ? 'bg-green-100 text-green-800' :
                    selectedEvent.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                    selectedEvent.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                    selectedEvent.status === 'no_show' ? 'bg-orange-100 text-orange-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {selectedEvent.status.replace('_', ' ')}
                  </span>
                </div>

                {/* Event Participants and Invitations */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3 text-base font-semibold text-gray-800 mb-3">
                    <Users className="w-5 h-5" />
                    Participants
                  </div>
                  
                  {/* Attendees (confirmed participants) */}
                  {selectedEvent.attendees && selectedEvent.attendees.length > 0 && (
                    <div className="mb-3">
                      <div className="text-xs text-gray-500 mb-1">Attendees</div>
                      <div className="space-y-1">
                        {selectedEvent.attendees.map((attendee) => (
                          <div key={attendee.id} className="flex items-center gap-2 text-sm">
                            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                              <Check className="w-3 h-3 text-green-600" />
                            </div>
                            <span className="text-gray-700">
                              {attendee.firstName} {attendee.lastName}
                            </span>
                            <span className="text-gray-500 text-xs">({attendee.email})</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Invitations */}
                  {eventInvitationsData?.invitations && eventInvitationsData.invitations.length > 0 && (
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Invitations</div>
                      <div className="space-y-1">
                        {eventInvitationsData.invitations.map((invitation) => (
                          <div key={invitation.id} className="flex items-center gap-2 text-sm">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                              invitation.status === 'accepted' ? 'bg-green-100' :
                              invitation.status === 'declined' ? 'bg-red-100' :
                              invitation.status === 'maybe' ? 'bg-yellow-100' :
                              'bg-gray-100'
                            }`}>
                              {invitation.status === 'accepted' && <Check className="w-3 h-3 text-green-600" />}
                              {invitation.status === 'declined' && <X className="w-3 h-3 text-red-600" />}
                              {invitation.status === 'maybe' && <HelpCircle className="w-3 h-3 text-yellow-600" />}
                              {invitation.status === 'pending' && <Mail className="w-3 h-3 text-gray-600" />}
                            </div>
                            <span className="text-gray-700">
                              {invitation.inviteeName || invitation.inviteeEmail}
                            </span>
                            {invitation.inviteeName && (
                              <span className="text-gray-500 text-xs">({invitation.inviteeEmail})</span>
                            )}
                            <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${
                              invitation.status === 'accepted' ? 'bg-green-100 text-green-700' :
                              invitation.status === 'declined' ? 'bg-red-100 text-red-700' :
                              invitation.status === 'maybe' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {invitation.status}
                            </span>
                            {invitation.isExternal && (
                              <span className="px-1.5 py-0.5 rounded-full text-xs bg-blue-100 text-blue-700">
                                External
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {(!selectedEvent.attendees || selectedEvent.attendees.length === 0) && 
                   (!eventInvitationsData?.invitations || eventInvitationsData.invitations.length === 0) && (
                    <div className="text-sm text-gray-500 italic">
                      No participants yet. Click "Invite" to add people to this event.
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
                {isEventCreator(selectedEvent) && (
                  <>
                    <button
                      onClick={() => {
                        setShowInviteModal(true);
                      }}
                      className="flex items-center gap-2 px-4 py-3 text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded-lg font-medium transition-colors"
                    >
                      <UserPlus className="w-5 h-5" />
                      Invite
                    </button>
                    {eventInvitationsData?.invitations && eventInvitationsData.invitations.length > 0 && (
                      <button
                        onClick={() => setShowInvitationsManager(true)}
                        className="flex items-center gap-2 px-4 py-3 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg font-medium transition-colors"
                      >
                        <Users className="w-5 h-5" />
                        Manage
                      </button>
                    )}
                    <button
                      onClick={() => openEditEventModal(selectedEvent)}
                      className="flex items-center gap-2 px-4 py-3 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                    >
                      <Edit className="w-5 h-5" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteClick(selectedEvent)}
                      disabled={deleteEventMutation.isPending}
                      className="flex items-center gap-2 px-4 py-3 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg font-medium transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="w-5 h-5" />
                      {deleteEventMutation.isPending ? 'Deleting...' : 'Delete'}
                    </button>
                  </>
                )}
                {!isEventCreator(selectedEvent) && (
                  <div className="text-base text-gray-500 italic p-4 bg-gray-50 rounded-lg">
                    Only the event creator can manage this event
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Date Events Modal */}
        {showDateEventsModal && selectedDate && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Events for {selectedDate.toLocaleDateString([], { 
                      weekday: 'long', 
                      month: 'long', 
                      day: 'numeric',
                      year: 'numeric' 
                    })}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {getEventsForDate(selectedDate).length} event(s)
                  </p>
                </div>
                <button
                  onClick={() => setShowDateEventsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              <div className="space-y-3">
                {getEventsForDate(selectedDate).length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No events scheduled for this date</p>
                  </div>
                ) : (
                  getEventsForDate(selectedDate).map((event) => (
                    <div key={event.id}>
                      {event.type === 'interview' ? (
                        <InterviewCalendarEvent
                          event={event}
                          isCompact={false}
                          onClick={() => {
                            setSelectedEvent(event);
                            setShowDateEventsModal(false);
                            setShowEventModal(true);
                          }}
                        />
                      ) : (
                        <div
                          onClick={() => {
                            setSelectedEvent(event);
                            setShowDateEventsModal(false);
                            setShowEventModal(true);
                          }}
                          className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 cursor-pointer transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-medium text-gray-900">{event.title}</h4>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getEventTypeColor(event.type)}`}>
                                  {event.type}
                                </span>
                                <span className="text-sm">
                                  {getPriorityIndicator(event.priority)}
                                </span>
                              </div>
                              
                              {event.description && (
                                <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                                  {event.description}
                                </p>
                              )}
                              
                              <div className="flex items-center gap-4 text-xs text-gray-500">
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {formatEventTime(event)}
                                </div>
                                
                                {event.location && (
                                  <div className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    {event.location}
                                  </div>
                                )}
                                
                                {event.meetingLink && (
                                  <div className="flex items-center gap-1">
                                    <Video className="w-3 h-3" />
                                    Online Meeting
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="ml-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                event.status === 'completed' ? 'bg-green-100 text-green-800' :
                                event.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                event.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                                event.status === 'no_show' ? 'bg-orange-100 text-orange-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {event.status.replace('_', ' ')}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button
                  onClick={() => setShowDateEventsModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowDateEventsModal(false);
                    openCreateEventModal(selectedDate);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                >
                  <Plus className="w-4 h-4" />
                  Add Event
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Event Form Modal (Create/Edit) */}
        {showEventFormModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-start justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  {eventFormMode === 'create' ? 'Create New Event' : 'Edit Event'}
                </h3>
                <button
                  onClick={() => setShowEventFormModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              <form className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Event Title *
                  </label>
                  <input
                    type="text"
                    value={eventForm.title}
                    onChange={(e) => setEventForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter event title"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={eventForm.description}
                    onChange={(e) => setEventForm(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter event description"
                  />
                </div>

                {/* Status (only show in edit mode) */}
                {eventFormMode === 'edit' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={eventForm.status}
                      onChange={(e) => setEventForm(prev => ({ ...prev, status: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="scheduled">Scheduled</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="no_show">No Show</option>
                    </select>
                  </div>
                )}

                {/* All Day Toggle */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isAllDay"
                    checked={eventForm.isAllDay}
                    onChange={(e) => setEventForm(prev => ({ ...prev, isAllDay: e.target.checked }))}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <label htmlFor="isAllDay" className="ml-2 text-sm text-gray-700">
                    All day event
                  </label>
                </div>

                {/* Date and Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date *
                    </label>
                    <input
                      type="date"
                      value={eventForm.startDate}
                      onChange={(e) => setEventForm(prev => ({ ...prev, startDate: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  {!eventForm.isAllDay && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Start Time
                      </label>
                      <input
                        type="time"
                        value={eventForm.startTime}
                        onChange={(e) => setEventForm(prev => ({ ...prev, startTime: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={eventForm.endDate}
                      onChange={(e) => setEventForm(prev => ({ ...prev, endDate: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  {!eventForm.isAllDay && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        End Time
                      </label>
                      <input
                        type="time"
                        value={eventForm.endTime}
                        onChange={(e) => setEventForm(prev => ({ ...prev, endTime: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  )}
                </div>

                {!eventForm.isAllDay && (
                  <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <span className="font-medium text-blue-800">Timezone Note:</span>
                    </div>
                    <p className="mt-1">Times are in your local timezone ({Intl.DateTimeFormat().resolvedOptions().timeZone})</p>
                  </div>
                )}

                {/* Type and Priority */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Event Type
                    </label>
                    <select
                      value={eventForm.type}
                      onChange={(e) => setEventForm(prev => ({ ...prev, type: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="meeting">Meeting</option>
                      <option value="interview">Interview</option>
                      <option value="call">Call</option>
                      <option value="review">Review</option>
                      <option value="deadline">Deadline</option>
                      <option value="follow_up">Follow Up</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Priority
                    </label>
                    <select
                      value={eventForm.priority}
                      onChange={(e) => setEventForm(prev => ({ ...prev, priority: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={eventForm.location}
                    onChange={(e) => setEventForm(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter location or address"
                  />
                </div>

                {/* Meeting Link */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Meeting Link
                  </label>
                  <input
                    type="url"
                    value={eventForm.meetingLink}
                    onChange={(e) => setEventForm(prev => ({ ...prev, meetingLink: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="https://..."
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={eventForm.notes}
                    onChange={(e) => setEventForm(prev => ({ ...prev, notes: e.target.value }))}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Additional notes..."
                  />
                </div>
              </form>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowEventFormModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={eventFormMode === 'create' ? handleCreateEvent : handleUpdateEvent}
                  disabled={(eventFormMode === 'create' ? createEventMutation.isPending : updateEventMutation.isPending) || !eventForm.title || !eventForm.startDate}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {(eventFormMode === 'create' ? createEventMutation.isPending : updateEventMutation.isPending) ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      {eventFormMode === 'create' ? 'Creating...' : 'Updating...'}
                    </>
                  ) : (
                    <>
                      {eventFormMode === 'create' ? <Plus className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
                      {eventFormMode === 'create' ? 'Create Event' : 'Update Event'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Event Invite Modal */}
        {showInviteModal && selectedEvent && (
          <EventInviteModal
            isOpen={showInviteModal}
            onClose={() => setShowInviteModal(false)}
            event={selectedEvent}
          />
        )}

        {/* Event Invitations Manager Modal */}
        {showInvitationsManager && selectedEvent && (
          <EventInvitationsManager
            isOpen={showInvitationsManager}
            onClose={() => setShowInvitationsManager(false)}
            event={selectedEvent}
          />
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirmation && eventToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000]">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Delete Event</h3>
                  <p className="text-sm text-gray-600">This action cannot be undone</p>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-gray-700">
                  Are you sure you want to delete <strong>"{eventToDelete.title}"</strong>?
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  This will permanently remove the event and all associated invitations.
                </p>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={handleCancelDelete}
                  disabled={deleteEventMutation.isPending}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={deleteEventMutation.isPending}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                  {deleteEventMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Delete Event
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Google Calendar Sync Modal */}
        <GoogleCalendarSync
          isOpen={showGoogleCalendarSync}
          onClose={() => setShowGoogleCalendarSync(false)}
          onSyncComplete={(result) => {
            // Refresh calendar events after sync
            queryClient.invalidateQueries({
              queryKey: ['calendar', 'events']
            });
            console.log('Sync completed:', result);
          }}
        />
      </div>
    </div>
  );
};

export default CalendarPage;
