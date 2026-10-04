import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  CheckCheck, 
  AlertTriangle, 
  Heart, 
  Sparkles, 
  X, 
  CheckCircle2, 
  Calendar, 
  ChevronRight,
  ShieldCheck,
  Volume2
} from 'lucide-react';
import { AppNotification, BloodGroup } from '../types';

interface NotificationCenterProps {
  notifications: AppNotification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onNavigateTab?: (tab: string) => void;
  onClose?: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onNavigateTab,
  onClose
}) => {
  const [filter, setFilter] = useState<'ALL' | 'URGENT'>('ALL');
  const [pushStatus, setPushStatus] = useState<'default' | 'granted' | 'denied'>('default');
  const [testSent, setTestSent] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPushStatus(Notification.permission);
    }
  }, []);

  const requestBrowserPush = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      alert('Browser Push Notifications are not supported on this browser.');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setPushStatus(permission);

      if (permission === 'granted') {
        new Notification('FBDM Emergency Alerts Active', {
          body: 'You are now subscribed to urgent blood requests and community announcements in Mymensingh.',
          icon: '/favicon.ico'
        });
        setTestSent(true);
        setTimeout(() => setTestSent(false), 3000);
      }
    } catch (e) {
      console.warn("Notification request error:", e);
    }
  };

  const sendTestNotification = () => {
    if (pushStatus === 'granted') {
      new Notification('🚨 Urgent: O+ Blood Needed', {
        body: 'Mymensingh Medical College Hospital (MMCH) - CCU Ward. Can you donate today?',
        icon: '/favicon.ico'
      });
      setTestSent(true);
      setTimeout(() => setTestSent(false), 3000);
    } else {
      requestBrowserPush();
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'URGENT') {
      return n.type === 'URGENT_BLOOD';
    }
    return true;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getIconForType = (type: AppNotification['type']) => {
    switch (type) {
      case 'URGENT_BLOOD':
        return <AlertTriangle size={16} className="text-red-600" />;
      case 'REQUEST_STATUS':
        return <CheckCircle2 size={16} className="text-blue-600" />;
      case 'DONATION':
        return <Heart size={16} className="fill-red-600 text-red-600" />;
      case 'ANNOUNCEMENT':
        return <Sparkles size={16} className="text-amber-600" />;
      default:
        return <Bell size={16} className="text-slate-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-start justify-end p-2 sm:p-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col h-[90vh] max-h-[640px] animate-in slide-in-from-right duration-200">
        
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-red-600 flex items-center justify-center text-white">
              <Bell size={18} />
            </div>
            <div>
              <h3 className="font-bold text-sm leading-tight flex items-center gap-2">
                Push Notifications
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-red-600 text-[10px] font-black">
                    {unreadCount} new
                  </span>
                )}
              </h3>
              <p className="text-[11px] text-slate-400">Live emergency & system alerts</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <button
                onClick={onMarkAllAsRead}
                className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1 transition-colors"
                title="Mark all as read"
              >
                <CheckCheck size={16} />
              </button>
            )}
            {onClose && (
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Browser Push Permission Strip */}
        <div className="bg-slate-50 border-b border-slate-100 p-3.5 flex items-center justify-between gap-3 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Volume2 size={16} className="text-red-600 flex-shrink-0" />
            <div>
              <p className="text-xs font-bold text-slate-800">Browser Push Alerts</p>
              <p className="text-[10px] text-slate-500">
                {pushStatus === 'granted' ? 'Active • Receive hospital alerts' : 'Enable sound & lock-screen notices'}
              </p>
            </div>
          </div>

          <button
            onClick={pushStatus === 'granted' ? sendTestNotification : requestBrowserPush}
            className={`px-3 py-1.5 rounded-xl text-[11px] font-bold shadow-xs transition-all active:scale-95 flex-shrink-0 ${
              pushStatus === 'granted'
                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                : 'bg-red-600 text-white hover:bg-red-700'
            }`}
          >
            {testSent ? 'Alert Sent!' : pushStatus === 'granted' ? 'Test Alert' : 'Enable Push'}
          </button>
        </div>

        {/* Filter Pills */}
        <div className="px-5 py-2.5 flex items-center gap-2 border-b border-slate-100 bg-white flex-shrink-0">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
              filter === 'ALL'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Alerts ({notifications.length})
          </button>
          <button
            onClick={() => setFilter('URGENT')}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
              filter === 'URGENT'
                ? 'bg-red-600 text-white'
                : 'bg-red-50 text-red-600 hover:bg-red-100'
            }`}
          >
            🚨 Urgent Only ({notifications.filter(n => n.type === 'URGENT_BLOOD').length})
          </button>
        </div>

        {/* Notification List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 divide-y divide-slate-100/60">
          {filteredNotifications.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Bell size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-xs font-medium">No alerts at the moment</p>
            </div>
          ) : (
            filteredNotifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => {
                  onMarkAsRead(notif.id);
                  if (notif.actionTab && onNavigateTab) {
                    onNavigateTab(notif.actionTab);
                    if (onClose) onClose();
                  }
                }}
                className={`pt-2.5 first:pt-0 p-2.5 rounded-2xl transition-all cursor-pointer flex items-start gap-3 ${
                  !notif.isRead 
                    ? 'bg-red-50/50 hover:bg-red-50 border border-red-100/80' 
                    : 'hover:bg-slate-50 border border-transparent'
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-white shadow-xs border border-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  {getIconForType(notif.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <h4 className={`text-xs font-bold leading-tight truncate ${!notif.isRead ? 'text-slate-900' : 'text-slate-700'}`}>
                      {notif.title}
                    </h4>
                    <span className="text-[10px] text-slate-400 flex-shrink-0 font-medium">{notif.timestamp}</span>
                  </div>

                  <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-2">
                    {notif.message}
                  </p>

                  {notif.bloodGroup && (
                    <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-600 text-white text-[10px] font-black">
                      Blood Group {notif.bloodGroup} Needed
                    </div>
                  )}
                </div>

                {!notif.isRead && (
                  <div className="w-2 h-2 rounded-full bg-red-600 flex-shrink-0 mt-2" />
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-3 text-center border-t border-slate-100 flex-shrink-0">
          <p className="text-[10px] text-slate-500">
            FBDM Push Alert System • Immediate dispatch during critical shortages
          </p>
        </div>

      </div>
    </div>
  );
};
