import React, { useState, useEffect } from 'react';
import { X, Clock, ShoppingBag, ArrowRight, RotateCcw, MapPin, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';
import { useCart } from '../context/CartContext';

export const UserOrdersModal = ({ isOpen, onClose, onTrackOrder }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart, setIsCartOpen } = useCart();

  useEffect(() => {
    if (isOpen) {
      fetchOrders();
    }
  }, [isOpen]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await api.getMyOrders();
      setOrders(data || []);
    } catch (err) {
      console.error('Failed to fetch user orders:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleReorder = (order) => {
    order.items?.forEach(item => {
      addToCart(item, item.quantity || 1, item.selectedOptions || {});
    });
    onClose();
    setIsCartOpen(true);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="glass-panel animate-modal"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '640px',
          maxHeight: '85vh',
          borderRadius: 'var(--radius-xl)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-card)'
        }}
      >
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>My Past Orders</h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Review past feasts or reorder in one click</p>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-sm" style={{ padding: '6px' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: '24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>Loading past orders...</div>
          ) : orders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <Clock size={40} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
              <h4>No Past Orders Yet</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Your delicious history will appear here once you place an order.</p>
            </div>
          ) : (
            orders.map((order) => (
              <div
                key={order.orderId || order._id}
                style={{
                  background: 'var(--bg-elevated)',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 800, fontSize: '0.95rem' }}>#{order.orderId || order._id}</span>
                      <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>
                        {order.orderStatus}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {new Date(order.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>

                  <div style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--primary)' }}>
                    ₹{order.total?.toFixed(2) || order.total}
                  </div>
                </div>

                {/* Items Summary */}
                <div style={{
                  padding: '10px 12px',
                  background: 'var(--bg-input)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.82rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}>
                  {order.items?.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>{item.quantity}x {item.name}</span>
                      <span style={{ fontWeight: 700 }}>₹{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button
                    onClick={() => {
                      onClose();
                      onTrackOrder(order.orderId || order._id);
                    }}
                    className="btn btn-secondary btn-sm"
                  >
                    <Clock size={14} /> Track Order
                  </button>

                  <button
                    onClick={() => handleReorder(order)}
                    className="btn btn-primary btn-sm"
                  >
                    <RotateCcw size={14} /> Reorder
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
