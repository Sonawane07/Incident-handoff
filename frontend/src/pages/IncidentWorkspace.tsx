import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import { useIncident, useUpdateIncidentStatus } from '../hooks/useIncidents';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';
import { TimelineTab } from '../components/incident/TimelineTab';
import { AttachmentsTab } from '../components/incident/AttachmentsTab';
import { CommentsTab } from '../components/incident/CommentsTab';
import { AISummaryTab } from '../components/incident/AISummaryTab';
import type { IncidentStatus } from '../types';

type TabType = 'timeline' | 'attachments' | 'comments' | 'ai-summary';

export const IncidentWorkspace: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<TabType>('timeline');
  const { data: incident, isLoading } = useIncident(id!);
  const updateStatusMutation = useUpdateIncidentStatus();

  const statusTransitions: Record<IncidentStatus, IncidentStatus[]> = {
    detected: ['acknowledged'],
    acknowledged: ['mitigating'],
    mitigating: ['resolved'],
    resolved: ['postmortem'],
    postmortem: [],
  };

  const handleStatusChange = async (newStatus: IncidentStatus) => {
    if (id) {
      await updateStatusMutation.mutateAsync({ id, status: newStatus });
    }
  };

  if (isLoading || !incident) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Spinner size="lg" />
        </div>
      </MainLayout>
    );
  }

  const nextStatuses = statusTransitions[incident.status] || [];

  return (
    <MainLayout>
      <div className="min-h-screen">
        {/* Incident Header */}
        <div className="bg-surface-container-lowest border-b border-outline-variant">
          <div className="max-w-7xl mx-auto px-8 py-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-2">
                  <Badge variant="severity" severity={incident.severity}>
                    {incident.severity}
                  </Badge>
                  <Badge variant="status" status={incident.status}>
                    {incident.status}
                  </Badge>
                </div>
                <h1 className="text-3xl font-bold font-headline text-on-surface mb-2">
                  {incident.title}
                </h1>
                <p className="text-on-surface-variant">
                  {incident.description}
                </p>
                <div className="flex items-center gap-6 mt-4 text-sm text-on-surface-variant">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">person</span>
                    <span>Commander: {incident.commander?.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">schedule</span>
                    <span>Created: {new Date(incident.created_at).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Status Change Dropdown */}
              {nextStatuses.length > 0 && (
                <div className="relative">
                  <select
                    className="px-4 py-2 bg-primary text-on-primary font-bold rounded-lg cursor-pointer"
                    onChange={(e) => handleStatusChange(e.target.value as IncidentStatus)}
                    value=""
                  >
                    <option value="" disabled>Change Status</option>
                    {nextStatuses.map((status) => (
                      <option key={status} value={status}>
                        → {status}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="bg-surface border-b border-outline-variant sticky top-16 z-30">
          <div className="max-w-7xl mx-auto px-8">
            <nav className="flex gap-8">
              {[
                { id: 'timeline', label: 'Timeline', icon: 'timeline' },
                { id: 'attachments', label: 'Attachments', icon: 'attach_file' },
                { id: 'comments', label: 'Comments', icon: 'comment' },
                { id: 'ai-summary', label: 'AI Summary', icon: 'auto_awesome' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`flex items-center gap-2 px-4 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'text-primary border-primary'
                      : 'text-on-surface-variant border-transparent hover:text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="max-w-7xl mx-auto px-8 py-8">
          {activeTab === 'timeline' && <TimelineTab incidentId={id!} />}
          {activeTab === 'attachments' && <AttachmentsTab incidentId={id!} />}
          {activeTab === 'comments' && <CommentsTab incidentId={id!} />}
          {activeTab === 'ai-summary' && <AISummaryTab incidentId={id!} />}
        </div>
      </div>
    </MainLayout>
  );
};
