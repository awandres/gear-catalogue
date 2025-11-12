'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';

export type TimelineEventType = 'session' | 'deposit' | 'deadline' | 'prep' | 'milestone' | 'contract';

export interface TimelineEvent {
  id: string;
  type: TimelineEventType;
  title: string;
  description?: string;
  date: Date;
  completed?: boolean;
  visibleTo: 'admin' | 'client' | 'both';
  priority?: 'low' | 'medium' | 'high';
}

interface ProjectTimelineProps {
  events: TimelineEvent[];
  projectColor: string;
  isAdmin?: boolean;
}

export function ProjectTimeline({ events, projectColor, isAdmin = false }: ProjectTimelineProps) {
  const [viewMode, setViewMode] = useState<'admin' | 'client'>('admin');
  const [isExpanded, setIsExpanded] = useState(false);

  // Filter events based on view mode
  const filteredEvents = events.filter(event => {
    if (viewMode === 'admin') return true; // Admin sees everything
    return event.visibleTo === 'client' || event.visibleTo === 'both';
  });

  // Sort events by date
  const sortedEvents = [...filteredEvents].sort((a, b) => a.date.getTime() - b.date.getTime());
  
  // Show only first 5 unless expanded
  const displayedEvents = isExpanded ? sortedEvents : sortedEvents.slice(0, 5);

  const getEventIcon = (type: TimelineEventType) => {
    switch (type) {
      case 'session':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
          </svg>
        );
      case 'deposit':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'deadline':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'prep':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        );
      case 'milestone':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
        );
      case 'contract':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
    }
  };

  const getEventColor = (type: TimelineEventType) => {
    switch (type) {
      case 'session': return '#8b5cf6'; // purple
      case 'deposit': return '#10b981'; // green
      case 'deadline': return '#f59e0b'; // amber
      case 'prep': return '#3b82f6'; // blue
      case 'milestone': return '#ec4899'; // pink
      case 'contract': return '#6366f1'; // indigo
      default: return projectColor;
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    const dateStr = date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined 
    });
    
    if (diffDays < 0) {
      return { dateStr, relative: `${Math.abs(diffDays)} days ago`, isPast: true };
    } else if (diffDays === 0) {
      return { dateStr, relative: 'Today', isPast: false };
    } else if (diffDays === 1) {
      return { dateStr, relative: 'Tomorrow', isPast: false };
    } else if (diffDays <= 7) {
      return { dateStr, relative: `In ${diffDays} days`, isPast: false };
    } else {
      return { dateStr, relative: `In ${diffDays} days`, isPast: false };
    }
  };

  if (sortedEvents.length === 0) {
    return null;
  }

  return (
    <Card className="mb-6">
      <div className="p-6">
        {/* Header with View Toggle */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div 
              className="p-2 rounded-lg"
              style={{ backgroundColor: `${projectColor}20` }}
            >
              <svg className="w-6 h-6" style={{ color: projectColor }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Project Timeline</h3>
              <p className="text-sm text-gray-600">Upcoming events and deadlines</p>
            </div>
          </div>

          {isAdmin && (
            <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setViewMode('admin')}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  viewMode === 'admin'
                    ? 'text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                style={viewMode === 'admin' ? { backgroundColor: projectColor } : {}}
              >
                Admin View
              </button>
              <button
                onClick={() => setViewMode('client')}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  viewMode === 'client'
                    ? 'text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                style={viewMode === 'client' ? { backgroundColor: projectColor } : {}}
              >
                Client View
              </button>
            </div>
          )}
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Timeline line */}
          <div 
            className="absolute left-6 top-0 bottom-0 w-0.5 md:left-8"
            style={{ backgroundColor: `${projectColor}30` }}
          ></div>

          {/* Events */}
          <div className="space-y-6">
            {displayedEvents.map((event, index) => {
              const { dateStr, relative, isPast } = formatDate(event.date);
              const eventColor = getEventColor(event.type);
              
              return (
                <div key={event.id} className="relative flex gap-4 md:gap-6">
                  {/* Timeline dot */}
                  <div className="relative flex-shrink-0">
                    <div 
                      className={`rounded-full flex items-center justify-center shadow-lg ${
                        event.completed 
                          ? 'w-8 h-8 md:w-10 md:h-10 opacity-50' 
                          : 'w-12 h-12 md:w-14 md:h-14'
                      }`}
                      style={{ 
                        backgroundColor: event.completed ? '#9ca3af' : eventColor,
                        color: 'white'
                      }}
                    >
                      {event.completed ? (
                        <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        getEventIcon(event.type)
                      )}
                    </div>
                  </div>

                  {/* Event content */}
                  <div className={`flex-1 ${event.completed ? 'pb-3' : 'pb-6'}`}>
                    <div 
                      className={`rounded-lg border-l-4 transition-all ${
                        event.completed 
                          ? 'bg-gray-50 p-2' 
                          : 'bg-white hover:shadow-md p-4'
                      }`}
                      style={{ 
                        borderLeftColor: event.completed ? '#d1d5db' : eventColor,
                        boxShadow: event.completed ? 'none' : `0 1px 3px 0 ${eventColor}15`
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className={`${event.completed ? 'text-sm text-gray-500 line-through' : 'font-semibold text-gray-900'}`}>
                            {event.title}
                          </h4>
                          {event.description && !event.completed && (
                            <p className="text-sm mt-1 text-gray-600">
                              {event.description}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          {event.visibleTo === 'admin' && viewMode === 'admin' && !event.completed && (
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs font-semibold rounded-full">
                              Admin Only
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {!event.completed && (
                        <div className="flex items-center gap-4 text-sm mt-2">
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="text-gray-700">{dateStr}</span>
                          </div>
                          <div className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                            {relative}
                          </div>
                        </div>
                      )}
                      
                      {event.completed && (
                        <span className="text-xs text-gray-400 mt-1 inline-block">{dateStr}</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Expand/Collapse button */}
          {sortedEvents.length > 5 && (
            <div className="mt-4 text-center">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="px-4 py-2 text-sm font-medium rounded-lg transition-colors hover:bg-gray-100"
                style={{ color: projectColor }}
              >
                {isExpanded ? (
                  <span className="flex items-center gap-2">
                    Show Less
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Show All {sortedEvents.length} Events
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Legend (Admin view only) */}
        {isAdmin && viewMode === 'admin' && sortedEvents.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs font-semibold text-gray-600 mb-3">Event Types:</p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
              {[
                { type: 'session', label: 'Session' },
                { type: 'deposit', label: 'Payment' },
                { type: 'deadline', label: 'Deadline' },
                { type: 'prep', label: 'Prep Task' },
                { type: 'milestone', label: 'Milestone' },
                { type: 'contract', label: 'Contract' },
              ].map(({ type, label }) => (
                <div key={type} className="flex items-center gap-1.5">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: getEventColor(type as TimelineEventType) }}
                  ></div>
                  <span className="text-xs text-gray-600">{label}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

