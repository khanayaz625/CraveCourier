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
  ChevronLeft,
  ChevronRight,
  Layers, 
  Clock, 
  ShieldCheck, 
  LogOut,
  UtensilsCrossed,
  Store,
  RotateCcw,
  Menu as MenuIcon,
  X,
  Bell
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useLocation } from '../context/LocationContext';
import { useTheme } from '../context/ThemeContext';
import { useNotification } from '../context/NotificationContext';

export const Sidebar = ({ 
  currentTab, 
  setCurrentTab, 
  searchQuery, 
  setSearchQuery,
  onOpenOrdersModal,
  onOpenTrackingModal,
  isCollapsed: propIsCollapsed,
  setIsCollapsed: propSetIsCollapsed
}) => {
  const { user, logout, setIsAuthModalOpen, demoLogin } = useAuth();
  const { totalItemsCount, total, setIsCartOpen } = useCart();
  const { currentLocation, setIsLocationModalOpen } = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { unreadCount, setIsNotificationCenterOpen } = useNotification();

  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);
  const [localIsCollapsed, setLocalIsCollapsed] = useState(() => {
    const saved = localStorage.getItem('crave_sidebar_collapsed');
    return saved !== null ? saved === 'true' : true; // Default to collapsed
  });

  const isCollapsed = propIsCollapsed !== undefined ? propIsCollapsed : localIsCollapsed;
  const setIsCollapsed = propSetIsCollapsed || setLocalIsCollapsed;

  const toggleCollapse = () => {
    setIsCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('crave_sidebar_collapsed', String(next));
      return next;
    });
  };

  const navItems = [
    { id: 'menu', label: 'Explore Menu', icon: <UtensilsCrossed size={20} /> },
    { id: 'restaurants', label: 'Restaurants', icon: <Store size={20} /> },
    { id: 'tracking', label: 'Live Tracking', icon: <Clock size={20} />, badge: 'LIVE' },
  ];

  if (user?.role === 'admin' || user?.role === 'restaurant') {
    navItems.push({
      id: 'admin',
      label: user?.role === 'admin' ? 'Admin Hub' : 'Kitchen Hub',
      icon: <ShieldCheck size={20} />,
      special: true
    });
  }

  const handleNavClick = (tabId) => {
    setCurrentTab(tabId);
    if (tabId === 'tracking' && onOpenTrackingModal) {
      onOpenTrackingModal();
    }
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Top Header */}
      <div className="mobile-header glass-panel">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img
            src="/logo.png"
            alt="CraveCourier Logo"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              objectFit: 'cover',
              boxShadow: '0 2px 10px var(--primary-glow)'
            }}
          />
          <div>
            <span style={{ fontWeight: 900, fontSize: '1.15rem', fontFamily: 'var(--font-heading)' }}>
              CRAVE<span style={{ color: 'var(--primary)' }}>COURIER</span>
            </span>
            <div 
              onClick={() => setIsLocationModalOpen(true)}
              style={{ 
                fontSize: '0.68rem', 
                color: currentLocation?.isGPS ? '#10B981' : 'var(--text-muted)', 
                fontWeight: 700, 
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <span style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: currentLocation?.isGPS ? '#10B981' : 'var(--primary)',
                display: 'inline-block'
              }} />
              <span>{currentLocation?.label || 'Indiranagar, BLR'}</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Notification Bell Button */}
          <button
            onClick={() => setIsNotificationCenterOpen(true)}
            className="btn btn-ghost btn-sm"
            style={{ padding: '6px', position: 'relative' }}
            title="Push Notifications"
          >
            <Bell size={18} color="var(--primary)" />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '2px',
                right: '2px',
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                background: '#EF4444',
                color: '#fff',
                fontSize: '0.62rem',
                fontWeight: 900,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 8px rgba(239, 68, 68, 0.6)'
              }}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          <button
            onClick={toggleTheme}
            className="btn btn-ghost btn-sm"
            style={{ padding: '6px' }}
            title="Toggle Theme"
          >
            {theme === 'dark' ? <Sun size={18} color="#FBBF24" /> : <Moon size={18} color="#6366F1" />}
          </button>
        </div>
      </div>

      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div 
          className="modal-overlay"
          style={{ zIndex: 100 }}
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Desktop Vertical Sidebar (Fixed Stuck) */}
      <aside 
        className={`app-sidebar glass-panel ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'open' : ''}`}
        style={{
          width: isCollapsed ? '84px' : '285px',
          minWidth: isCollapsed ? '84px' : '285px',
          height: '100vh',
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: isCollapsed ? '20px 10px' : '24px 18px',
          borderRight: '1px solid var(--border-subtle)',
          background: 'var(--bg-card)',
          zIndex: 101,
          overflowY: 'auto',
          overflowX: 'hidden',
          transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Top Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: isCollapsed ? '16px' : '20px' }}>
          
          {/* Brand Logo & Collapse Toggle */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: isCollapsed ? 'center' : 'space-between'
          }}>
            <div 
              onClick={() => handleNavClick('menu')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                cursor: 'pointer',
                userSelect: 'none'
              }}
              title="CraveCourier Home"
            >
              <img
                src="/logo.png"
                alt="CraveCourier Logo"
                style={{
                  width: isCollapsed ? '44px' : '48px',
                  height: isCollapsed ? '44px' : '48px',
                  borderRadius: '14px',
                  objectFit: 'cover',
                  boxShadow: '0 4px 18px var(--primary-glow)',
                  flexShrink: 0
                }}
              />

              {!isCollapsed && (
                <div>
                  <span style={{
                    fontFamily: 'var(--font-heading)',
                    fontWeight: 900,
                    fontSize: '1.35rem',
                    letterSpacing: '-0.03em',
                    background: 'linear-gradient(135deg, #FFFFFF 30%, #FFA133 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: theme === 'dark' ? 'transparent' : 'inherit'
                  }}>
                    CRAVE<span style={{ color: 'var(--primary)', WebkitTextFillColor: 'var(--primary)' }}>COURIER</span>
                  </span>
                  <div style={{
                    fontSize: '0.64rem',
                    fontWeight: 700,
                    color: 'var(--text-secondary)',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase'
                  }}>
                    Indian Gourmet Hub
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Location Selector Pill */}
          {!isCollapsed ? (
            <div 
              onClick={() => setIsLocationModalOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 12px',
                background: 'var(--bg-elevated)',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                border: '1px solid var(--border-subtle)',
                transition: 'border-color 0.2s'
              }}
              title="Change Delivery Location"
            >
              <MapPin size={18} color={currentLocation?.isGPS ? '#10B981' : 'var(--primary)'} style={{ flexShrink: 0 }} />
              <div style={{ overflow: 'hidden', flex: 1 }}>
                <div style={{ 
                  fontSize: '0.68rem', 
                  color: currentLocation?.isGPS ? '#10B981' : 'var(--text-muted)', 
                  fontWeight: 800, 
                  textTransform: 'uppercase',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  {currentLocation?.isGPS && (
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
                  )}
                  {currentLocation?.isGPS ? 'Live GPS Location' : 'Deliver To'}
                </div>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {currentLocation?.label || 'Indiranagar'}: {currentLocation?.address || 'Bengaluru'}
                </div>
              </div>
              <ChevronDown size={14} color="var(--text-muted)" style={{ flexShrink: 0 }} />
            </div>
          ) : (
            <div 
              onClick={() => setIsLocationModalOpen(true)}
              style={{
                width: '44px',
                height: '44px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-elevated)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                border: '1px solid var(--border-subtle)',
                margin: '0 auto'
              }}
              title={`Deliver to: ${currentLocation?.label || 'Indiranagar'}`}
            >
              <MapPin size={18} color="var(--primary)" />
            </div>
          )}

          {/* Search Input */}
          {!isCollapsed ? (
            <div style={{ position: 'relative' }}>
              <Search size={16} color="var(--text-muted)" style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)'
              }} />
              <input
                type="text"
                placeholder="Search biryani, pizza..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px 9px 36px',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-main)',
                  fontSize: '0.85rem',
                  outline: 'none',
                  transition: 'all 0.2s ease'
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{
                    position: 'absolute',
                    right: '10px',
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
          ) : (
            <button
              onClick={() => { setIsCollapsed(false); }}
              style={{
                width: '44px',
                height: '44px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                margin: '0 auto'
              }}
              title="Search Dishes"
            >
              <Search size={18} />
            </button>
          )}

          {/* Main Navigation Links */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {!isCollapsed && (
              <div style={{
                fontSize: '0.7rem',
                fontWeight: 800,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                paddingLeft: '6px',
                marginBottom: '4px'
              }}>
                Navigation
              </div>
            )}

            {navItems.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: isCollapsed ? 'center' : 'space-between',
                    padding: isCollapsed ? '12px' : '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: isActive ? '1px solid var(--primary)' : '1px solid transparent',
                    background: isActive ? 'var(--primary-gradient)' : 'transparent',
                    color: isActive ? '#FFFFFF' : 'var(--text-main)',
                    boxShadow: isActive ? '0 4px 15px var(--primary-glow)' : 'none',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    textAlign: 'left',
                    position: 'relative'
                  }}
                  title={item.label}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.background = 'var(--bg-elevated)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ color: isActive ? '#FFFFFF' : 'var(--primary)', display: 'flex' }}>
                      {item.icon}
                    </span>
                    {!isCollapsed && <span>{item.label}</span>}
                  </div>

                  {!isCollapsed && item.badge && (
                    <span style={{
                      fontSize: '0.65rem',
                      fontWeight: 900,
                      padding: '2px 6px',
                      borderRadius: 'var(--radius-full)',
                      background: isActive ? '#fff' : 'rgba(255, 94, 30, 0.2)',
                      color: isActive ? 'var(--primary)' : 'var(--primary)'
                    }}>
                      {item.badge}
                    </span>
                  )}

                  {isCollapsed && item.badge && (
                    <span style={{
                      position: 'absolute',
                      top: '6px',
                      right: '6px',
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: 'var(--primary)'
                    }} />
                  )}
                </button>
              );
            })}

            {/* Past Orders Modal Trigger */}
            <button
              onClick={() => {
                onOpenOrdersModal();
                setIsMobileOpen(false);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: isCollapsed ? 'center' : 'flex-start',
                gap: '12px',
                padding: isCollapsed ? '12px' : '12px 14px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid transparent',
                background: 'transparent',
                color: 'var(--text-main)',
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              title="Past Orders & Reorder"
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-elevated)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
              <RotateCcw size={18} color="var(--primary)" />
              {!isCollapsed && <span>Past Orders</span>}
            </button>

            {/* Push Notifications Center Trigger */}
            <button
              onClick={() => {
                setIsNotificationCenterOpen(true);
                setIsMobileOpen(false);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: isCollapsed ? 'center' : 'space-between',
                padding: isCollapsed ? '12px' : '12px 14px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid transparent',
                background: 'transparent',
                color: 'var(--text-main)',
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                position: 'relative'
              }}
              title="Push Notifications"
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-elevated)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Bell size={18} color="var(--primary)" />
                {!isCollapsed && <span>Notifications</span>}
              </div>

              {!isCollapsed && unreadCount > 0 && (
                <span style={{
                  fontSize: '0.65rem',
                  fontWeight: 900,
                  padding: '2px 7px',
                  borderRadius: 'var(--radius-full)',
                  background: '#EF4444',
                  color: '#fff',
                  boxShadow: '0 0 8px rgba(239, 68, 68, 0.4)'
                }}>
                  {unreadCount}
                </span>
              )}

              {isCollapsed && unreadCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#EF4444',
                  boxShadow: '0 0 6px #EF4444'
                }} />
              )}
            </button>
          </nav>
        </div>

        {/* Bottom Section: Cart, Theme & User */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
          
          {/* Cart Trigger Card */}
          <div 
            onClick={() => setIsCartOpen(true)}
            style={{
              padding: isCollapsed ? '10px' : '12px 14px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--primary-gradient)',
              color: '#FFFFFF',
              boxShadow: '0 4px 15px var(--primary-glow)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: isCollapsed ? 'center' : 'space-between',
              transition: 'transform 0.2s ease',
              position: 'relative'
            }}
            title={`Cart: ${totalItemsCount} items (₹${total})`}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <ShoppingBag size={18} />
              </div>

              {!isCollapsed && (
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800 }}>Feast Cart</div>
                  <div style={{ fontSize: '0.72rem', opacity: 0.9 }}>
                    {totalItemsCount} {totalItemsCount === 1 ? 'dish' : 'dishes'}
                  </div>
                </div>
              )}
            </div>

            {!isCollapsed ? (
              <div style={{ fontSize: '1.05rem', fontWeight: 900 }}>
                ₹{total}
              </div>
            ) : (
              totalItemsCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  background: '#fff',
                  color: 'var(--primary)',
                  borderRadius: '50%',
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  width: '18px',
                  height: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {totalItemsCount}
                </span>
              )
            )}
          </div>

          {/* Theme Switcher */}
          {!isCollapsed ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '6px 12px',
              background: 'var(--bg-elevated)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)'
            }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Theme
              </span>
              <button
                onClick={toggleTheme}
                className="btn btn-ghost btn-sm"
                style={{
                  padding: '4px 8px',
                  gap: '6px',
                  fontSize: '0.78rem',
                  fontWeight: 700
                }}
              >
                {theme === 'dark' ? <Sun size={15} color="#FBBF24" /> : <Moon size={15} color="#6366F1" />}
                <span>{theme === 'dark' ? 'Dark' : 'Light'}</span>
              </button>
            </div>
          ) : (
            <button
              onClick={toggleTheme}
              className="btn btn-ghost btn-sm"
              style={{
                width: '40px',
                height: '40px',
                margin: '0 auto',
                borderRadius: 'var(--radius-md)'
              }}
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun size={18} color="#FBBF24" /> : <Moon size={18} color="#6366F1" />}
            </button>
          )}

          {/* User Profile Card */}
          <div style={{ position: 'relative' }}>
            {user ? (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: isCollapsed ? 'center' : 'space-between',
                padding: isCollapsed ? '6px' : '8px 10px',
                background: 'var(--bg-elevated)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)'
              }}>
                <div 
                  onClick={() => setIsRoleMenuOpen(!isRoleMenuOpen)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    cursor: 'pointer',
                    flex: isCollapsed ? 'none' : 1,
                    overflow: 'hidden'
                  }}
                  title={user.name}
                >
                  <img
                    src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                    alt={user.name || 'User'}
                    style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      flexShrink: 0
                    }}
                  />

                  {!isCollapsed && (
                    <div style={{ overflow: 'hidden', flex: 1 }}>
                      <div style={{ fontSize: '0.84rem', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {user.name || 'User'}
                      </div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--primary)', fontWeight: 700, textTransform: 'capitalize' }}>
                        {user.role || 'customer'}
                      </div>
                    </div>
                  )}

                  {!isCollapsed && <ChevronDown size={14} color="var(--text-muted)" />}
                </div>

                {!isCollapsed && (
                  <button
                    onClick={logout}
                    className="btn btn-ghost btn-sm"
                    style={{ padding: '6px', color: 'var(--nonveg-color)' }}
                    title="Sign Out"
                  >
                    <LogOut size={15} />
                  </button>
                )}
              </div>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="btn btn-secondary"
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  padding: isCollapsed ? '10px 0' : '10px 14px'
                }}
                title="Sign In"
              >
                <User size={16} />
                {!isCollapsed && <span>Sign In</span>}
              </button>
            )}
          </div>

          {/* Dedicated Collapse Toggle Button at Bottom of Sidebar */}
          <button
            onClick={toggleCollapse}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: isCollapsed ? 'center' : 'space-between',
              padding: isCollapsed ? '10px 0' : '9px 12px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-main)',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              marginTop: '4px'
            }}
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--primary)';
              e.currentTarget.style.background = 'var(--bg-input)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-subtle)';
              e.currentTarget.style.background = 'var(--bg-elevated)';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ display: 'flex', color: 'var(--primary)' }}>
                {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
              </span>
              {!isCollapsed && <span>Collapse Sidebar</span>}
            </div>
            {!isCollapsed && (
              <span style={{
                fontSize: '0.65rem',
                color: 'var(--text-muted)',
                background: 'var(--bg-input)',
                padding: '2px 6px',
                borderRadius: '4px',
                border: '1px solid var(--border-subtle)'
              }}>
                Stuck
              </span>
            )}
          </button>
        </div>
      </aside>
    </>
  );
};
