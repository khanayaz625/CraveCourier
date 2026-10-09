import React, { useState } from 'react';
import { 
  X, 
  Bell, 
  Sparkles, 
  ChefHat, 
  Bike, 
  CheckCircle2, 
  Flame, 
  Trash2, 
  CheckCheck, 
  Play, 
  ShieldCheck, 
  Clock, 
  Volume2,
  ExternalLink,
  Smartphone
} from 'lucide-react';
import { useNotification } from '../context/NotificationContext';

export const NotificationCenterModal = ({ onNavigateTab }) => {
  const { 
    notifications, 
    unreadCount, 
    isNotificationCenterOpen, 
    setIsNotificationCenterOpen,
    browserPermission,
    requestBrowserPermission,
    markAllAsRead,
    markAsRead,
    clearNotifications,
    triggerTestPipeline
  } = useNotification();

  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'order' | 'delivery' | 'system'

  if (!isNotificationCenterOpen) return null;

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'all') return true;
    return n.category === activeTab;
  });

  const getIcon = (type) => {
    switch (type) {
      case 'order_placed': return <Sparkles size={16} color="#FF5E1E" />;
      case 'confirmed': return <ChefHat size={16} color="#10B981" />;
      case 'cooking': return <Flame size={16} color="#F59E0B" />;
      case 'out_for_delivery':
      case 'rider': return <Bike size={16} color="#3B82F6" />;
      case 'delivered': return <CheckCircle2 size={16} color="#10B981" />;
      case 'new_order': return <Bell size={16} color="#8B5CF6" />;
      default: return <Bell size={16} color="#FF5E1E" />;
    }
  };

  const getAccentColor = (type) => {
    switch (type) {
      case 'order_placed': return '#FF5E1E';
      case 'confirmed': return '#10B981';
      case 'cooking': return '#F59E0B';
      case 'out_for_delivery': return '#3B82F6';
      case 'delivered': return '#10B981';
      case 'new_order': return '#8B5CF6';
      default: return '#FF5E1E';
    }
  };

  const formatTimeAgo = (isoString) => {
    try {
      const diffMs = Date.now() - new Date(isoString).getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      return `${Math.floor(diffHours / 24)}d ago`;
    } catch {
      return 'Recently';
    }
  };

  const handleItemClick = (notif) => {
    markAsRead(notif.id);
    if (notif.actionTab && onNavigateTab) {
      onNavigateTab(notif.actionTab, notif.orderId);
      setIsNotificationCenterOpen(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={() => setIsNotificationCenterOpen(false)}>
      <div 
        className="glass-panel animate-modal"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '480px',
          maxHeight: '90vh',
          background: 'var(--bg-elevated)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-subtle)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '18px 20px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(255, 255, 255, 0.02)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'rgba(255, 94, 30, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary)'
            }}>
              <Bell size={18} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Push Notifications</h3>
                {unreadCount > 0 && (
                  <span className="badge badge-primary" style={{ fontSize: '0.65rem' }}>
                    {unreadCount} NEW
                  </span>
                )}
              </div>
              <p style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                Live orders, kitchen preparation, and delivery satellite updates
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsNotificationCenterOpen(false)}
            className="btn btn-ghost btn-sm"
            style={{ padding: '6px', borderRadius: '50%' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Browser Native Push Permission Bar */}
        <div style={{
          padding: '10px 18px',
          background: browserPermission === 'granted' 
            ? 'rgba(16, 185, 129, 0.1)' 
            : 'rgba(255, 94, 30, 0.08)',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.78rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>{browserPermission === 'granted' ? '🟢' : '📡'}</span>
            <span style={{ fontWeight: 700, color: browserPermission === 'granted' ? 'var(--veg-color)' : 'var(--text-main)' }}>
              {browserPermission === 'granted' ? 'Native Web Push Active' : 'Enable Native Web Push'}
            </span>
          </div>

          {browserPermission !== 'granted' ? (
            <button
              type="button"
              onClick={requestBrowserPermission}
              className="btn btn-primary btn-sm"
              style={{ padding: '4px 10px', fontSize: '0.72rem', borderRadius: 'var(--radius-full)' }}
            >
              Allow Push 🔔
            </button>
          ) : (
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Granted ✅</span>
          )}
        </div>

        {/* Quick Simulator Bar */}
        <div style={{
          padding: '8px 18px',
          background: 'var(--bg-input)',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            Live Push Simulator
          </span>
          <button
            type="button"
            onClick={triggerTestPipeline}
            className="btn btn-secondary btn-sm"
            style={{
              padding: '4px 10px',
              fontSize: '0.72rem',
              gap: '5px',
              color: 'var(--primary)',
              borderColor: 'var(--primary-glow)'
            }}
            title="Simulate full order to delivery push lifecycle"
          >
            <Play size={12} fill="var(--primary)" />
            <span>Simulate Order Cycle</span>
          </button>
        </div>

        {/* Category Tabs */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 18px',
          borderBottom: '1px solid var(--border-subtle)',
          background: 'var(--bg-main)'
        }}>
          <div style={{ display: 'flex', gap: '4px' }}>
            {[
              { id: 'all', label: 'All' },
              { id: 'order', label: 'Orders' },
              { id: 'delivery', label: 'Delivery' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  background: activeTab === tab.id ? 'var(--bg-elevated)' : 'transparent',
                  color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-muted)',
                  fontWeight: 700,
                  fontSize: '0.76rem',
                  cursor: 'pointer'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px'
                }}
                title="Mark all as read"
              >
                <CheckCheck size={13} />
                <span>Mark Read</span>
              </button>
            )}

            {notifications.length > 0 && (
              <button
                onClick={clearNotifications}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  fontSize: '0.72rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px'
                }}
                title="Clear all notifications"
              >
                <Trash2 size={12} />
                <span>Clear</span>
              </button>
            )}
          </div>
        </div>

        {/* Notifications Scrollable List */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '12px 18px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map(notif => {
              const accentColor = getAccentColor(notif.type);
              return (
                <div
                  key={notif.id}
                  onClick={() => handleItemClick(notif)}
                  className="interactive-card"
                  style={{
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: notif.isRead ? 'var(--bg-input)' : 'var(--bg-card)',
                    border: `1px solid ${notif.isRead ? 'var(--border-subtle)' : accentColor + '40'}`,
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    cursor: notif.actionTab ? 'pointer' : 'default',
                    position: 'relative'
                  }}
                >
                  {/* Unread dot indicator */}
                  {!notif.isRead && (
                    <div style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      width: '7px',
                      height: '7px',
                      borderRadius: '50%',
                      background: 'var(--primary)',
                      boxShadow: '0 0 8px var(--primary)'
                    }} />
                  )}

                  {/* Icon */}
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: `${accentColor}18`,
                    border: `1px solid ${accentColor}35`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {getIcon(notif.type)}
                  </div>

                  <div style={{ flex: 1, minWidth: 0, paddingRight: notif.isRead ? '0' : '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px', marginBottom: '2px' }}>
                      <div style={{
                        fontWeight: notif.isRead ? 700 : 800,
                        fontSize: '0.84rem',
                        color: 'var(--text-main)'
                      }}>
                        {notif.title}
                      </div>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                        {formatTimeAgo(notif.timestamp)}
                      </span>
                    </div>

                    <div style={{
                      fontSize: '0.75rem',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.35,
                      marginBottom: notif.actionLabel ? '6px' : '0'
                    }}>
                      {notif.message}
                    </div>

                    {notif.actionLabel && (
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        color: accentColor,
                        marginTop: '4px'
                      }}>
                        <span>{notif.actionLabel}</span>
                        <ExternalLink size={10} />
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div style={{
              padding: '40px 20px',
              textAlign: 'center',
              color: 'var(--text-muted)'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🔔</div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)', marginBottom: '4px' }}>
                No notifications right now
              </div>
              <div style={{ fontSize: '0.75rem' }}>
                Place an order or tap "Simulate Order Cycle" to test push notifications.
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '12px 18px',
          borderTop: '1px solid var(--border-subtle)',
          background: 'var(--bg-main)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.72rem',
          color: 'var(--text-muted)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Volume2 size={13} color="var(--primary)" />
            <span>Melodic Chimes Active</span>
          </div>
          <span>CraveCourier Push Engine v2.0</span>
        </div>
      </div>
    </div>
  );
};
