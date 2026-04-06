import React, { useState } from 'react';
import { MainLayout } from '../components/layout/MainLayout';
import { useIncidents, useCreateIncident } from '../hooks/useIncidents';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Spinner } from '../components/ui/Spinner';
import { Link } from 'react-router-dom';
import type { IncidentSeverity, IncidentStatus } from '../types';
import { formatDistanceToNow } from 'date-fns';

export const IncidentList: React.FC = () => {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<IncidentStatus | undefined>();
  const [severityFilter, setSeverityFilter] = useState<string | undefined>();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  const { data, isLoading } = useIncidents(page, 20, {
    status: statusFilter,
    severity: severityFilter,
  });
  
  const createMutation = useCreateIncident();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    severity: 'SEV2' as IncidentSeverity,
  });

  const handleCreateIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMutation.mutateAsync(formData);
      setIsCreateModalOpen(false);
      setFormData({ title: '', description: '', severity: 'SEV2' });
    } catch (error) {
      console.error('Failed to create incident:', error);
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Spinner size="lg" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <section className="p-8 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-4xl font-extrabold font-headline tracking-tight text-on-surface">
              Incidents
            </h2>
            <p className="text-on-surface-variant font-medium mt-1">
              Manage and track all system incidents
            </p>
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <span className="material-symbols-outlined text-sm">add</span>
            New Incident
          </Button>
        </div>

        {/* Filters */}
        <div className="flex gap-4 items-center bg-surface-container-lowest p-4 rounded-lg">
          <div className="flex-1">
            <label className="text-sm font-medium text-on-surface-variant mb-2 block">
              Status
            </label>
            <select
              className="w-full px-4 py-2 bg-surface-container-low rounded border-outline-variant"
              value={statusFilter || ''}
              onChange={(e) => setStatusFilter(e.target.value as IncidentStatus || undefined)}
            >
              <option value="">All Statuses</option>
              <option value="detected">Detected</option>
              <option value="acknowledged">Acknowledged</option>
              <option value="mitigating">Mitigating</option>
              <option value="resolved">Resolved</option>
              <option value="postmortem">Postmortem</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="text-sm font-medium text-on-surface-variant mb-2 block">
              Severity
            </label>
            <select
              className="w-full px-4 py-2 bg-surface-container-low rounded border-outline-variant"
              value={severityFilter || ''}
              onChange={(e) => setSeverityFilter(e.target.value || undefined)}
            >
              <option value="">All Severities</option>
              <option value="SEV1">SEV1 - Critical</option>
              <option value="SEV2">SEV2 - High</option>
              <option value="SEV3">SEV3 - Medium</option>
              <option value="SEV4">SEV4 - Low</option>
            </select>
          </div>
        </div>

        {/* Incidents Table */}
        <div className="bg-surface-container-lowest rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-surface-container-high">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                  Incident
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                  Severity
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                  Commander
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                  Created
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {data?.data.map((incident) => (
                <tr
                  key={incident.id}
                  className="hover:bg-surface-container transition-colors cursor-pointer"
                >
                  <td className="px-6 py-4">
                    <Link
                      to={`/incidents/${incident.id}`}
                      className="font-medium text-on-surface hover:text-primary"
                    >
                      {incident.title}
                    </Link>
                    <p className="text-sm text-on-surface-variant mt-1 line-clamp-1">
                      {incident.description}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="severity" severity={incident.severity}>
                      {incident.severity}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="status" status={incident.status}>
                      {incident.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-sm text-on-surface">
                    {incident.commander?.email || 'Unknown'}
                  </td>
                  <td className="px-6 py-4 text-sm text-on-surface-variant">
                    {formatDistanceToNow(new Date(incident.created_at), { addSuffix: true })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {data?.data.length === 0 && (
            <div className="text-center py-12">
              <span className="material-symbols-outlined text-6xl text-on-surface-variant/30">
                inbox
              </span>
              <p className="text-on-surface-variant mt-4">No incidents found</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {data && data.total_pages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-on-surface-variant">
              Showing {((page - 1) * 20) + 1} to {Math.min(page * 20, data.total)} of {data.total} incidents
            </p>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPage(p => Math.min(data.total_pages, p + 1))}
                disabled={page === data.total_pages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </section>

      {/* Create Incident Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Incident"
        size="lg"
      >
        <form onSubmit={handleCreateIncident} className="space-y-6">
          <Input
            label="Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Brief description of the incident"
            required
          />

          <Textarea
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Detailed information about the incident..."
            rows={4}
            required
          />

          <div>
            <label className="block text-sm font-medium text-on-surface mb-2">
              Severity
            </label>
            <select
              className="w-full px-4 py-2 bg-surface-container-low border-b-2 border-outline-variant focus:border-primary focus:outline-none transition-colors rounded"
              value={formData.severity}
              onChange={(e) => setFormData({ ...formData, severity: e.target.value as IncidentSeverity })}
            >
              <option value="SEV1">SEV1 - Critical (System Down)</option>
              <option value="SEV2">SEV2 - High (Major Feature Impact)</option>
              <option value="SEV3">SEV3 - Medium (Minor Feature Impact)</option>
              <option value="SEV4">SEV4 - Low (Cosmetic/Minor)</option>
            </select>
          </div>

          <div className="flex gap-4 justify-end">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Creating...' : 'Create Incident'}
            </Button>
          </div>
        </form>
      </Modal>
    </MainLayout>
  );
};
