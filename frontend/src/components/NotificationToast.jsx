import React, { useEffect, useState } from 'react';
import { 
  X, 
  Sparkles, 
  Bell, 
  ChefHat, 
  Bike, 
  CheckCircle2, 
  Flame, 
  Clock, 
  Volume2,
  ArrowRight
} from 'lucide-react';
import { useNotification } from '../context/NotificationContext';

export const NotificationToast = ({ onNavigateTab }) => {
  const { activeToast, dismissToast } = useNotification();
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!activeToast) return;

    setProgress(100);
    const duration = 6500; // 6.5 seconds auto-dismiss
    const intervalTime = 50;
    const step = 100 / (duration / intervalTime);

    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev <= 0) {
          clearInterval(timer);
          dismissToast();
          return 0;
        }
        return prev - step;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [activeToast, dismissToast]);

  if (!activeToast) return null;

  const getIcon = () => {
    switch (activeToast.type) {
      case 'order_placed':
        return <Sparkles size={20} color="#FF5E1E" />;
      case 'confirmed':
        return <ChefHat size={20} color="#10B981" />;
      case 'cooking':
        return <Flame size={20} color="#F59E0B" />;
      case 'out_for_delivery':
      case 'rider':
        return <Bike size={20} color="#3B82F6" />;
      case 'delivered':
        return <CheckCircle2 size={20} color="#10B981" />;
      case 'new_order':
        return <Bell size={20} color="#8B5CF6" />;
      default:
        return <Bell size={20} color="#FF5E1E" />;
    }
  };

  const getAccentColor = () => {
    switch (activeToast.type) {
      case 'order_placed': return '#FF5E1E';
      case 'confirmed': return '#10B981';
      case 'cooking': return '#F59E0B';
      case 'out_for_delivery': return '#3B82F6';
      case 'delivered': return '#10B981';
      case 'new_order': return '#8B5CF6';
      default: return '#FF5E1E';
    }
  };

  const accentColor = getAccentColor();

  const handleActionClick = () => {
    if (activeToast.onAction) {
      activeToast.onAction();
    } else if (activeToast.actionTab && onNavigateTab) {
      onNavigateTab(activeToast.actionTab, activeToast.orderId);
    }
    dismissToast();
  };

  return (
    <div
      className="animate-fade"
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 9999,
        maxWidth: '420px',
        width: 'calc(100vw - 32px)',
        borderRadius: 'var(--radius-md)',
        background: 'var(--bg-glass)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: `1px solid ${accentColor}55`,
        boxShadow: `0 12px 35px -5px rgba(0, 0, 0, 0.5), 0 0 20px ${accentColor}33`,
        overflow: 'hidden',
        cursor: 'default'
      }}
    >
      {/* Top Countdown Progress Bar */}
      <div style={{
        height: '3px',
        width: `${progress}%`,
        background: `linear-gradient(90deg, ${accentColor}, #FFA133)`,
        transition: 'width 0.05s linear'
      }} />

      <div style={{ padding: '14px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          {/* Icon Badge */}
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: `${accentColor}20`,
            border: `1px solid ${accentColor}40`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            {getIcon()}
          </div>

          {/* Text Content */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '2px' }}>
              <div style={{
                fontWeight: 800,
                fontSize: '0.92rem',
                color: 'var(--text-main)',
                letterSpacing: '-0.01em',
                lineHeight: 1.3
              }}>
                {activeToast.title}
              </div>
              <span style={{
                fontSize: '0.65rem',
                fontWeight: 700,
                padding: '2px 6px',
                borderRadius: '999px',
                background: `${accentColor}25`,
                color: accentColor,
                whiteSpace: 'nowrap'
              }}>
                LIVE PUSH
              </span>
            </div>

            <div style={{
              fontSize: '0.78rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.4,
              marginBottom: '10px'
            }}>
              {activeToast.message}
            </div>

            {/* Action Bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {activeToast.actionLabel && (
                <button
                  type="button"
                  onClick={handleActionClick}
                  className="btn btn-primary btn-sm"
                  style={{
                    padding: '5px 12px',
                    fontSize: '0.76rem',
                    borderRadius: 'var(--radius-sm)',
                    fontWeight: 700,
                    gap: '4px'
                  }}
                >
                  <span>{activeToast.actionLabel}</span>
                  <ArrowRight size={12} />
                </button>
              )}

              <button
                type="button"
                onClick={dismissToast}
                className="btn btn-ghost btn-sm"
                style={{
                  padding: '5px 10px',
                  fontSize: '0.74rem',
                  color: 'var(--text-muted)'
                }}
              >
                Dismiss
              </button>
            </div>
          </div>

          {/* Close X Button */}
          <button
            type="button"
            onClick={dismissToast}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '2px',
              borderRadius: '4px'
            }}
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
