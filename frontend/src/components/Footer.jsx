import React, { useState } from 'react';
import { Flame, Send, ShieldCheck, Heart, Smartphone, Sparkles } from 'lucide-react';

export const Footer = ({ onSelectCategory }) => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setEmail('');
  };

  return (
    <footer style={{
      background: 'var(--bg-card)',
      borderTop: '1px solid var(--border-subtle)',
      padding: '60px 0 30px 0',
      marginTop: 'auto'
    }}>
      <div className="app-container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '40px',
          marginBottom: '50px'
        }}>
          {/* Brand Col */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <img
                src="/logo.png"
                alt="CraveCourier Logo"
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  objectFit: 'cover',
                  boxShadow: '0 2px 10px var(--primary-glow)'
                }}
              />
              <span style={{
                fontFamily: 'var(--font-heading)',
                fontWeight: 900,
                fontSize: '1.3rem'
              }}>
                CRAVE<span style={{ color: 'var(--primary)' }}>COURIER</span>
              </span>
            </div>

            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Crafting premium culinary delivery experiences. Fresh, sizzling, and at your doorstep in under 25 minutes.
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--veg-color)', fontSize: '0.85rem', fontWeight: 700 }}>
              <ShieldCheck size={18} />
              <span>100% Certified Food Hygiene</span>
            </div>
          </div>

          {/* Quick Categories */}
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '16px' }}>Popular Cuisines</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              <span onClick={() => onSelectCategory('pizza')} style={{ cursor: 'pointer' }}>🍕 Woodfired Italian Pizzas</span>
              <span onClick={() => onSelectCategory('burgers')} style={{ cursor: 'pointer' }}>🍔 Smashed Wagyu Burgers</span>
              <span onClick={() => onSelectCategory('asian')} style={{ cursor: 'pointer' }}>🍣 Japanese Sushi & Ramen</span>
              <span onClick={() => onSelectCategory('indian')} style={{ cursor: 'pointer' }}>🍛 Royal Dum Biryanis</span>
              <span onClick={() => onSelectCategory('desserts')} style={{ cursor: 'pointer' }}>🍰 Molten Lava Bakes</span>
            </div>
          </div>

          {/* Mobile Apps */}
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '16px' }}>Download Our App</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
              Enjoy live driver GPS tracking, exclusive secret discounts, and push order alerts.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{
                padding: '10px 14px',
                background: 'var(--bg-elevated)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                cursor: 'pointer'
              }}>
                <Smartphone size={24} color="var(--primary)" />
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>DOWNLOAD ON THE</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 800 }}>Apple App Store</div>
                </div>
              </div>

              <div style={{
                padding: '10px 14px',
                background: 'var(--bg-elevated)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                cursor: 'pointer'
              }}>
                <Sparkles size={24} color="#10B981" />
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>GET IT ON</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 800 }}>Google Play Store</div>
                </div>
              </div>
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '16px' }}>Foodie Club Deals</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
              Subscribe to get secret weekend discount vouchers and chef menu premieres.
            </p>

            {subscribed ? (
              <div style={{
                padding: '12px',
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: 'var(--radius-md)',
                color: '#10B981',
                fontSize: '0.85rem',
                fontWeight: 700
              }}>
                🎉 You're in! Check your inbox for ₹150 coupon code.
              </div>
            ) : (
              <form onSubmit={handleSubscribe} style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="email"
                  required
                  placeholder="Your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '10px 14px',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-main)',
                    fontSize: '0.85rem',
                    outline: 'none'
                  }}
                />
                <button type="submit" className="btn btn-primary btn-sm" style={{ padding: '0 16px' }}>
                  <Send size={16} />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom Copyright */}
        <div style={{
          paddingTop: '24px',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          fontSize: '0.82rem',
          color: 'var(--text-muted)'
        }}>
          <div>
            © {new Date().getFullYear()} CraveCourier Inc. All rights reserved. MERN Stack E-Commerce Engine.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            Handcrafted with <Heart size={14} fill="#EF4444" color="#EF4444" /> for food lovers everywhere.
          </div>
        </div>
      </div>
    </footer>
  );
};
