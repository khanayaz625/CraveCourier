import React from 'react';
import { UtensilsCrossed, Store, Clock, ShoppingBag, User, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export const MobileBottomNav = ({ currentTab, setCurrentTab, onOpenOrdersModal }) => {
  const { totalItemsCount, total, setIsCartOpen } = useCart();
  const { user, setIsAuthModalOpen } = useAuth();

  return (
    <nav className="mobile-bottom-bar glass-panel">
      {/* Menu Tab */}
      <button
        onClick={() => setCurrentTab('menu')}
        className={`mobile-nav-item ${currentTab === 'menu' ? 'active' : ''}`}
      >
        <div className="mobile-icon-wrapper">
          <UtensilsCrossed size={20} />
        </div>
        <span>Menu</span>
      </button>

      {/* Restaurants Tab */}
      <button
        onClick={() => setCurrentTab('restaurants')}
        className={`mobile-nav-item ${currentTab === 'restaurants' ? 'active' : ''}`}
      >
        <div className="mobile-icon-wrapper">
          <Store size={20} />
        </div>
        <span>Places</span>
      </button>

      {/* Live Track Tab */}
      <button
        onClick={() => setCurrentTab('tracking')}
        className={`mobile-nav-item ${currentTab === 'tracking' ? 'active' : ''}`}
      >
        <div className="mobile-icon-wrapper" style={{ position: 'relative' }}>
          <Clock size={20} />
          <span className="live-pulse-dot" />
        </div>
        <span>Tracking</span>
      </button>

      {/* Cart Drawer Trigger */}
      <button
        onClick={() => setIsCartOpen(true)}
        className="mobile-nav-item"
      >
        <div className="mobile-icon-wrapper" style={{ position: 'relative' }}>
          <ShoppingBag size={20} />
          {totalItemsCount > 0 && (
            <span className="mobile-cart-badge">
              {totalItemsCount}
            </span>
          )}
        </div>
        <span>Cart {total > 0 ? `(₹${total})` : ''}</span>
      </button>

      {/* Profile / Admin / Orders */}
      {user?.role === 'admin' || user?.role === 'restaurant' ? (
        <button
          onClick={() => setCurrentTab('admin')}
          className={`mobile-nav-item ${currentTab === 'admin' ? 'active' : ''}`}
        >
          <div className="mobile-icon-wrapper">
            <ShieldCheck size={20} color="var(--primary)" />
          </div>
          <span>Hub</span>
        </button>
      ) : (
        <button
          onClick={() => {
            if (user) {
              onOpenOrdersModal();
            } else {
              setIsAuthModalOpen(true);
            }
          }}
          className="mobile-nav-item"
        >
          <div className="mobile-icon-wrapper">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt="Profile"
                style={{ width: '20px', height: '20px', borderRadius: '50%', objectFit: 'cover' }}
              />
            ) : (
              <User size={20} />
            )}
          </div>
          <span>{user ? 'Orders' : 'Sign In'}</span>
        </button>
      )}
    </nav>
  );
};
