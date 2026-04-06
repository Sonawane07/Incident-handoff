import React, { useState } from 'react';
import { MainLayout } from '../components/layout/MainLayout';
import { Badge } from '../components/ui/Badge';
import { Spinner } from '../components/ui/Spinner';
import { formatDistanceToNow } from 'date-fns';

export const WebhookAdmin: React.FC = () => {
  // This would use a real hook in production
  const isLoading = false;
  const webhooks = [];

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      received: 'bg-surface-container text-on-surface-variant',
      processed: 'bg-primary text-on-primary',
      failed: 'bg-tertiary text-on-tertiary',
    };
    return colors[status] || 'bg-surface-container text-on-surface-variant';
  };

  const getSourceIcon = (source: string) => {
    const icons: Record<string, string> = {
      pagerduty: 'emergency',
      sentry: 'bug_report',
      generic: 'webhook',
    };
    return icons[source] || 'webhook';
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
        <div>
          <h2 className="text-4xl font-extrabold font-headline tracking-tight text-on-surface">
            Webhook Deliveries
          </h2>
          <p className="text-on-surface-variant font-medium mt-1">
            Monitor external alert integrations and webhook processing
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-surface-container-lowest p-6 rounded-lg">
            <p className="text-sm font-bold uppercase tracking-wider text-on-surface-variant mb-1">
              Total Received
            </p>
            <p className="text-3xl font-bold font-headline text-on-surface">0</p>
          </div>
          <div className="bg-surface-container-lowest p-6 rounded-lg">
            <p className="text-sm font-bold uppercase tracking-wider text-primary mb-1">
              Processed
            </p>
            <p className="text-3xl font-bold font-headline text-primary">0</p>
          </div>
          <div className="bg-surface-container-lowest p-6 rounded-lg">
            <p className="text-sm font-bold uppercase tracking-wider text-tertiary mb-1">
              Failed
            </p>
            <p className="text-3xl font-bold font-headline text-tertiary">0</p>
          </div>
          <div className="bg-surface-container-lowest p-6 rounded-lg">
            <p className="text-sm font-bold uppercase tracking-wider text-on-surface-variant mb-1">
              Success Rate
            </p>
            <p className="text-3xl font-bold font-headline text-on-surface">100%</p>
          </div>
        </div>

        {/* Webhook Table */}
        <div className="bg-surface-container-lowest rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-surface-container-high">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                  Source
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                  Incident
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                  Received
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {webhooks.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12">
                    <div className="text-center">
                      <span className="material-symbols-outlined text-6xl text-on-surface-variant/30">
                        webhook
                      </span>
                      <p className="text-on-surface-variant mt-4">No webhook deliveries yet</p>
                      <p className="text-sm text-on-surface-variant/70 mt-2">
                        Configure external integrations to start receiving webhooks
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Integration Setup Info */}
        <div className="bg-surface-container-lowest p-6 rounded-lg">
          <h3 className="text-lg font-bold font-headline text-on-surface mb-4">
            Webhook Endpoints
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-surface-container-low rounded">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-on-surface-variant">
                  emergency
                </span>
                <div>
                  <p className="font-medium text-on-surface">PagerDuty</p>
                  <p className="text-sm text-on-surface-variant font-mono">
                    POST /api/webhooks/pagerduty
                  </p>
                </div>
              </div>
              <button className="text-primary hover:underline text-sm font-medium">
                Copy URL
              </button>
            </div>
            <div className="flex items-center justify-between p-3 bg-surface-container-low rounded">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-on-surface-variant">
                  bug_report
                </span>
                <div>
                  <p className="font-medium text-on-surface">Sentry</p>
                  <p className="text-sm text-on-surface-variant font-mono">
                    POST /api/webhooks/sentry
                  </p>
                </div>
              </div>
              <button className="text-primary hover:underline text-sm font-medium">
                Copy URL
              </button>
            </div>
            <div className="flex items-center justify-between p-3 bg-surface-container-low rounded">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-on-surface-variant">
                  webhook
                </span>
                <div>
                  <p className="font-medium text-on-surface">Generic</p>
                  <p className="text-sm text-on-surface-variant font-mono">
                    POST /api/webhooks/generic
                  </p>
                </div>
              </div>
              <button className="text-primary hover:underline text-sm font-medium">
                Copy URL
              </button>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};
