import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'system',
      title: 'Security Upgrade: 2FA Now Available',
      desc: 'Two-factor authentication (2FA) has been enabled for all accounts. Head to Profile -> Security to set up authenticated devices.',
      time: 'Today, 11:20 AM',
      icon: 'security',
      color: '#7C3AED',
      unread: true,
    },
    {
      id: 2,
      type: 'amendment',
      title: 'Act Amendment: IPC Sections Updated',
      desc: 'Parliament has passed the Criminal Laws Amendment Act. Modified clauses for IPC Section 302 and Section 376 have been successfully updated in our indexed database.',
      time: 'Yesterday, 03:15 PM',
      icon: 'gavel',
      color: '#c9a84c',
      unread: true,
    },
    {
      id: 3,
      type: 'alert',
      title: 'New Supreme Court Citation on Section 420',
      desc: 'A landmark decision has been appended to your bookmarked section: IPC 420 (Cheating and dishonestly inducing delivery of property).',
      time: '3 days ago',
      icon: 'bookmark',
      color: '#3B82F6',
      unread: false,
    },
    {
      id: 4,
      type: 'system',
      title: 'Professional Suite Plan Activated',
      desc: 'Thank you for upgrading! Your Professional Suite features (Unlimited Searches, PDF Exports, AI Assistant) are verified and active.',
      time: '1 week ago',
      icon: 'workspace_premium',
      color: '#10B981',
      unread: false,
    },
    {
      id: 5,
      type: 'alert',
      title: 'Database Synchronization Complete',
      desc: 'All central penal statutes, act updates, and user bookmarks have completed their weekly secure backup cloud sync.',
      time: '1 week ago',
      icon: 'cloud_sync',
      color: '#38bdf8',
      unread: false,
    }
  ]);

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const handleToggleRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, unread: !n.unread } : n));
  };

  const handleDelete = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const filtered = notifications.filter(n => {
    if (filter === 'all') return true;
    if (filter === 'unread') return n.unread;
    return n.type === filter;
  });

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <div className="min-h-screen bg-transparent text-gray-900 dark:text-white font-sans selection:bg-[#7C3AED]/30 pb-20">
      
      <div className="max-w-[960px] mx-auto px-4 lg:px-8 pt-6">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-[#94A3B8] font-medium mb-3">
          <Link to="/dashboard" className="hover:text-[#c9a84c] transition-colors">Dashboard</Link>
          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>chevron_right</span>
          <span className="text-gray-900 dark:text-white font-semibold">Notifications</span>
        </div>

        {/* Title Block */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[#7C3AED]">notifications</span>
              Notifications
            </h1>
            <p className="text-xs text-gray-500 dark:text-[#94A3B8] mt-0.5">Stay informed about legal updates, act amendments, and platform status</p>
          </div>
          
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="flex items-center gap-1.5 px-3.5 h-8.5 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-[#1F2937] dark:hover:bg-[#374151] border border-gray-200 dark:border-[#2A2F45] text-xs font-semibold text-gray-700 dark:text-white transition-all active:scale-95 self-start sm:self-auto"
            >
              <span className="material-symbols-outlined text-[14px]">done_all</span>
              Mark all as read
            </button>
          )}
        </div>

        {/* Filter Tabs Row */}
        <div className="flex items-center gap-1.5 border-b border-gray-200 dark:border-[#2A2F45]/60 pb-3 mb-6 overflow-x-auto">
          {[
            { key: 'all', label: 'All Alerts', icon: 'blur_on' },
            { key: 'unread', label: `Unread (${unreadCount})`, icon: 'mark_as_unread' },
            { key: 'amendment', label: 'Amendments', icon: 'gavel' },
            { key: 'system', label: 'System', icon: 'settings' },
            { key: 'alert', label: 'Law Updates', icon: 'bookmark' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                filter === tab.key
                  ? 'bg-[#7C3AED]/10 text-[#7C3AED] dark:text-[#a78bfa] border border-[#7C3AED]/35 font-bold'
                  : 'text-gray-500 dark:text-[#94A3B8] hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#1F2937]/40 border border-transparent'
              }`}
            >
              <span className="material-symbols-outlined text-[14px]">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Notifications List Container */}
        <div className="space-y-4">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-[#111827] border border-gray-200 dark:border-[#2A2F45] rounded-xl p-8">
              <div className="w-14 h-14 rounded-full bg-gray-50 dark:bg-[#1F2937] flex items-center justify-center mb-3">
                <span className="material-symbols-outlined text-gray-400 dark:text-[#94A3B8] text-2xl">notifications_off</span>
              </div>
              <h3 className="text-sm font-bold text-gray-800 dark:text-white">No notifications found</h3>
              <p className="text-xs text-gray-500 dark:text-[#94A3B8] mt-1 max-w-xs leading-relaxed">
                You are completely up to date! When new amendments or updates occur, they will appear here.
              </p>
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                className={`relative flex gap-4 p-5 bg-white dark:bg-[#111827] border rounded-xl transition-all ${
                  item.unread
                    ? 'border-[#7C3AED]/40 bg-[#7C3AED]/[0.02] dark:bg-[#111827] shadow-sm dark:shadow-[0_0_15px_rgba(124,77,255,0.04)]'
                    : 'border-gray-200 dark:border-[#2A2F45] opacity-90 dark:opacity-85 hover:opacity-100'
                }`}
              >
                {/* Left Dot for unread */}
                {item.unread && (
                  <div className="absolute top-5 left-2 w-1.5 h-1.5 bg-[#7C3AED] rounded-full" />
                )}

                {/* Icon Column */}
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: item.color + '15' }}
                >
                  <span
                    className="material-symbols-outlined text-[18px]"
                    style={{ color: item.color, fontVariationSettings: "'FILL' 1" }}
                  >
                    {item.icon}
                  </span>
                </div>

                {/* Content Column */}
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                    <h3 className={`text-sm font-bold leading-snug truncate ${item.unread ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-[#cbd5e1]'}`}>
                      {item.title}
                    </h3>
                    <span className="text-[10px] text-gray-400 dark:text-[#94A3B8] font-medium sm:shrink-0">{item.time}</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-[#94A3B8] leading-relaxed font-normal">
                    {item.desc}
                  </p>
                </div>

                {/* Action Buttons Column */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleToggleRead(item.id)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 dark:hover:bg-[#1F2937] text-gray-400 dark:text-[#94A3B8] hover:text-gray-800 dark:hover:text-white transition-colors"
                    title={item.unread ? 'Mark as read' : 'Mark as unread'}
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {item.unread ? 'check_circle' : 'radio_button_unchecked'}
                    </span>
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 dark:hover:bg-[#1F2937] text-gray-450 dark:text-[#94A3B8] hover:text-[#EF4444] transition-colors"
                    title="Delete notice"
                  >
                    <span className="material-symbols-outlined text-[16px]">delete</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

      </div>

    </div>
  );
}
