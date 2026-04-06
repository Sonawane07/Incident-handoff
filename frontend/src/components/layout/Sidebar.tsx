import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface NavItem {
  label: string;
  path: string;
  icon: string;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
  { label: 'Incidents', path: '/incidents', icon: 'emergency' },
  { label: 'Notifications', path: '/notifications', icon: 'notifications' },
  { label: 'Webhooks', path: '/webhooks', icon: 'webhook' },
];

export const Sidebar: React.FC = () => {
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-0 h-full flex flex-col py-6 w-64 bg-surface-container-low z-50">
      <div className="px-6 mb-10 flex flex-col gap-1">
        <h1 className="text-xl font-bold text-on-background font-headline">
          Incident Handoff
        </h1>
        <p className="text-xs uppercase tracking-widest text-on-surface-variant/70 font-label">
          The Serene Sentinel
        </p>
      </div>
      
      <nav className="flex-1 flex flex-col px-3 space-y-2">
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 text-sm font-bold transition-all duration-300 ${
                isActive
                  ? 'text-primary border-r-4 border-primary bg-surface-container-highest scale-95'
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};
