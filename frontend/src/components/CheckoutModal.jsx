import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  CreditCard, 
  Wallet, 
  QrCode, 
  Banknote, 
  Clock, 
  ShieldCheck, 
  Sparkles,
  CheckCircle2,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useLocation } from '../context/LocationContext';
import { api } from '../services/api';

export const CheckoutModal = ({ onOrderPlaced }) => {
  const { 
    cartItems, 
    subtotal, 
    tax, 
    deliveryFee, 
    discount, 
    total, 
    appliedCoupon, 
    clearCart, 
    isCheckoutOpen, 
    setIsCheckoutOpen,
    activeRestaurant
  } = useCart();

  const { user, setIsAuthModalOpen } = useAuth();
  const { currentLocation } = useLocation();

  const [step, setStep] = useState(1); // 1: Address & Time, 2: Payment & Confirm
  const [deliverySpeed, setDeliverySpeed] = useState('fast'); // 'fast' | 'eco'
  const [deliveryAddress, setDeliveryAddress] = useState({
    street: currentLocation.address || 'Flat 402, Palm Heights, Indiranagar',
    city: currentLocation.city || 'Bengaluru',
    instructions: 'Leave at security desk or ring bell',
    phone: user?.phone || '+91 91234 56789'
  });

  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [cardDetails, setCardDetails] = useState({
    number: '•••• •••• •••• 4242',
    name: user?.name || 'Aarav Sharma',
    expiry: '08/28',
    cvv: '921'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isCheckoutOpen) return null;

  const handlePlaceOrder = async () => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    if (!deliveryAddress.street) {
      setErrorMsg('Please enter your delivery street address');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const orderPayload = {
        items: cartItems.map(item => ({
          id: item.id || item._id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
          selectedOptions: item.selectedOptions
        })),
        restaurant: activeRestaurant || {
          id: 'rest-1',
          name: 'Bella Napoli Artisan Pizzeria',
          address: '142 Little Italy Way, Downtown'
        },
        deliveryAddress,
        paymentMethod: paymentMethod === 'card' ? 'Credit Card' : paymentMethod === 'upi' ? 'UPI / QR' : paymentMethod === 'applepay' ? 'Apple Pay' : 'Cash on Delivery',
        couponCode: appliedCoupon?.code
      };

      const newOrder = await api.createOrder(orderPayload);

      // Trigger Confetti Explosion
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });
      } catch (e) {
        console.log('Confetti triggered');
      }

      clearCart();
      setIsCheckoutOpen(false);
      if (onOrderPlaced) {
        onOrderPlaced(newOrder);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={() => setIsCheckoutOpen(false)}>
      <div
        className="glass-panel animate-modal"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '620px',
          maxHeight: '92vh',
          borderRadius: 'var(--radius-xl)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-card)',
          border: '1px solid var(--border-subtle)',
          background: 'var(--bg-main)'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-card)'
        }}>
          <div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Complete Your Feast Order</h3>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Step {step} of 2 • {step === 1 ? 'Delivery Information' : 'Payment & Authorization'}
            </div>
          </div>

          <button
            onClick={() => setIsCheckoutOpen(false)}
            className="btn btn-ghost btn-sm"
            style={{ padding: '6px' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Steps Content */}
        <div style={{
          padding: '24px',
          overflowY: 'auto',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          {errorMsg && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid var(--nonveg-color)',
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              color: 'var(--nonveg-color)',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <AlertCircle size={18} />
              <span>{errorMsg}</span>
            </div>
          )}

          {step === 1 ? (
            /* STEP 1: DELIVERY ADDRESS & SPEED */
            <>
              {/* Delivery Speed Options */}
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '10px' }}>
                  Delivery Speed
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div
                    onClick={() => setDeliverySpeed('fast')}
                    style={{
                      padding: '14px',
                      borderRadius: 'var(--radius-md)',
                      background: deliverySpeed === 'fast' ? 'rgba(255, 94, 30, 0.1)' : 'var(--bg-elevated)',
                      border: deliverySpeed === 'fast' ? '1.5px solid var(--primary)' : '1px solid var(--border-subtle)',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <Clock size={16} color="var(--primary)" />
                      <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>⚡ Priority Express</span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Estimated: 20-30 mins</div>
                  </div>

                  <div
                    onClick={() => setDeliverySpeed('eco')}
                    style={{
                      padding: '14px',
                      borderRadius: 'var(--radius-md)',
                      background: deliverySpeed === 'eco' ? 'rgba(16, 185, 129, 0.1)' : 'var(--bg-elevated)',
                      border: deliverySpeed === 'eco' ? '1.5px solid var(--veg-color)' : '1px solid var(--border-subtle)',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <Sparkles size={16} color="var(--veg-color)" />
                      <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>🌱 Standard Eco</span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Estimated: 35-45 mins</div>
                  </div>
                </div>
              </div>

              {/* Delivery Address Fields */}
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '10px' }}>
                  Delivery Address & Details
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Street Address & Apartment</label>
                    <input
                      type="text"
                      value={deliveryAddress.street}
                      onChange={(e) => setDeliveryAddress({ ...deliveryAddress, street: e.target.value })}
                      placeholder="e.g. 42 Baker Street, Apt 3B"
                      style={{
                        width: '100%',
                        padding: '11px 14px',
                        background: 'var(--bg-input)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-md)',
                        color: 'var(--text-main)',
                        fontSize: '0.9rem',
                        marginTop: '4px',
                        outline: 'none'
                      }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>City / Area</label>
                      <input
                        type="text"
                        value={deliveryAddress.city}
                        onChange={(e) => setDeliveryAddress({ ...deliveryAddress, city: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '11px 14px',
                          background: 'var(--bg-input)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: 'var(--radius-md)',
                          color: 'var(--text-main)',
                          fontSize: '0.9rem',
                          marginTop: '4px',
                          outline: 'none'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Contact Phone</label>
                      <input
                        type="text"
                        value={deliveryAddress.phone}
                        onChange={(e) => setDeliveryAddress({ ...deliveryAddress, phone: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '11px 14px',
                          background: 'var(--bg-input)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: 'var(--radius-md)',
                          color: 'var(--text-main)',
                          fontSize: '0.9rem',
                          marginTop: '4px',
                          outline: 'none'
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Driver Drop-Off Instructions</label>
                    <input
                      type="text"
                      value={deliveryAddress.instructions}
                      onChange={(e) => setDeliveryAddress({ ...deliveryAddress, instructions: e.target.value })}
                      placeholder="e.g. Ring bell, gate code #4920, leave at porch"
                      style={{
                        width: '100%',
                        padding: '11px 14px',
                        background: 'var(--bg-input)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-md)',
                        color: 'var(--text-main)',
                        fontSize: '0.9rem',
                        marginTop: '4px',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* STEP 2: PAYMENT METHOD */
            <>
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '10px' }}>
                  Select Payment Method
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '18px' }}>
                  {[
                    { id: 'upi', label: 'UPI / Google Pay / PhonePe', icon: <QrCode size={18} /> },
                    { id: 'card', label: 'Credit / Debit / RuPay', icon: <CreditCard size={18} /> },
                    { id: 'netbanking', label: 'Net Banking', icon: <Wallet size={18} /> },
                    { id: 'cod', label: 'Cash on Delivery', icon: <Banknote size={18} /> }
                  ].map(method => (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setPaymentMethod(method.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '12px 14px',
                        borderRadius: 'var(--radius-md)',
                        border: paymentMethod === method.id ? '1.5px solid var(--primary)' : '1px solid var(--border-subtle)',
                        background: paymentMethod === method.id ? 'rgba(255, 94, 30, 0.12)' : 'var(--bg-elevated)',
                        color: paymentMethod === method.id ? 'var(--primary)' : 'var(--text-main)',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      {method.icon}
                      <span>{method.label}</span>
                    </button>
                  ))}
                </div>

                {/* Card Preview if Card Selected */}
                {paymentMethod === 'card' && (
                  <div style={{
                    background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '20px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: 'var(--shadow-card)',
                    marginBottom: '16px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '0.1em' }}>
                        CRAVE PLATINUM RUPAY
                      </span>
                      <ShieldCheck size={20} color="#10B981" />
                    </div>

                    <div style={{ fontSize: '1.25rem', letterSpacing: '0.15em', fontWeight: 700, marginBottom: '20px', fontFamily: 'monospace' }}>
                      5241 •••• •••• 9842
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                      <div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>CARDHOLDER</div>
                        <div style={{ fontSize: '0.88rem', fontWeight: 700 }}>{user?.name || 'Aarav Sharma'}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>EXPIRES</div>
                        <div style={{ fontSize: '0.88rem', fontWeight: 700 }}>12/29</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* UPI QR Preview if UPI Selected */}
                {paymentMethod === 'upi' && (
                  <div style={{
                    background: 'var(--bg-elevated)',
                    borderRadius: 'var(--radius-md)',
                    padding: '16px',
                    border: '1px solid var(--border-subtle)',
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px'
                  }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '10px',
                      background: 'rgba(16, 185, 129, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#10B981'
                    }}>
                      <QrCode size={28} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.92rem' }}>Instant UPI Auto-Pay</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Pay via GPay, PhonePe, Paytm or BHIM</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Order Items Preview */}
              <div style={{
                background: 'var(--bg-elevated)',
                borderRadius: 'var(--radius-md)',
                padding: '14px',
                border: '1px solid var(--border-subtle)'
              }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '8px' }}>
                  Order Summary ({cartItems.length} items)
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {cartItems.map((item) => (
                    <div key={item.cartKey} style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>{item.quantity}x {item.name}</span>
                      <span>₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Price Breakdown */}
          <div style={{
            background: 'var(--bg-card)',
            padding: '14px 18px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            fontSize: '0.86rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
              <span>Subtotal</span>
              <span>₹{subtotal}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
              <span>Delivery Fee</span>
              <span>{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
              <span>Taxes & GST (5%)</span>
              <span>₹{tax}</span>
            </div>
            {discount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10B981', fontWeight: 700 }}>
                <span>Discount Applied</span>
                <span>-₹{discount}</span>
              </div>
            )}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              paddingTop: '6px',
              borderTop: '1px solid var(--border-subtle)',
              fontWeight: 900,
              fontSize: '1.1rem'
            }}>
              <span>Total to Pay</span>
              <span className="gradient-text">₹{total}</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div style={{
          padding: '18px 24px',
          borderTop: '1px solid var(--border-subtle)',
          background: 'var(--bg-card)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px'
        }}>
          {step === 2 ? (
            <button
              onClick={() => setStep(1)}
              className="btn btn-secondary"
            >
              Back
            </button>
          ) : (
            <button
              onClick={() => setIsCheckoutOpen(false)}
              className="btn btn-ghost"
            >
              Cancel
            </button>
          )}

          {step === 1 ? (
            <button
              onClick={() => setStep(2)}
              className="btn btn-primary"
              style={{ flex: 1 }}
            >
              <span>Continue to Payment</span>
              <ChevronRight size={18} />
            </button>
          ) : (
            <button
              onClick={handlePlaceOrder}
              disabled={isSubmitting}
              className="btn btn-primary btn-lg"
              style={{ flex: 1 }}
            >
              <Sparkles size={18} />
              <span>{isSubmitting ? 'Placing Order...' : `Pay & Place Order • ₹${total}`}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
