import React, { useState } from 'react';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  Tag, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles,
  Bike
} from 'lucide-react';
import { useCart } from '../context/CartContext';

export const CartDrawer = () => {
  const {
    cartItems,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    tax,
    deliveryFee,
    discount,
    total,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    setIsCheckoutOpen
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  if (!isCartOpen) return null;

  const handleApplyCoupon = async (codeToApply) => {
    const code = codeToApply || couponInput;
    if (!code) return;
    setCouponError('');
    setCouponSuccess('');

    const res = await applyCoupon(code);
    if (res.success) {
      setCouponSuccess(res.message);
      setCouponInput('');
    } else {
      setCouponError(res.message);
    }
  };

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  return (
    <div className="modal-overlay" onClick={() => setIsCartOpen(false)}>
      <div
        className="glass-panel animate-fade cart-drawer-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          maxWidth: '460px',
          background: 'var(--bg-main)',
          borderLeft: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 1100,
          boxShadow: '-10px 0 40px rgba(0,0,0,0.6)'
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'var(--primary-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff'
            }}>
              <ShoppingBag size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Your Feast Cart</h3>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {cartItems.length} unique {cartItems.length === 1 ? 'item' : 'items'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {cartItems.length > 0 && (
              <button
                onClick={clearCart}
                className="btn btn-ghost btn-sm"
                style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}
                title="Clear Cart"
              >
                Clear
              </button>
            )}
            <button
              onClick={() => setIsCartOpen(false)}
              className="btn btn-ghost btn-sm"
              style={{ padding: '6px' }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Cart Items List or Empty State */}
        {cartItems.length === 0 ? (
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '30px',
            textAlign: 'center'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'var(--bg-elevated)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
              color: 'var(--text-muted)'
            }}>
              <ShoppingBag size={40} />
            </div>
            <h4 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>
              Your cart is hungry!
            </h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px', maxWidth: '280px' }}>
              Add some mouthwatering pizzas, burgers, or sushi to start your feast.
            </p>
            <button
              onClick={() => setIsCartOpen(false)}
              className="btn btn-primary"
            >
              Explore Menu Now
            </button>
          </div>
        ) : (
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            {/* Free Delivery Progress Bar */}
            <div style={{
              background: 'var(--bg-elevated)',
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Bike size={14} color="var(--primary)" />
                  {subtotal >= 299 ? (
                    <span style={{ color: '#10B981', fontWeight: 700 }}>Free Delivery Unlocked! 🎉</span>
                  ) : (
                    <span>Add <strong>₹{299 - subtotal}</strong> more for Free Delivery</span>
                  )}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>₹299 Goal</span>
              </div>
              <div style={{ width: '100%', height: '6px', background: 'var(--bg-input)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${Math.min(100, (subtotal / 299) * 100)}%`,
                  background: 'var(--primary-gradient)',
                  transition: 'width 0.3s ease'
                }} />
              </div>
            </div>

            {/* List of Cart Items */}
            {cartItems.map((item) => (
              <div
                key={item.cartKey}
                style={{
                  display: 'flex',
                  gap: '12px',
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                {/* Item Thumbnail */}
                <img
                  src={item.image}
                  alt={item.name}
                  style={{
                    width: '68px',
                    height: '68px',
                    borderRadius: 'var(--radius-sm)',
                    objectFit: 'cover'
                  }}
                />

                {/* Details */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <h4 style={{ fontSize: '0.92rem', fontWeight: 700, lineHeight: 1.3, color: 'var(--text-main)' }}>
                        {item.name}
                      </h4>
                      <button
                        onClick={() => removeFromCart(item.cartKey)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--text-muted)',
                          cursor: 'pointer',
                          padding: '2px'
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    {/* Customizations summary */}
                    {item.selectedOptions && (
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {item.selectedOptions.size && item.selectedOptions.size !== 'regular' && (
                          <span style={{ textTransform: 'capitalize' }}>Size: {item.selectedOptions.size} • </span>
                        )}
                        {item.selectedOptions.addons && item.selectedOptions.addons.length > 0 && (
                          <span>{item.selectedOptions.addons.length} Add-on(s) • </span>
                        )}
                        <span>₹{item.price} each</span>
                      </div>
                    )}
                  </div>

                  {/* Quantity Stepper & Subtotal */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: '8px'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: 'var(--bg-input)',
                      padding: '3px 8px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-subtle)'
                    }}>
                      <button
                        onClick={() => updateQuantity(item.cartKey, item.quantity - 1)}
                        style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', cursor: 'pointer' }}
                      >
                        <Minus size={13} />
                      </button>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, minWidth: '16px', textAlign: 'center' }}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.cartKey, item.quantity + 1)}
                        style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', cursor: 'pointer' }}
                      >
                        <Plus size={13} />
                      </button>
                    </div>

                    <span style={{ fontWeight: 800, fontSize: '0.98rem', color: 'var(--text-main)' }}>
                      ₹{item.price * item.quantity}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {/* Promo Code Section */}
            <div style={{
              background: 'var(--bg-elevated)',
              padding: '14px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                <Tag size={16} color="var(--primary)" />
                <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>Promo Code</span>
              </div>

              {appliedCoupon ? (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'rgba(16, 185, 129, 0.12)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle2 size={16} color="#10B981" />
                    <div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#10B981' }}>
                        {appliedCoupon.code} APPLIED
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {appliedCoupon.description}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={removeCoupon}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--nonveg-color)',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                    <input
                      type="text"
                      placeholder="Enter promo code (e.g. FEAST50)"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        background: 'var(--bg-input)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--text-main)',
                        fontSize: '0.85rem',
                        outline: 'none',
                        textTransform: 'uppercase'
                      }}
                    />
                    <button
                      onClick={() => handleApplyCoupon()}
                      className="btn btn-secondary btn-sm"
                    >
                      Apply
                    </button>
                  </div>

                  {couponError && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--nonveg-color)', marginBottom: '6px' }}>
                      {couponError}
                    </div>
                  )}

                  {/* Quick Promo Chips */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {[
                      { code: 'FEAST50', desc: '50% OFF' },
                      { code: 'CRAVE20', desc: '20% OFF' },
                      { code: 'FREEDEL', desc: 'Free Delivery' }
                    ].map(c => (
                      <button
                        key={c.code}
                        onClick={() => handleApplyCoupon(c.code)}
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: '4px',
                          background: 'rgba(255, 94, 30, 0.1)',
                          border: '1px dashed var(--primary)',
                          color: 'var(--primary)',
                          cursor: 'pointer'
                        }}
                      >
                        {c.code} ({c.desc})
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer Checkout Bill Summary */}
        {cartItems.length > 0 && (
          <div style={{
            padding: '20px 24px',
            borderTop: '1px solid var(--border-subtle)',
            background: 'var(--bg-card)',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}>
            {/* Bill Details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.88rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                <span>Subtotal</span>
                <span>₹{subtotal}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                <span>Estimated Taxes (5% GST)</span>
                <span>₹{tax}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                <span>Delivery Fee</span>
                <span style={{ color: deliveryFee === 0 ? '#10B981' : 'inherit', fontWeight: deliveryFee === 0 ? 700 : 400 }}>
                  {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
                </span>
              </div>

              {discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10B981', fontWeight: 700 }}>
                  <span>Promo Discount</span>
                  <span>-₹{discount}</span>
                </div>
              )}

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                paddingTop: '8px',
                marginTop: '4px',
                borderTop: '1px solid var(--border-subtle)',
                fontSize: '1.15rem',
                fontWeight: 900
              }}>
                <span>Total Amount</span>
                <span className="gradient-text">₹{total}</span>
              </div>
            </div>

            {/* Checkout Action Button */}
            <button
              onClick={handleProceedToCheckout}
              className="btn btn-primary btn-lg"
              style={{
                width: '100%',
                marginTop: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={18} />
                <span>Proceed to Checkout</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>₹{total}</span>
                <ArrowRight size={18} />
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
