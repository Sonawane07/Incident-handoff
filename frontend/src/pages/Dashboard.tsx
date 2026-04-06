import React from 'react';
import { MainLayout } from '../components/layout/MainLayout';
import { useDashboardMetrics } from '../hooks/useDashboard';
import { Card } from '../components/ui/Card';
import { Spinner } from '../components/ui/Spinner';
import { Link } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const { data: metrics, isLoading } = useDashboardMetrics();

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
      <section className="p-8 max-w-7xl mx-auto space-y-8">
        {/* Hero Heading */}
        <div className="space-y-1">
          <h2 className="text-4xl font-extrabold font-headline tracking-tight text-on-surface">
            Systems Overview
          </h2>
          <p className="text-on-surface-variant font-medium">
            Real-time status of current active incidents and platform health.
          </p>
        </div>

        {/* Severity Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-surface-container-highest p-6 rounded-xl relative overflow-hidden group">
            <div className="relative z-10">
              <p className="text-xs font-bold uppercase tracking-widest text-tertiary mb-1 font-label">
                Critical Priority
              </p>
              <h3 className="text-5xl font-extrabold font-headline text-on-surface">
                {metrics?.open_incidents.sev1 || 0}
              </h3>
              <p className="text-sm font-medium text-on-surface-variant mt-2">
                Active SEV1 Incidents
              </p>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
              <span className="material-symbols-outlined text-[120px]">warning</span>
            </div>
          </div>

          <div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant/10">
            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-1 font-label">
              High Priority
            </p>
            <h3 className="text-5xl font-extrabold font-headline text-on-surface">
              {metrics?.open_incidents.sev2 || 0}
            </h3>
            <p className="text-sm font-medium text-on-surface-variant mt-2">
              Active SEV2 Incidents
            </p>
          </div>

          <div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant/10">
            <p className="text-xs font-bold uppercase tracking-widest text-secondary mb-1 font-label">
              Medium Priority
            </p>
            <h3 className="text-5xl font-extrabold font-headline text-on-surface">
              {metrics?.open_incidents.sev3 || 0}
            </h3>
            <p className="text-sm font-medium text-on-surface-variant mt-2">
              Active SEV3 Incidents
            </p>
          </div>
        </div>

        {/* Analytics Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* MTTR Chart Card */}
          <Card className="space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-lg font-bold font-headline text-on-surface">MTTR Trend</h4>
                <p className="text-sm text-on-surface-variant">
                  Mean Time To Resolution (Last 30 Days)
                </p>
              </div>
              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">trending_down</span>
                14% Improvement
              </span>
            </div>
            <div className="space-y-4">
              <div className="flex items-end justify-between gap-2 h-48">
                {metrics?.mttr.trend.slice(-7).map((item, i) => {
                  const maxValue = Math.max(...(metrics?.mttr.trend.map(t => t.value) || [100]));
                  const height = (item.value / maxValue) * 100;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                      <div
                        className="w-full bg-primary rounded-t transition-all hover:bg-primary-container"
                        style={{ height: `${height}%` }}
                      />
                      <span className="text-xs text-on-surface-variant">
                        {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-outline-variant">
                <div>
                  <p className="text-2xl font-bold font-headline text-on-surface">
                    {metrics?.mttr.average_minutes || 0} min
                  </p>
                  <p className="text-xs text-on-surface-variant">Average MTTR</p>
                </div>
                <Link
                  to="/incidents"
                  className="text-sm text-primary hover:underline font-medium"
                >
                  View Details →
                </Link>
              </div>
            </div>
          </Card>

          {/* AI Summary Stats Card */}
          <Card className="space-y-6">
            <div>
              <h4 className="text-lg font-bold font-headline text-on-surface">
                AI Summary Performance
              </h4>
              <p className="text-sm text-on-surface-variant">
                Acceptance rate and generation metrics
              </p>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-on-surface-variant">Acceptance Rate</span>
                <span className="text-2xl font-bold font-headline text-on-surface">
                  {metrics?.ai_summary.acceptance_rate.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-surface-container-high rounded-full h-3 overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${metrics?.ai_summary.acceptance_rate || 0}%` }}
                />
              </div>
              <div className="grid grid-cols-3 gap-4 pt-4">
                <div className="text-center">
                  <p className="text-2xl font-bold font-headline text-on-surface">
                    {metrics?.ai_summary.total_generated || 0}
                  </p>
                  <p className="text-xs text-on-surface-variant">Generated</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold font-headline text-primary">
                    {metrics?.ai_summary.approved || 0}
                  </p>
                  <p className="text-xs text-on-surface-variant">Approved</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold font-headline text-tertiary">
                    {metrics?.ai_summary.discarded || 0}
                  </p>
                  <p className="text-xs text-on-surface-variant">Discarded</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Webhook Stats */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h4 className="text-lg font-bold font-headline text-on-surface">
                Webhook Integration Status
              </h4>
              <p className="text-sm text-on-surface-variant">
                External alert processing performance
              </p>
            </div>
            <Link
              to="/webhooks"
              className="text-sm text-primary hover:underline font-medium"
            >
              View All →
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-3xl font-bold font-headline text-on-surface">
                {metrics?.webhook_stats.total_received || 0}
              </p>
              <p className="text-sm text-on-surface-variant mt-1">Total Received</p>
            </div>
            <div>
              <p className="text-3xl font-bold font-headline text-primary">
                {metrics?.webhook_stats.processed || 0}
              </p>
              <p className="text-sm text-on-surface-variant mt-1">Processed</p>
            </div>
            <div>
              <p className="text-3xl font-bold font-headline text-tertiary">
                {metrics?.webhook_stats.failed || 0}
              </p>
              <p className="text-sm text-on-surface-variant mt-1">Failed</p>
            </div>
            <div>
              <p className="text-3xl font-bold font-headline text-on-surface">
                {metrics?.webhook_stats.success_rate.toFixed(1)}%
              </p>
              <p className="text-sm text-on-surface-variant mt-1">Success Rate</p>
            </div>
          </div>
        </Card>

        {/* Quick Actions */}
        <div className="flex gap-4">
          <Link
            to="/incidents"
            className="flex-1 bg-surface-container-highest p-6 rounded-xl hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-on-primary">list_alt</span>
              </div>
              <div>
                <h5 className="font-bold text-on-surface">View All Incidents</h5>
                <p className="text-sm text-on-surface-variant">
                  Browse and manage active incidents
                </p>
              </div>
            </div>
          </Link>
          <Link
            to="/notifications"
            className="flex-1 bg-surface-container-highest p-6 rounded-xl hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-tertiary-container rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-on-tertiary">notifications</span>
              </div>
              <div>
                <h5 className="font-bold text-on-surface">Notifications</h5>
                <p className="text-sm text-on-surface-variant">
                  Check your recent updates
                </p>
              </div>
            </div>
          </Link>
        </div>
      </section>
    </MainLayout>
  );
};
