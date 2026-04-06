// User and Auth Types
export interface User {
  id: string;
  email: string;
  global_role: 'admin' | 'member';
  created_at: string;
  updated_at: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

// Incident Types
export type IncidentStatus = 'detected' | 'acknowledged' | 'mitigating' | 'resolved' | 'postmortem';
export type IncidentSeverity = 'SEV1' | 'SEV2' | 'SEV3' | 'SEV4';
export type IncidentRole = 'commander' | 'responder' | 'viewer';

export interface Incident {
  id: string;
  title: string;
  description: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  commander_id: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  commander?: User;
}

export interface CreateIncidentInput {
  title: string;
  description: string;
  severity: IncidentSeverity;
}

// Timeline Types
export interface TimelineEvent {
  id: string;
  incident_id: string;
  content: string;
  event_type: 'manual' | 'webhook' | 'ai_generated';
  source?: string;
  timestamp: string;
  created_by_id: string;
  created_at: string;
  updated_at: string;
  is_edited: boolean;
  created_by?: User;
}

export interface CreateTimelineEventInput {
  content: string;
  timestamp?: string;
}

// Attachment Types
export interface Attachment {
  id: string;
  incident_id: string;
  filename: string;
  file_type: string;
  file_size: number;
  storage_path: string;
  uploaded_by_id: string;
  uploaded_at: string;
  uploaded_by?: User;
}

// Comment Types
export interface Comment {
  id: string;
  incident_id: string;
  content: string;
  author_id: string;
  created_at: string;
  updated_at: string;
  author?: User;
}

export interface CreateCommentInput {
  content: string;
}

// AI Summary Types
export type AISummaryStatus = 'draft' | 'approved' | 'edited' | 'discarded' | 'failed';

export interface AISummary {
  id: string;
  incident_id: string;
  version: number;
  timeline_narrative: string;
  next_steps: string[];
  status: AISummaryStatus;
  generated_at: string;
  approved_at?: string;
  approved_by_id?: string;
  approved_by?: User;
}

// Incident Role Types
export interface IncidentRoleAssignment {
  id: string;
  incident_id: string;
  user_id: string;
  role: IncidentRole;
  assigned_at: string;
  assigned_by_id: string;
  user?: User;
  assigned_by?: User;
}

// Status Change Types
export interface StatusChange {
  id: string;
  incident_id: string;
  from_status: IncidentStatus;
  to_status: IncidentStatus;
  changed_by_id: string;
  changed_at: string;
  changed_by?: User;
}

// Notification Types
export type NotificationType = 
  | 'incident_created'
  | 'severity_escalated'
  | 'commander_transferred'
  | 'ai_summary_ready'
  | 'incident_resolved'
  | 'added_to_incident';

export interface Notification {
  id: string;
  user_id: string;
  incident_id: string;
  type: NotificationType;
  message: string;
  is_read: boolean;
  created_at: string;
  incident?: Incident;
}

// Webhook Types
export type WebhookStatus = 'received' | 'processed' | 'failed';
export type WebhookSourceType = 'generic' | 'pagerduty' | 'sentry';

export interface WebhookDelivery {
  id: string;
  source_type: WebhookSourceType;
  incident_id?: string;
  raw_payload: Record<string, any>;
  status: WebhookStatus;
  error_message?: string;
  received_at: string;
  processed_at?: string;
  incident?: Incident;
}

// Audit Log Types
export interface AuditLog {
  id: string;
  incident_id: string;
  actor_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  old_value?: Record<string, any>;
  new_value?: Record<string, any>;
  timestamp: string;
  actor?: User;
}

// Dashboard Metrics Types
export interface DashboardMetrics {
  open_incidents: {
    sev1: number;
    sev2: number;
    sev3: number;
    sev4: number;
    total: number;
  };
  mttr: {
    average_minutes: number;
    trend: Array<{ date: string; value: number }>;
  };
  ai_summary: {
    total_generated: number;
    approved: number;
    discarded: number;
    acceptance_rate: number;
  };
  webhook_stats: {
    total_received: number;
    processed: number;
    failed: number;
    success_rate: number;
  };
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}
