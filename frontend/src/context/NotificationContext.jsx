import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const NotificationContext = createContext(null);

// Web Audio Melodic Chime Synthesizer
const playChimeSound = (type = 'order_placed') => {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const now = ctx.currentTime;

    if (type === 'order_placed') {
      // Upward arpeggio chord (C5 -> E5 -> G5)
      [523.25, 659.25, 783.99].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.08);

        gain.gain.setValueAtTime(0, now + i * 0.08);
        gain.gain.linearRampToValueAtTime(0.18, now + i * 0.08 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.4);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + i * 0.08);
        osc.stop(now + i * 0.08 + 0.45);
      });
    } else if (type === 'out_for_delivery' || type === 'rider') {
      // Energetic double chime (A5 -> D6)
      [880.0, 1174.66].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + i * 0.1);

        gain.gain.setValueAtTime(0, now + i * 0.1);
        gain.gain.linearRampToValueAtTime(0.15, now + i * 0.1 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + i * 0.1);
        osc.stop(now + i * 0.1 + 0.4);
      });
    } else if (type === 'delivered') {
      // Celebratory major chord fanfare (C5 -> G5 -> C6)
      [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.09);

        gain.gain.setValueAtTime(0, now + i * 0.09);
        gain.gain.linearRampToValueAtTime(0.2, now + i * 0.09 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.09 + 0.55);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + i * 0.09);
        osc.stop(now + i * 0.09 + 0.6);
      });
    } else if (type === 'kitchen' || type === 'new_order') {
      // Attention bell chime (F5 -> A5 -> C6)
      [698.46, 880.0, 1046.5].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.07);

        gain.gain.setValueAtTime(0, now + i * 0.07);
        gain.gain.linearRampToValueAtTime(0.22, now + i * 0.07 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.07 + 0.4);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + i * 0.07);
        osc.stop(now + i * 0.07 + 0.45);
      });
    } else {
      // Soft universal ding
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.35);
    }
  } catch (e) {
    console.warn('Web Audio synthesis not available or blocked by autoplay policy:', e);
  }
};

