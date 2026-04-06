import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { env } from '../config/env';
import { supabase } from '../lib/supabase';

export const useIncidentSSE = (incidentId: string) => {
  const queryClient = useQueryClient();
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    const setupSSE = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;

      const url = `${env.api.baseUrl}/incidents/${incidentId}/stream`;
      const eventSource = new EventSource(url);

      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        // Invalidate relevant queries based on event type
        switch (data.type) {
          case 'timeline_event':
            queryClient.invalidateQueries({ queryKey: ['timeline', incidentId] });
            break;
          case 'attachment':
            queryClient.invalidateQueries({ queryKey: ['attachments', incidentId] });
            break;
          case 'comment':
            queryClient.invalidateQueries({ queryKey: ['comments', incidentId] });
            break;
          case 'ai_summary':
            queryClient.invalidateQueries({ queryKey: ['ai-summaries', incidentId] });
            break;
          case 'status_change':
            queryClient.invalidateQueries({ queryKey: ['incident', incidentId] });
            break;
        }
      };

      eventSource.onerror = () => {
        eventSource.close();
      };

      eventSourceRef.current = eventSource;
    };

    setupSSE();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [incidentId, queryClient]);
};
