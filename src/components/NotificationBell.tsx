'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';

interface Notification {
  id: string;
  type: 'upvote' | 'comment' | 'mention' | 'pr_merged' | 'welcome';
  message: string;
  read: boolean;
  createdAt: string;
  url?: string;
}

interface NotificationBellProps {
  notifications: Notification[];
  onMarkAllRead?: () => void;
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  return `${Math.floor(seconds / 86400)}d`;
}

function getNotificationIcon(type: Notification['type']) {
  switch (type) {
    case 'upvote': return '⬆️';
    case 'comment': return '💬';
    case 'mention': return '📣';
    case 'pr_merged': return '🎉';
    case 'welcome': return '👋';
    default: return '🔔';
  }
}

export default function NotificationBell({ notifications = [], onMarkAllRead }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-orange-500 transition-colors"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-5 h-5 bg-orange-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown Content */}
          <Card className="absolute right-0 top-full mt-2 w-80 z-50 shadow-lg max-h-96 overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-3 border-b flex items-center justify-between bg-gray-50">
              <span className="font-semibold text-gray-700">Notifications</span>
              {unreadCount > 0 && onMarkAllRead && (
                <button
                  onClick={onMarkAllRead}
                  className="text-xs text-orange-500 hover:text-orange-600"
                >
                  Mark all read
                </button>
              )}
            </div>

            {/* Notifications List */}
            <div className="overflow-y-auto flex-1">
              {notifications.length === 0 ? (
                <div className="p-6 text-center">
                  <span className="text-3xl block mb-2">🔔</span>
                  <p className="text-gray-500 text-sm">No notifications yet</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <a
                    key={notification.id}
                    href={notification.url || '#'}
                    className={`block p-3 border-b hover:bg-gray-50 transition-colors ${
                      !notification.read ? 'bg-orange-50' : ''
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-lg">{getNotificationIcon(notification.type)}</span>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${!notification.read ? 'font-medium' : 'text-gray-600'}`}>
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatTimeAgo(notification.createdAt)}
                        </p>
                      </div>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0 mt-2" />
                      )}
                    </div>
                  </a>
                ))
              )}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