const INITIAL_NOTIFICATIONS = [
  {
    id: 'notif-init-1',
    title: '👋 Welcome to CraveCourier',
    message: 'Push notifications active for live order updates, kitchen progress, and rider GPS.',
    type: 'system',
    category: 'system',
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    isRead: false
  },
  {
    id: 'notif-init-2',
    title: '🛵 Express 25-Min Guarantee',
    message: 'All artisan kitchens are verified with rapid GPS tracking.',
    type: 'delivery',
    category: 'delivery',
    timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    isRead: true
  }
];

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem('crave_notifications');
      return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  });

  const [activeToast, setActiveToast] = useState(null);
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);
  const [browserPermission, setBrowserPermission] = useState(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'unsupported';
  });

  // Save to localStorage whenever notifications change
  useEffect(() => {
    try {
      localStorage.setItem('crave_notifications', JSON.stringify(notifications.slice(0, 50)));
    } catch (e) {
      console.warn('Failed to save notifications:', e);
    }
  }, [notifications]);

  // Check browser Notification permission on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setBrowserPermission(Notification.permission);
    }
  }, []);

  // Request native browser Push Notification permission
  const requestBrowserPermission = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      alert('This browser does not support Web Push Notifications.');
      return 'unsupported';
    }

    try {
      const permission = await Notification.requestPermission();
      setBrowserPermission(permission);
      if (permission === 'granted') {
        dispatchPush({
          title: '🔔 Push Notifications Enabled!',
          message: "You'll receive live order status, kitchen alerts, and rider updates directly on your screen.",
          type: 'system',
          category: 'system'
        });
      }
      return permission;
    } catch (err) {
      console.error('Notification permission error:', err);
      return 'denied';
    }
  };

  // Master Dispatcher: Sends native Browser Push + In-App Toast + Melodic Chime Sound + Saves to history
  const dispatchPush = useCallback(({
    title,
    message,
    type = 'order_placed', // 'order_placed' | 'confirmed' | 'cooking' | 'out_for_delivery' | 'delivered' | 'new_order' | 'system'
    category = 'order', // 'order' | 'delivery' | 'system'
    orderId = null,
    actionLabel = null,
    actionTab = null,
    onAction = null
  }) => {
    const newId = `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newNotification = {
      id: newId,
      title,
      message,
      type,
      category,
      orderId,
      actionLabel,
      actionTab,
      timestamp: new Date().toISOString(),
      isRead: false
    };

    // 1. Play Melodic Chime Sound
    playChimeSound(type);

    // 2. Trigger Real Native Browser Push Notification
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        const nativeNotif = new Notification(title, {
          body: message,
          icon: '/logo.png',
          badge: '/favicon.png',
          tag: orderId || newId,
          silent: false
        });

        nativeNotif.onclick = () => {
          window.focus();
          if (actionTab && typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('crave_navigate_tab', { detail: { tab: actionTab, orderId } }));
          }
          nativeNotif.close();
        };
      } catch (err) {
        console.warn('Native notification trigger fallback:', err);
      }
    }

    // 3. Set In-App Floating Toast
    setActiveToast({
      ...newNotification,
      onAction
    });

    // 4. Append to Notification Center history
    setNotifications(prev => [newNotification, ...prev]);

    return newNotification;
  }, []);

  // Dismiss currently active floating toast
  const dismissToast = useCallback(() => {
    setActiveToast(null);
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  }, []);

  // Mark single notification as read
  const markAsRead = useCallback((id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  }, []);

  // Clear all notifications
  const clearNotifications = useCallback(() => {
    setNotifications([]);
    setActiveToast(null);
  }, []);

  // Quick helper to trigger specific order events
  const triggerOrderNotification = useCallback((event, orderData) => {
    const orderId = orderData?.orderId || orderData?._id || 'ORD-98214';
    const amount = orderData?.total ? `₹${Math.round(orderData.total).toLocaleString('en-IN')}` : '₹849';
    const restName = orderData?.restaurant?.name || 'Artisan Kitchen';

    switch (event) {
      case 'placed':
        dispatchPush({
          title: `🎉 Order Placed (${orderId})`,
          message: `Your payment of ${amount} was confirmed. Sent to ${restName}.`,
          type: 'order_placed',
          category: 'order',
          orderId,
          actionLabel: 'Track Live GPS 🚀',
          actionTab: 'tracking'
        });
        break;

      case 'confirmed':
        dispatchPush({
          title: `👨‍🍳 Order Accepted by ${restName}`,
          message: `Chef has confirmed order ${orderId} and is preparing fresh ingredients.`,
          type: 'confirmed',
          category: 'order',
          orderId,
          actionLabel: 'View Kitchen Tracker ⏱️',
          actionTab: 'tracking'
        });
        break;

      case 'cooking':
      case 'preparing':
        dispatchPush({
          title: `🔥 Sizzling in Kitchen (${orderId})`,
          message: `Your gourmet meal is currently on the stove / woodfired oven.`,
          type: 'cooking',
          category: 'order',
          orderId,
          actionLabel: 'Track Order 🚀',
          actionTab: 'tracking'
        });
        break;

      case 'out_for_delivery':
      case 'dispatched':
        dispatchPush({
          title: `🛵 Rider Dispatched (${orderId})`,
          message: `Delivery partner Rajesh has picked up your food. Estimated arrival: 18 mins.`,
          type: 'out_for_delivery',
          category: 'delivery',
          orderId,
          actionLabel: 'Watch Live Map 📍',
          actionTab: 'tracking'
        });
        break;

      case 'delivered':
        dispatchPush({
          title: `✅ Order Delivered (${orderId})`,
          message: `Your hot gourmet meal has arrived! Enjoy your food and rate your experience.`,
          type: 'delivered',
          category: 'delivery',
          orderId,
          actionLabel: 'Order Again 🍽️',
          actionTab: 'menu'
        });
        break;

      case 'new_order_admin':
        dispatchPush({
          title: `🔔 New Kitchen Order (${orderId})`,
          message: `New gourmet order of ${amount} received from ${orderData?.user?.name || 'Customer'}. Tap to accept.`,
          type: 'new_order',
          category: 'order',
          orderId,
          actionLabel: 'Open Kitchen Hub 👨‍🍳',
          actionTab: 'admin'
        });
        break;

      default:
        dispatchPush({
          title: `🔔 Order Update (${orderId})`,
          message: `Status updated to: ${event}`,
          type: 'system',
          category: 'order',
          orderId,
          actionLabel: 'Track Order',
          actionTab: 'tracking'
        });
    }
  }, [dispatchPush]);

  // Test Simulator helper: iterates through an entire delivery cycle with push alerts & sounds
  const triggerTestPipeline = useCallback(() => {
    const testOrderId = `ORD-${Math.floor(10000 + Math.random() * 90000)}`;

    dispatchPush({
      title: `🎉 Order Placed (${testOrderId})`,
      message: 'Payment of ₹1,149 verified. Order sent to Bella Napoli Artisan Pizzeria.',
      type: 'order_placed',
      category: 'order',
      orderId: testOrderId,
      actionLabel: 'Track Order 🚀',
      actionTab: 'tracking'
    });

    setTimeout(() => {
      dispatchPush({
        title: `👨‍🍳 Chef Accepted (${testOrderId})`,
        message: 'Head Chef Mario has started rolling artisan sourdough dough.',
        type: 'confirmed',
        category: 'order',
        orderId: testOrderId,
        actionLabel: 'Track Status ⏱️',
        actionTab: 'tracking'
      });
    }, 4500);

    setTimeout(() => {
      dispatchPush({
        title: `🔥 Baking in Woodfired Oven (${testOrderId})`,
        message: 'Your Truffle Mushroom Pizza is baking at 450°C in oak wood oven.',
        type: 'cooking',
        category: 'order',
        orderId: testOrderId,
        actionLabel: 'View Kitchen 🍕',
        actionTab: 'tracking'
      });
    }, 9000);

    setTimeout(() => {
      dispatchPush({
        title: `🛵 Delivery Partner Dispatched (${testOrderId})`,
        message: 'Rider Rajesh picked up your hot thermal box. Navigating to your address.',
        type: 'out_for_delivery',
        category: 'delivery',
        orderId: testOrderId,
        actionLabel: 'Track Live GPS 📍',
        actionTab: 'tracking'
      });
    }, 13500);

    setTimeout(() => {
      dispatchPush({
        title: `✅ Order Delivered (${testOrderId})`,
        message: 'Your hot gourmet pizza has arrived at your door! Bon Appétit!',
        type: 'delivered',
        category: 'delivery',
        orderId: testOrderId,
        actionLabel: 'Order Again 🍽️',
        actionTab: 'menu'
      });
    }, 18000);
  }, [dispatchPush]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      activeToast,
      isNotificationCenterOpen,
      setIsNotificationCenterOpen,
      browserPermission,
      requestBrowserPermission,
      dispatchPush,
      dismissToast,
      markAllAsRead,
      markAsRead,
      clearNotifications,
      triggerOrderNotification,
      triggerTestPipeline
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
