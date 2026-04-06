import React from 'react';
import type { IncidentSeverity, IncidentStatus } from '../../types';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'severity' | 'status' | 'default';
  severity?: IncidentSeverity;
  status?: IncidentStatus;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  severity,
  status,
  className = '',
}) => {
  const baseClasses = 'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider';
  
  let colorClasses = 'bg-surface-container text-on-surface';
  
  if (variant === 'severity' && severity) {
    const severityColors = {
      SEV1: 'bg-tertiary text-on-tertiary',
      SEV2: 'bg-primary text-on-primary',
      SEV3: 'bg-secondary text-on-secondary',
      SEV4: 'bg-surface-container-high text-on-surface-variant',
    };
    colorClasses = severityColors[severity];
  }
  
  if (variant === 'status' && status) {
    const statusColors = {
      detected: 'bg-tertiary-container text-on-tertiary-fixed-variant',
      acknowledged: 'bg-primary-container text-on-primary-fixed-variant',
      mitigating: 'bg-primary text-on-primary',
      resolved: 'bg-secondary-container text-on-secondary-container',
      postmortem: 'bg-surface-container-highest text-on-surface-variant',
    };
    colorClasses = statusColors[status];
  }
  
  return (
    <span className={`${baseClasses} ${colorClasses} ${className}`}>
      {children}
    </span>
  );
};
