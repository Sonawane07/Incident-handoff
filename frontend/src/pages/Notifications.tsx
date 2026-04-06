import React from 'react';
import { MainLayout } from '../components/layout/MainLayout';
import { useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead } from '../hooks/useNotifications';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

export const Notifications: React.FC = () => {
  const { data: notifications, isLoading } = useNotifications();
  const markReadMutation = useMarkNotificationRead();
  const markAllReadMutation = useMarkAllNotificationsRead();

  const unreadCount = notifications?.filter(n => !n.is_read).length || 0;

  const getNotificationIcon = (type: string) => {
    const icons: Record<string, string> = {
      incident_created: 'emergency',
      severity_escalated: 'warning',
      commander_transferred: 'swap_horiz',
      ai_summary_ready: 'auto_awesome',
      incident_resolved: 'check_circle',
      added_to_incident: 'person_add',
    };
    return icons[type] || 'notifications';
  };

  const getNotificationColor = (type: string) => {
    const colors: Record<string, string> = {
      incident_created: 'bg-tertiary-container text-on-tertiary-fixed-variant',
      severity_escalated: 'bg-error-container text-on-error-container',
      commander_transferred: 'bg-secondary-container text-on-secondary-container',
      ai_summary_ready: 'bg-primary-container text-on-primary-fixed-variant',
      incident_resolved: 'bg-primary text-on-primary',
      added_to_incident: 'bg-surface-container-high text-on-surface-variant',
    };
    return colors[type] || 'bg-surface-container text-on-surface-variant';
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
      <section className="p-8 max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-4xl font-extrabold font-headline tracking-tight text-on-surface">
              Notifications
            </h2>
            <p className="text-on-surface-variant font-medium mt-1">
              {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button
              variant="secondary"
              onClick={() => markAllReadMutation.mutate()}
              disabled={markAllReadMutation.isPending}
            >
              Mark All as Read
            </Button>
          )}
        </div>

        <div className="space-y-3">
          {notifications?.map((notification) => (
            <div
              key={notification.id}
              className={`bg-surface-container-lowest rounded-lg p-5 hover:shadow-md transition-all ${
                !notification.is_read ? 'border-l-4 border-primary' : ''
              }`}
              onClick={() => {
                if (!notification.is_read) {
                  markReadMutation.mutate(notification.id);
                }
              }}
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getNotificationColor(notification.type)}`}>
                  <span className="material-symbols-outlined">
                    {getNotificationIcon(notification.type)}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className={`text-on-surface ${!notification.is_read ? 'font-bold' : ''}`}>
                        {notification.message}
                      </p>
                      {notification.incident && (
                        <Link
                          to={`/incidents/${notification.incident_id}`}
                          className="text-sm text-primary hover:underline mt-2 inline-block"
                        >
                          View Incident: {notification.incident.title} →
                        </Link>
                      )}
                    </div>
                    <span className="text-sm text-on-surface-variant whitespace-nowrap">
                      {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                    </span>
                  </div>
                </div>
                {!notification.is_read && (
                  <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" />
                )}
              </div>
            </div>
          ))}

          {notifications?.length === 0 && (
            <div className="text-center py-16 bg-surface-container-low rounded-lg">
              <span className="material-symbols-outlined text-6xl text-on-surface-variant/30">
                notifications_none
              </span>
              <p className="text-on-surface-variant mt-4 text-lg">No notifications yet</p>
              <p className="text-sm text-on-surface-variant/70 mt-2">
                You'll be notified about important incident updates
              </p>
            </div>
          )}
        </div>
      </section>
    </MainLayout>
  );
};
