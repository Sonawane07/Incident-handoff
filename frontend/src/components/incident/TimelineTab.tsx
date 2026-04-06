import React, { useState } from 'react';
import { useTimelineEvents, useCreateTimelineEvent } from '../../hooks/useTimeline';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/Textarea';
import { Spinner } from '../ui/Spinner';
import { formatDistanceToNow } from 'date-fns';

interface TimelineTabProps {
  incidentId: string;
}

export const TimelineTab: React.FC<TimelineTabProps> = ({ incidentId }) => {
  const { data: events, isLoading } = useTimelineEvents(incidentId);
  const createMutation = useCreateTimelineEvent(incidentId);
  const [newEvent, setNewEvent] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.trim()) return;

    try {
      await createMutation.mutateAsync({ content: newEvent });
      setNewEvent('');
    } catch (error) {
      console.error('Failed to create timeline event:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Add Event Form */}
      <div className="bg-surface-container-lowest p-6 rounded-lg">
        <h3 className="text-lg font-bold font-headline text-on-surface mb-4">
          Add Timeline Event
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            value={newEvent}
            onChange={(e) => setNewEvent(e.target.value)}
            placeholder="Describe what happened..."
            rows={3}
          />
          <div className="flex justify-end">
            <Button type="submit" disabled={createMutation.isPending || !newEvent.trim()}>
              {createMutation.isPending ? 'Adding...' : 'Add Event'}
            </Button>
          </div>
        </form>
      </div>

      {/* Timeline Events */}
      <div className="space-y-4">
        {events?.map((event, index) => (
          <div
            key={event.id}
            className="relative pl-8 pb-8 border-l-2 border-outline-variant last:border-l-0 last:pb-0"
          >
            {/* Timeline Dot */}
            <div className="absolute left-0 top-0 -translate-x-1/2">
              <div
                className={`w-4 h-4 rounded-full ${
                  event.event_type === 'manual'
                    ? 'bg-primary'
                    : event.event_type === 'webhook'
                    ? 'bg-tertiary'
                    : 'bg-secondary'
                }`}
              />
            </div>

            {/* Event Content */}
            <div className="bg-surface-container-lowest p-4 rounded-lg ml-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-on-surface">
                    {event.created_by?.email || 'System'}
                  </span>
                  {event.event_type !== 'manual' && (
                    <span className="text-xs px-2 py-0.5 rounded bg-surface-container text-on-surface-variant uppercase">
                      {event.event_type}
                    </span>
                  )}
                  {event.source && (
                    <span className="text-xs px-2 py-0.5 rounded bg-tertiary-container text-on-tertiary-fixed-variant">
                      {event.source}
                    </span>
                  )}
                </div>
                <span className="text-xs text-on-surface-variant">
                  {formatDistanceToNow(new Date(event.created_at), { addSuffix: true })}
                </span>
              </div>
              <p className="text-on-surface whitespace-pre-wrap">{event.content}</p>
              {event.is_edited && (
                <span className="text-xs text-on-surface-variant italic mt-2 block">
                  (edited)
                </span>
              )}
            </div>
          </div>
        ))}

        {events?.length === 0 && (
          <div className="text-center py-12 bg-surface-container-low rounded-lg">
            <span className="material-symbols-outlined text-6xl text-on-surface-variant/30">
              timeline
            </span>
            <p className="text-on-surface-variant mt-4">No timeline events yet</p>
            <p className="text-sm text-on-surface-variant/70 mt-2">
              Add the first event to start tracking this incident
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
