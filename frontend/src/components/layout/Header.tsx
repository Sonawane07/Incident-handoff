import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../hooks/useNotifications';
import { Link } from 'react-router-dom';

export const Header: React.FC = () => {
  const { user, signOut } = useAuth();
  const { data: notifications } = useNotifications();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const unreadCount = notifications?.filter(n => !n.is_read).length || 0;

  return (
    <header className="fixed top-0 left-64 right-0 h-16 bg-surface border-b border-outline-variant z-40 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-semibold text-on-surface">
          Welcome back, {user?.email?.split('@')[0]}
        </h2>
      </div>

      <div className="flex items-center gap-4">
        <Link
          to="/notifications"
          className="relative p-2 hover:bg-surface-container rounded-lg transition-colors"
        >
          <span className="material-symbols-outlined text-on-surface-variant">
            notifications
          </span>
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 bg-tertiary text-on-tertiary text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Link>

        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-2 hover:bg-surface-container rounded-lg transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold">
              {user?.email?.[0].toUpperCase()}
            </div>
            <span className="material-symbols-outlined text-on-surface-variant">
              {showUserMenu ? 'expand_less' : 'expand_more'}
            </span>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-surface-container-lowest rounded-lg shadow-lg border border-outline-variant overflow-hidden">
              <div className="p-3 border-b border-outline-variant">
                <p className="text-sm font-medium text-on-surface">{user?.email}</p>
                <p className="text-xs text-on-surface-variant capitalize">{user?.global_role}</p>
              </div>
              <button
                onClick={() => {
                  signOut();
                  setShowUserMenu(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-on-surface hover:bg-surface-container transition-colors flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-on-surface-variant">logout</span>
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
