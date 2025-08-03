import React, { useState } from 'react';
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
  AlertCircle
} from 'lucide-react';
import { calendarApiService, CalendarEvent } from '../services/calendarApiService';

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
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showDateEventsModal, setShowDateEventsModal] = useState(false);
  const [showCreateEventModal, setShowCreateEventModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');

  // Form state for new event
  const [newEvent, setNewEvent] = useState({
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
    isAllDay: false,
    isRecurring: false,
    recurrencePattern: '',
    recurrenceEndDate: '',
    attendeeIds: [] as string[]
  });

  const queryClient = useQueryClient();

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
    },
  });

  // Create event mutation
  const createEventMutation = useMutation({
    mutationFn: (eventData: any) => calendarApiService.createEvent(eventData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar', 'events'] });
      setShowCreateEventModal(false);
      resetNewEventForm();
    },
  });

  // Helper functions for create event form
  const resetNewEventForm = () => {
    setNewEvent({
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
      isAllDay: false,
      isRecurring: false,
      recurrencePattern: '',
      recurrenceEndDate: '',
      attendeeIds: []
    });
  };

  const openCreateEventModal = (date?: Date) => {
    if (date) {
      const dateStr = date.toISOString().split('T')[0];
      // Set default times for new events
      const defaultStartTime = '09:00';
      const defaultEndTime = '10:00';
      
      setNewEvent(prev => ({
        ...prev,
        startDate: dateStr,
        endDate: dateStr,
        startTime: defaultStartTime,
        endTime: defaultEndTime
      }));
    }
    setShowCreateEventModal(true);
  };

  // Handle event creation with proper timezone handling
  // This function ensures that times entered by the user are preserved in their local timezone
  const handleCreateEvent = () => {
    if (!newEvent.title || !newEvent.startDate) return;

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
      title: newEvent.title,
      description: newEvent.description || undefined,
      type: newEvent.type as any,
      priority: newEvent.priority as any,
      startDate: createLocalDateTime(
        newEvent.startDate, 
        newEvent.startTime, 
        newEvent.isAllDay
      ),
      endDate: createLocalDateTime(
        newEvent.endDate || newEvent.startDate, 
        newEvent.endTime, 
        newEvent.isAllDay
      ),
      location: newEvent.location || undefined,
      meetingLink: newEvent.meetingLink || undefined,
      notes: newEvent.notes || undefined,
      isAllDay: newEvent.isAllDay,
      isRecurring: newEvent.isRecurring,
      recurrencePattern: newEvent.recurrencePattern || undefined,
      recurrenceEndDate: newEvent.recurrenceEndDate || undefined,
      attendeeIds: newEvent.attendeeIds.length > 0 ? newEvent.attendeeIds : undefined
    };

    createEventMutation.mutate(eventData);
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
            </div>
          </div>
        </div>

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
                      <div
                        key={event.id}
                        onClick={() => {
                          setSelectedEvent(event);
                          setShowEventModal(true);
                        }}
                        className={`text-xs p-1 rounded text-white truncate cursor-pointer hover:opacity-80 ${getEventTypeColor(event.type)}`}
                      >
                        <span className="mr-1">{getPriorityIndicator(event.priority)}</span>
                        {event.title}
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="text-xs text-gray-500 font-medium">
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
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {selectedEvent.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getEventTypeColor(selectedEvent.type)}`}>
                      {selectedEvent.type}
                    </span>
                    <span className="text-sm text-gray-500">
                      {getPriorityIndicator(selectedEvent.priority)} {selectedEvent.priority} priority
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setShowEventModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              <div className="space-y-3">
                {selectedEvent.description && (
                  <p className="text-gray-700">{selectedEvent.description}</p>
                )}

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  {formatEventTime(selectedEvent)}
                </div>

                {selectedEvent.location && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    {selectedEvent.location}
                  </div>
                )}

                {selectedEvent.meetingLink && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Video className="w-4 h-4" />
                    <a 
                      href={selectedEvent.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Join Meeting
                    </a>
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    selectedEvent.status === 'completed' ? 'bg-green-100 text-green-800' :
                    selectedEvent.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                    selectedEvent.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                    selectedEvent.status === 'no_show' ? 'bg-orange-100 text-orange-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {selectedEvent.status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button
                  onClick={() => {/* TODO: Open edit modal */}}
                  className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => deleteEventMutation.mutate(selectedEvent.id)}
                  disabled={deleteEventMutation.isPending}
                  className="flex items-center gap-2 px-3 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                  {deleteEventMutation.isPending ? 'Deleting...' : 'Delete'}
                </button>
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
                    <div
                      key={event.id}
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

        {/* Create Event Modal */}
        {showCreateEventModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-start justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Create New Event</h3>
                <button
                  onClick={() => setShowCreateEventModal(false)}
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
                    value={newEvent.title}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
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
                    value={newEvent.description}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter event description"
                  />
                </div>

                {/* All Day Toggle */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isAllDay"
                    checked={newEvent.isAllDay}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, isAllDay: e.target.checked }))}
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
                      value={newEvent.startDate}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, startDate: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  {!newEvent.isAllDay && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Start Time
                      </label>
                      <input
                        type="time"
                        value={newEvent.startTime}
                        onChange={(e) => setNewEvent(prev => ({ ...prev, startTime: e.target.value }))}
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
                      value={newEvent.endDate}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, endDate: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  {!newEvent.isAllDay && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        End Time
                      </label>
                      <input
                        type="time"
                        value={newEvent.endTime}
                        onChange={(e) => setNewEvent(prev => ({ ...prev, endTime: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  )}
                </div>

                {!newEvent.isAllDay && (
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
                      value={newEvent.type}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, type: e.target.value }))}
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
                      value={newEvent.priority}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, priority: e.target.value }))}
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
                    value={newEvent.location}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, location: e.target.value }))}
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
                    value={newEvent.meetingLink}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, meetingLink: e.target.value }))}
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
                    value={newEvent.notes}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, notes: e.target.value }))}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Additional notes..."
                  />
                </div>
              </form>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowCreateEventModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateEvent}
                  disabled={createEventMutation.isPending || !newEvent.title || !newEvent.startDate}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createEventMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Create Event
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarPage;
