import React, { useState } from 'react';
import { 
  Flame, 
  MapPin, 
  Search, 
  ShoppingBag, 
  User, 
  Sun, 
  Moon, 
  Sparkles, 
  ChevronDown, 
  Layers, 
  Clock, 
  ShieldCheck, 
  LogOut,
  UtensilsCrossed,
  Store
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useLocation } from '../context/LocationContext';
import { useTheme } from '../context/ThemeContext';

export const Navbar = ({ 
  currentTab, 
  setCurrentTab, 
  searchQuery, 
  setSearchQuery,
  onOpenOrdersModal,
  onOpenTrackingModal
}) => {
  const { user, logout, setIsAuthModalOpen, demoLogin } = useAuth();
  const { totalItemsCount, total, setIsCartOpen } = useCart();
  const { currentLocation, setIsLocationModalOpen } = useLocation();
  const { theme, toggleTheme } = useTheme();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  return (
    <header className="navbar-container glass-panel" style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      borderBottom: '1px solid var(--border-subtle)',
      transition: 'all 0.3s ease'
    }}>
      <div className="app-container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '76px',
        gap: '20px'
      }}>
        {/* Brand Logo */}
        <div 
          onClick={() => setCurrentTab('menu')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            cursor: 'pointer',
            userSelect: 'none'
          }}
        >
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '14px',
            background: 'var(--primary-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 15px var(--primary-glow)',
            color: '#fff'
          }}>
            <Flame size={26} className="animate-pulse" />
          </div>
          <div>
            <span style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 900,
              fontSize: '1.45rem',
              letterSpacing: '-0.03em',
              background: 'linear-gradient(135deg, #FFFFFF 30%, #FFA133 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: theme === 'dark' ? 'transparent' : 'inherit'
            }}>
              CRAVE<span style={{ color: 'var(--primary)', WebkitTextFillColor: 'var(--primary)' }}>COURIER</span>
            </span>
            <div style={{
              fontSize: '0.68rem',
              fontWeight: 600,
              color: 'var(--text-secondary)',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              marginTop: '-3px'
            }}>
              MERN Gourmet Delivery
            </div>
          </div>
        </div>

        {/* Location Selector */}
        <div 
          onClick={() => setIsLocationModalOpen(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 14px',
            background: 'var(--bg-elevated)',
            borderRadius: 'var(--radius-full)',
            cursor: 'pointer',
            border: '1px solid var(--border-subtle)',
            transition: 'border-color 0.2s',
            maxWidth: '220px'
          }}
          title="Change Delivery Address"
        >
          <MapPin size={16} color="var(--primary)" />
          <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>DELIVER TO</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {currentLocation?.label || 'Address'}: {currentLocation?.address || 'Set Location'}
            </div>
          </div>
          <ChevronDown size={14} color="var(--text-muted)" />
        </div>

        {/* Search Bar */}
        <div style={{
          flex: 1,
          maxWidth: '380px',
          position: 'relative'
        }} className="nav-search-wrapper">
          <Search size={18} color="var(--text-muted)" style={{
            position: 'absolute',
            left: '14px',
            top: '50%',
            transform: 'translateY(-50%)'
          }} />
          <input
            type="text"
            placeholder="Search pizza, ramen, biryani, burgers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '11px 16px 11px 42px',
              background: 'var(--bg-input)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-full)',
              color: 'var(--text-main)',
              fontSize: '0.9rem',
              outline: 'none',
              transition: 'all 0.2s ease'
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                fontSize: '0.8rem'
              }}
            >
              ✕
            </button>
          )}
        </div>

        {/* Navigation Tabs */}
        <nav style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <button
            className={`btn btn-sm ${currentTab === 'menu' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setCurrentTab('menu')}
          >
            <UtensilsCrossed size={16} />
            <span>Menu</span>
          </button>

          <button
            className={`btn btn-sm ${currentTab === 'restaurants' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setCurrentTab('restaurants')}
          >
            <Store size={16} />
            <span>Restaurants</span>
          </button>

          <button
            className={`btn btn-sm ${currentTab === 'tracking' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => {
              setCurrentTab('tracking');
              if (onOpenTrackingModal) onOpenTrackingModal();
            }}
          >
            <Clock size={16} />
            <span>Live Tracker</span>
          </button>

          {(user?.role === 'admin' || user?.role === 'restaurant') && (
            <button
              className={`btn btn-sm ${currentTab === 'admin' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setCurrentTab('admin')}
              style={{
                border: '1px dashed var(--primary)',
                color: currentTab === 'admin' ? '#fff' : 'var(--primary)'
              }}
            >
              <ShieldCheck size={16} />
              <span>{user?.role === 'admin' ? 'Admin Hub' : 'Kitchen Hub'}</span>
            </button>
          )}
        </nav>

        {/* Actions (Theme, Cart, Profile) */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          {/* Dark / Light Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="btn btn-ghost"
            style={{
              width: '40px',
              height: '40px',
              padding: 0,
              borderRadius: 'var(--radius-full)'
            }}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? <Sun size={20} color="#FBBF24" /> : <Moon size={20} color="#6366F1" />}
          </button>

          {/* Cart Button */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="btn btn-primary"
            style={{
              padding: '9px 16px',
              position: 'relative'
            }}
          >
            <ShoppingBag size={18} />
            <span style={{ fontWeight: 700 }}>
              {totalItemsCount > 0 ? `$${total}` : 'Cart'}
            </span>
            {totalItemsCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-6px',
                right: '-6px',
                background: '#FFFFFF',
                color: 'var(--primary)',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.75rem',
                fontWeight: 800,
                width: '22px',
                height: '22px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
              }}>
                {totalItemsCount}
              </span>
            )}
          </button>

          {/* User Account / Profile Dropdown */}
          <div style={{ position: 'relative' }}>
            {user ? (
              <div 
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '4px 10px 4px 4px',
                  background: 'var(--bg-elevated)',
                  borderRadius: 'var(--radius-full)',
                  cursor: 'pointer',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <img
                  src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
                  alt={user.name || 'User'}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    objectFit: 'cover'
                  }}
                />
                <span style={{
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  maxWidth: '90px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {user.name ? user.name.split(' ')[0] : 'User'}
                </span>
                <ChevronDown size={14} color="var(--text-muted)" />
              </div>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="btn btn-secondary btn-sm"
              >
                <User size={16} />
                <span>Sign In</span>
              </button>
            )}

            {/* User Dropdown Menu */}
            {isUserMenuOpen && user && (
              <div 
                className="glass-panel animate-fade"
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '48px',
                  width: '240px',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px',
                  boxShadow: 'var(--shadow-card)',
                  zIndex: 200,
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <div style={{
                  paddingBottom: '10px',
                  marginBottom: '10px',
                  borderBottom: '1px solid var(--border-subtle)'
                }}>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{user.name || 'User'}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{user.email || ''}</div>
                  <span className="badge badge-primary" style={{ marginTop: '6px', fontSize: '0.68rem' }}>
                    {user.role || 'Customer'} Account
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <button
                    onClick={() => {
                      onOpenOrdersModal();
                      setIsUserMenuOpen(false);
                    }}
                    className="btn btn-ghost btn-sm"
                    style={{ justifyContent: 'flex-start', width: '100%' }}
                  >
                    <Clock size={16} /> My Past Orders
                  </button>

                  <button
                    onClick={() => {
                      setCurrentTab('tracking');
                      setIsUserMenuOpen(false);
                    }}
                    className="btn btn-ghost btn-sm"
                    style={{ justifyContent: 'flex-start', width: '100%' }}
                  >
                    <Layers size={16} /> Live Active Delivery
                  </button>

                  <div style={{
                    margin: '6px 0',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    Switch Demo Role
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '4px' }}>
                    <button
                      onClick={() => { demoLogin('customer'); setIsUserMenuOpen(false); }}
                      className={`btn btn-sm ${user.role === 'customer' ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ fontSize: '0.7rem', padding: '4px 6px' }}
                    >
                      Customer
                    </button>
                    <button
                      onClick={() => { demoLogin('admin'); setCurrentTab('admin'); setIsUserMenuOpen(false); }}
                      className={`btn btn-sm ${user.role === 'admin' ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ fontSize: '0.7rem', padding: '4px 6px' }}
                    >
                      Admin
                    </button>
                    <button
                      onClick={() => { demoLogin('restaurant'); setCurrentTab('admin'); setIsUserMenuOpen(false); }}
                      className={`btn btn-sm ${user.role === 'restaurant' ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ fontSize: '0.7rem', padding: '4px 6px' }}
                    >
                      Chef
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      logout();
                      setIsUserMenuOpen(false);
                    }}
                    className="btn btn-ghost btn-sm"
                    style={{
                      justifyContent: 'flex-start',
                      width: '100%',
                      marginTop: '8px',
                      color: 'var(--nonveg-color)'
                    }}
                  >
                    <LogOut size={16} /> Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
