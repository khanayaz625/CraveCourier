import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Phone, 
  MessageSquare, 
  Bike, 
  Store, 
  Sparkles, 
  ChevronRight, 
  RefreshCw,
  Receipt,
  Share2,
  AlertTriangle,
  Flame,
  ChefHat,
  XCircle,
  RotateCcw,
  ShieldCheck,
  Check,
  Timer,
  Zap,
  ArrowRight,
  HelpCircle
} from 'lucide-react';
import { api } from '../services/api';
import { useNotification } from '../context/NotificationContext';

export const OrderTrackingView = ({ orderId, onBackToMenu, onReorder }) => {
  const { triggerOrderNotification } = useNotification();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCallModal, setShowCallModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showCancelConfirmModal, setShowCancelConfirmModal] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [chatLog, setChatLog] = useState([
    { sender: 'driver', text: 'Hi! I picked up your fresh hot order. Navigating to your address now!', time: 'Just now' }
  ]);

  // Live Elapsed / Countdown Timer State
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      if (orderId) {
        const data = await api.getOrderById(orderId);
        setOrder(data);
      } else {
        const myOrders = await api.getMyOrders();
        if (myOrders && myOrders.length > 0) {
          setOrder(myOrders[0]);
        } else {
          const data = await api.getOrderById('ORD-98214');
          setOrder(data);
        }
      }
    } catch (err) {
      console.error('Failed to fetch order:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  // Live timer tick
  useEffect(() => {
    if (!order || order.orderStatus === 'Delivered' || order.orderStatus === 'Cancelled') return;
    const interval = setInterval(() => {
      setElapsedSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [order?.orderStatus]);

  // Change order status (Preparing, Out for Delivery, Delivered, Cancelled)
  const handleSetStatus = async (newStatus) => {
    if (!order) return;
    try {
      const updated = await api.updateOrderStatus(order.orderId || order._id, newStatus);
      setOrder(updated);

      // Trigger rich push notification and sound chime
      const eventKey = newStatus.toLowerCase().replace(/\s+/g, '_');
      triggerOrderNotification(eventKey, updated);
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageInput.trim()) return;
    const newMsg = { sender: 'user', text: messageInput, time: 'Just now' };
    setChatLog(prev => [...prev, newMsg]);
    setMessageInput('');

    setTimeout(() => {
      setChatLog(prev => [
        ...prev,
        { sender: 'driver', text: 'Got it! I will be at your lobby in ~5 minutes with your food warm.', time: 'Just now' }
      ]);
    }, 1500);
  };

  if (loading) {
    return (
      <div style={{ padding: '60px 0', textAlign: 'center' }}>
        <div style={{
          width: '50px',
          height: '50px',
          borderRadius: '50%',
          border: '3px solid var(--border-subtle)',
          borderTopColor: 'var(--primary)',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 20px auto'
        }} />
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Calculating Order Timeline & ETAs...</h3>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', borderRadius: 'var(--radius-lg)' }}>
        <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🍽️</div>
        <h3 style={{ fontSize: '1.4rem', fontWeight: 800 }}>No Active Orders Found</h3>
        <p style={{ color: 'var(--text-secondary)', margin: '10px 0 20px' }}>Place a delicious gourmet order to track live times and delivery stages!</p>
        <button onClick={onBackToMenu} className="btn btn-primary">Browse Gourmet Menu</button>
      </div>
    );
  }

  const currentStatus = order.orderStatus || 'Confirmed';
  const isCancelled = currentStatus === 'Cancelled';
  const isDelivered = currentStatus === 'Delivered';
  const isOutForDelivery = currentStatus === 'Out for Delivery' || currentStatus === 'Picked Up';
  const isPreparing = currentStatus === 'Preparing' || currentStatus === 'Cooking';
  const isConfirmed = currentStatus === 'Confirmed' || currentStatus === 'Pending';

  // Duration calculations
  const stageDurations = {
    placed: { label: 'Order Confirmed', time: '2 Mins', actual: 'Verified at ' + new Date(order.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
    prep: { label: 'Kitchen Prep & Cooking', time: '12-15 Mins', actual: isConfirmed ? 'Estimated: 12 mins' : 'Completed in 11 mins' },
    transit: { label: 'Rider Pickup & Transit', time: '10-12 Mins', actual: isDelivered ? 'Completed in 9 mins' : 'Estimated arrival in 8 mins' },
    delivered: { label: 'Delivered to Doorstep', time: 'Total: 25-30 Mins', actual: isDelivered ? 'Delivered on time' : 'Express 25-Min Guarantee' }
  };

  const getProgressPercentage = () => {
    if (isCancelled) return 100;
    if (isDelivered) return 100;
    if (isOutForDelivery) return 75;
    if (isPreparing) return 45;
    return 15;
  };

  return (
    <div className="animate-fade" style={{ paddingBottom: '60px' }}>
      
      {/* Top Banner & Title Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '20px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className={`badge ${isCancelled ? 'badge-nonveg' : isDelivered ? 'badge-veg' : 'badge-primary'}`}>
              {isCancelled ? '❌ CANCELLED' : isDelivered ? '✅ DELIVERED' : '⏱️ LIVE TRACKING'}
            </span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Order #{order.orderId || order._id}
            </span>
          </div>

          <h1 style={{ fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.02em' }}>
            {isCancelled && 'Order Cancelled & Refund Initiated'}
            {isDelivered && 'Delivered! Bon Appétit 🍕'}
            {isOutForDelivery && 'Rider on the Way (~10 Mins ETA) 🛵'}
            {isPreparing && 'Chef Sizzling in Kitchen (~12 Mins Prep) 🔥'}
            {isConfirmed && 'Order Accepted by Kitchen (~25 Mins Total) 👨‍🍳'}
          </h1>
        </div>

        {/* Quick Stage Simulator Switcher */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: 'var(--bg-card)',
          padding: '4px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
          flexWrap: 'wrap'
        }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 800, padding: '0 6px', textTransform: 'uppercase' }}>
            Stage:
          </span>

          <button
            type="button"
            onClick={() => handleSetStatus('Preparing')}
            style={{
              padding: '6px 10px',
              borderRadius: '6px',
              border: 'none',
              background: isPreparing ? 'var(--primary-gradient)' : 'transparent',
              color: isPreparing ? '#fff' : 'var(--text-muted)',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Flame size={13} /> Preparing (12m)
          </button>

          <button
            type="button"
            onClick={() => handleSetStatus('Out for Delivery')}
            style={{
              padding: '6px 10px',
              borderRadius: '6px',
              border: 'none',
              background: isOutForDelivery ? '#3B82F6' : 'transparent',
              color: isOutForDelivery ? '#fff' : 'var(--text-muted)',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Bike size={13} /> Out for Delivery (10m)
          </button>

          <button
            type="button"
            onClick={() => handleSetStatus('Delivered')}
            style={{
              padding: '6px 10px',
              borderRadius: '6px',
              border: 'none',
              background: isDelivered ? 'var(--veg-color)' : 'transparent',
              color: isDelivered ? '#fff' : 'var(--text-muted)',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <CheckCircle2 size={13} /> Delivered
          </button>

          <button
            type="button"
            onClick={() => handleSetStatus('Cancelled')}
            style={{
              padding: '6px 10px',
              borderRadius: '6px',
              border: 'none',
              background: isCancelled ? '#EF4444' : 'transparent',
              color: isCancelled ? '#fff' : 'var(--text-muted)',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <XCircle size={13} /> Cancelled
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* HERO TIME & STAGE BREAKDOWN DASHBOARD (REPLACED MAP) */}
      {/* ========================================================================= */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1.35fr) minmax(0, 0.65fr)',
        gap: '24px',
        marginBottom: '24px'
      }} className="tracking-grid">
        
        {/* Left: Interactive Order Timing & Progress Engine */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Main Stage & Time Banner Box */}
          <div className="glass-panel" style={{
            padding: '24px 28px',
            borderRadius: 'var(--radius-xl)',
            border: isCancelled ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid var(--border-subtle)',
            background: isCancelled 
              ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.12) 0%, rgba(15, 23, 42, 0.95) 100%)'
              : 'linear-gradient(135deg, rgba(255, 94, 30, 0.1) 0%, rgba(15, 23, 42, 0.95) 100%)',
            boxShadow: 'var(--shadow-card)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Top Status Header & ETA Pill */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: isCancelled ? '#EF4444' : 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  {isCancelled ? 'ORDER STATUS' : 'LIVE DELIVERY ESTIMATE'}
                </span>
                <div style={{ fontSize: '1.75rem', fontWeight: 900, marginTop: '2px' }}>
                  {isCancelled && <span style={{ color: '#EF4444' }}>Cancelled & Refunded</span>}
                  {isDelivered && <span style={{ color: 'var(--veg-color)' }}>Delivered in 24 Mins</span>}
                  {isOutForDelivery && <span style={{ color: '#3B82F6' }}>Arriving in ~8-12 Mins</span>}
                  {isPreparing && <span style={{ color: 'var(--primary)' }}>Cooking: ~12-15 Mins Prep</span>}
                  {isConfirmed && <span>Kitchen Queue: ~25 Mins Total</span>}
                </div>
              </div>

              {/* Big Timer Clock Badge */}
              <div style={{
                padding: '10px 18px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                boxShadow: 'var(--shadow-subtle)'
              }}>
                <Timer size={22} color={isCancelled ? '#EF4444' : isDelivered ? 'var(--veg-color)' : 'var(--primary)'} />
                <div>
                  <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                    {isCancelled ? 'REFUND STATUS' : isDelivered ? 'TOTAL TIME' : 'TIME REMAINING'}
                  </div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 900, fontFamily: 'var(--font-heading)' }}>
                    {isCancelled && '100% Refunded'}
                    {isDelivered && '24m 18s'}
                    {isOutForDelivery && '09m 45s'}
                    {isPreparing && '14m 20s'}
                    {isConfirmed && '25m 00s'}
                  </div>
                </div>
              </div>
            </div>

            {/* Visual Multi-Segment Progress Bar */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.75rem',
                fontWeight: 700,
                color: 'var(--text-secondary)',
                marginBottom: '8px'
              }}>
                <span>Order Journey Progress</span>
                <span>{getProgressPercentage()}% Completed</span>
              </div>
              <div style={{
                height: '8px',
                width: '100%',
                background: 'var(--bg-elevated)',
                borderRadius: '999px',
                overflow: 'hidden'
              }}>
                <div style={{
                  height: '100%',
                  width: `${getProgressPercentage()}%`,
                  background: isCancelled ? '#EF4444' : isDelivered ? 'var(--secondary-gradient)' : 'var(--primary-gradient)',
                  transition: 'width 0.4s ease'
                }} />
              </div>
            </div>

            {/* 4-Stage Time Breakdown Cards Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '12px'
            }}>
              {/* Step 1: Confirmed */}
              <div style={{
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                background: isConfirmed || isPreparing || isOutForDelivery || isDelivered ? 'var(--bg-elevated)' : 'var(--bg-input)',
                border: isConfirmed ? '1px solid var(--primary)' : '1px solid var(--border-subtle)',
                position: 'relative'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 800 }}>
                    <CheckCircle2 size={15} color="var(--primary)" />
                    <span>1. Placed</span>
                  </div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--primary)' }}>2 mins</span>
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                  {stageDurations.placed.actual}
                </div>
              </div>

              {/* Step 2: Preparing */}
              <div style={{
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                background: isPreparing ? 'rgba(255, 94, 30, 0.15)' : isOutForDelivery || isDelivered ? 'var(--bg-elevated)' : 'var(--bg-input)',
                border: isPreparing ? '1px solid var(--primary)' : '1px solid var(--border-subtle)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 800 }}>
                    <ChefHat size={15} color={isPreparing ? 'var(--primary)' : isOutForDelivery || isDelivered ? 'var(--veg-color)' : 'var(--text-muted)'} />
                    <span>2. Kitchen Prep</span>
                  </div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--primary)' }}>12-15 mins</span>
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                  {stageDurations.prep.actual}
                </div>
              </div>

              {/* Step 3: Out for Delivery */}
              <div style={{
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                background: isOutForDelivery ? 'rgba(59, 130, 246, 0.15)' : isDelivered ? 'var(--bg-elevated)' : 'var(--bg-input)',
                border: isOutForDelivery ? '1px solid #3B82F6' : '1px solid var(--border-subtle)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 800 }}>
                    <Bike size={15} color={isOutForDelivery ? '#3B82F6' : isDelivered ? 'var(--veg-color)' : 'var(--text-muted)'} />
                    <span>3. Transit</span>
                  </div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#3B82F6' }}>10-12 mins</span>
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                  {stageDurations.transit.actual}
                </div>
              </div>

              {/* Step 4: Delivered / Cancelled */}
              <div style={{
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                background: isCancelled ? 'rgba(239, 68, 68, 0.15)' : isDelivered ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-input)',
                border: isCancelled ? '1px solid #EF4444' : isDelivered ? '1px solid var(--veg-color)' : '1px solid var(--border-subtle)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 800 }}>
                    {isCancelled ? <XCircle size={15} color="#EF4444" /> : <CheckCircle2 size={15} color={isDelivered ? 'var(--veg-color)' : 'var(--text-muted)'} />}
                    <span>{isCancelled ? '4. Cancelled' : '4. Delivered'}</span>
                  </div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: isCancelled ? '#EF4444' : 'var(--veg-color)' }}>
                    {isCancelled ? 'Refunded' : '25 mins'}
                  </span>
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                  {isCancelled ? '₹' + order.total + ' refunded to source' : stageDurations.delivered.actual}
                </div>
              </div>
            </div>
          </div>

          {/* Cancelled State Explainer Card (shown when order is cancelled) */}
          {isCancelled && (
            <div className="glass-panel" style={{
              padding: '20px 24px',
              borderRadius: 'var(--radius-lg)',
              background: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.3)'
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: 'rgba(239, 68, 68, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#EF4444',
                  flexShrink: 0
                }}>
                  <XCircle size={22} />
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#EF4444', marginBottom: '4px' }}>
                    Order Cancelled & Instant Refund Initiated
                  </h4>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.45, marginBottom: '12px' }}>
                    Your order #{order.orderId || order._id} was cancelled. A 100% full refund of <strong>₹{order.total}</strong> has been sent to your {order.paymentMethod || 'Original Payment Source'} and will settle in 1–2 hours.
                  </p>
                  <button
                    onClick={onBackToMenu}
                    className="btn btn-primary btn-sm"
                    style={{ gap: '6px' }}
                  >
                    <RotateCcw size={14} /> Re-Order Fresh Dishes →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Kitchen Preparation & Chef Details */}
          <div className="glass-panel" style={{
            padding: '22px 24px',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-subtle)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--veg-color)'
                }}>
                  <Store size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>
                    {order.restaurant?.name || 'Bella Napoli Artisan Pizzeria'}
                  </h3>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {order.restaurant?.address || '142 Little Italy Way, Indiranagar'}
                  </div>
                </div>
              </div>

              <span className="badge badge-veg" style={{ fontSize: '0.7rem' }}>
                HYGIENE VERIFIED
              </span>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '12px',
              padding: '12px',
              background: 'var(--bg-input)',
              borderRadius: 'var(--radius-md)'
            }}>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>PREPARATION STAGE</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '2px' }}>
                  {isCancelled ? 'Stopped' : isDelivered ? 'Completed' : isOutForDelivery ? 'Handed to Rider' : 'Sizzling in Oven'}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>COOKING DURATION</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary)', marginTop: '2px' }}>
                  ~12 Minutes Average
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>INSULATED PACKAGING</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--veg-color)', marginTop: '2px' }}>
                  Thermal Foil Sealed 🔥
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Driver Profile, Destination & Receipt Breakdown */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Driver Contact Card */}
          {!isCancelled && (
            <div className="glass-panel" style={{
              padding: '20px',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-subtle)'
            }}>
              <div style={{ fontSize: '0.74rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '0.05em' }}>
                🛵 Assigned Courier Partner
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
                <img
                  src={order.driverInfo?.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                  alt="Driver"
                  style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '2px solid var(--primary)'
                  }}
                />
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 800 }}>{order.driverInfo?.name || 'Rajesh Varma'}</h4>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{order.driverInfo?.vehicle || 'Electric Scooter (KA-04-E-8821)'}</div>
                  <div style={{ fontSize: '0.76rem', color: '#F59E0B', fontWeight: 700 }}>⭐ 4.96 Rating (2,850+ trips)</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <button
                  onClick={() => setShowCallModal(true)}
                  className="btn btn-secondary btn-sm"
                  style={{ justifyContent: 'center' }}
                >
                  <Phone size={15} color="var(--primary)" />
                  <span>Call Rider</span>
                </button>

                <button
                  onClick={() => setShowMessageModal(true)}
                  className="btn btn-primary btn-sm"
                  style={{ justifyContent: 'center' }}
                >
                  <MessageSquare size={15} />
                  <span>Message</span>
                </button>
              </div>
            </div>
          )}

          {/* Delivery Destination */}
          <div className="glass-panel" style={{
            padding: '20px',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-subtle)'
          }}>
            <div style={{ fontSize: '0.74rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
              📍 Delivery Destination
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <MapPin size={18} color="var(--primary)" style={{ marginTop: '2px', flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>{order.deliveryAddress?.street || 'Indiranagar, 100ft Road'}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{order.deliveryAddress?.city || 'Bengaluru'}</div>
                {order.deliveryAddress?.instructions && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px', fontStyle: 'italic' }}>
                    "{order.deliveryAddress.instructions}"
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Order Items & Receipt */}
          <div className="glass-panel" style={{
            padding: '20px',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-subtle)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '0.74rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                🧾 Receipt Summary
              </span>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--primary)' }}>
                {order.paymentMethod || 'Paid Online'}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
              {order.items?.map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem' }}>
                  <span>{item.quantity}x {item.name}</span>
                  <span style={{ fontWeight: 700 }}>₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>

            <div style={{
              paddingTop: '10px',
              borderTop: '1px solid var(--border-subtle)',
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '1.05rem',
              fontWeight: 900
            }}>
              <span>Total Paid</span>
              <span className="gradient-text">₹{order.total}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Simulated Call Modal */}
      {showCallModal && (
        <div className="modal-overlay" onClick={() => setShowCallModal(false)}>
          <div className="glass-panel animate-modal" onClick={(e) => e.stopPropagation()} style={{
            maxWidth: '360px',
            padding: '30px',
            textAlign: 'center',
            borderRadius: 'var(--radius-xl)',
            background: 'var(--bg-card)'
          }}>
            <div style={{
              width: '70px',
              height: '70px',
              borderRadius: '50%',
              background: '#10B981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              color: '#fff',
              animation: 'pulseGlow 1.5s infinite'
            }}>
              <Phone size={32} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Calling Rajesh Varma...</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', margin: '8px 0 20px' }}>
              Connecting through CraveCourier Number Masking VoIP
            </p>
            <button onClick={() => setShowCallModal(false)} className="btn btn-secondary" style={{ width: '100%' }}>
              End Call
            </button>
          </div>
        </div>
      )}

      {/* Simulated Message Modal */}
      {showMessageModal && (
        <div className="modal-overlay" onClick={() => setShowMessageModal(false)}>
          <div className="glass-panel animate-modal" onClick={(e) => e.stopPropagation()} style={{
            width: '100%',
            maxWidth: '440px',
            height: '480px',
            borderRadius: 'var(--radius-xl)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            background: 'var(--bg-card)'
          }}>
            <div style={{
              padding: '16px',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10B981' }} />
                <span style={{ fontWeight: 800, fontSize: '0.95rem' }}>Chat with Rider Rajesh</span>
              </div>
              <button onClick={() => setShowMessageModal(false)} className="btn btn-ghost btn-sm" style={{ padding: '4px' }}>✕</button>
            </div>

            <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {chatLog.map((msg, i) => (
                <div
                  key={i}
                  style={{
                    alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '80%',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: msg.sender === 'user' ? 'var(--primary-gradient)' : 'var(--bg-elevated)',
                    color: '#fff',
                    fontSize: '0.85rem'
                  }}
                >
                  <div>{msg.text}</div>
                  <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.6)', marginTop: '4px', textAlign: 'right' }}>
                    {msg.time}
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendMessage} style={{ padding: '12px', borderTop: '1px solid var(--border-subtle)', display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Type a message to rider..."
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-full)',
                  color: 'var(--text-main)',
                  fontSize: '0.85rem',
                  outline: 'none'
                }}
              />
              <button type="submit" className="btn btn-primary btn-sm" style={{ borderRadius: 'var(--radius-full)' }}>
                Send
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
