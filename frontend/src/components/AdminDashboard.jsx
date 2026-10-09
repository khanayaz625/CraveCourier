import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  IndianRupee, 
  ShoppingBag, 
  Users, 
  Plus, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  Layers, 
  Sparkles,
  Utensils,
  Search,
  Filter,
  Eye,
  X,
  ShieldCheck,
  Store,
  Tag,
  AlertCircle,
  Phone,
  MapPin,
  Mail,
  Crown,
  ChefHat,
  RefreshCw,
  Flame,
  Leaf,
  Check,
  Power
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

export const AdminDashboard = ({ onRefreshData }) => {
  const { user } = useAuth();
  const { triggerOrderNotification } = useNotification();
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'menu' | 'restaurants' | 'users' | 'analytics'
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [foods, setFoods] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState({ type: '', text: '' });

  // Search & Filters
  const [orderFilter, setOrderFilter] = useState('all');
  const [orderSearch, setOrderSearch] = useState('');
  const [foodSearch, setFoodSearch] = useState('');
  const [foodCategoryFilter, setFoodCategoryFilter] = useState('all');
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');

  // Food Modal
  const [isFoodModalOpen, setIsFoodModalOpen] = useState(false);
  const [editingFood, setEditingFood] = useState(null);
  const [foodForm, setFoodForm] = useState({
    name: '',
    category: 'pizza',
    price: '',
    originalPrice: '',
    description: '',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
    isVeg: false,
    prepTime: '15-20 min',
    calories: '600 kcal',
    spicyLevel: 0
  });

  // Restaurant Modal
  const [isRestModalOpen, setIsRestModalOpen] = useState(false);
  const [editingRest, setEditingRest] = useState(null);
  const [restForm, setRestForm] = useState({
    name: '',
    cuisine: 'North Indian, Street Food, Biryani',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
    address: 'Indiranagar, Bengaluru',
    deliveryTime: '25-35 min',
    priceRange: '₹₹',
    isOpen: true
  });

  // Create User Modal
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'customer',
    address: 'Koramangala, Bengaluru'
  });

  // Coupon Form
  const [couponForm, setCouponForm] = useState({
    code: '',
    discount: '',
    minOrder: '299',
    description: ''
  });

  const showNotification = (type, text) => {
    setActionMessage({ type, text });
    setTimeout(() => setActionMessage({ type: '', text: '' }), 4000);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsData, ordersData, foodsData, restsData, usersData, couponsData] = await Promise.all([
        api.getAdminStats().catch(() => null),
        api.getAllOrders().catch(() => []),
        api.getFoods().catch(() => []),
        api.getRestaurants().catch(() => []),
        api.getAdminUsers().catch(() => []),
        api.getCoupons().catch(() => [])
      ]);

      setStats(statsData);
      setOrders(ordersData || []);
      setFoods(foodsData || []);
      setRestaurants(restsData || []);
      setUsersList(usersData || []);
      setCoupons(couponsData || []);
    } catch (err) {
      console.error('Error loading admin data:', err);
      showNotification('error', 'Failed to refresh admin data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- Order Actions ---
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await api.updateOrderStatus(orderId, newStatus);
      showNotification('success', `Order #${orderId} status changed to ${newStatus}`);
      
      // Broadcast live push notification
      const eventKey = newStatus.toLowerCase().replace(/\s+/g, '_');
      triggerOrderNotification(eventKey, { orderId });

      fetchData();
      if (onRefreshData) onRefreshData();
    } catch (err) {
      showNotification('error', err.message);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm(`Are you sure you want to delete order #${orderId}?`)) return;
    try {
      await api.deleteOrder(orderId);
      showNotification('success', 'Order removed from records');
      fetchData();
    } catch (err) {
      showNotification('error', err.message);
    }
  };

  // --- Food Actions ---
  const handleOpenAddFood = () => {
    setEditingFood(null);
    setFoodForm({
      name: '',
      category: 'pizza',
      price: '',
      originalPrice: '',
      description: '',
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
      isVeg: false,
      prepTime: '15-20 min',
      calories: '600 kcal',
      spicyLevel: 0
    });
    setIsFoodModalOpen(true);
  };

  const handleOpenEditFood = (food) => {
    setEditingFood(food);
    setFoodForm({
      name: food.name,
      category: food.category || 'pizza',
      price: food.price,
      originalPrice: food.originalPrice || '',
      description: food.description || '',
      image: food.image,
      isVeg: !!food.isVeg,
      prepTime: food.prepTime || '15-20 min',
      calories: food.calories || '600 kcal',
      spicyLevel: food.spicyLevel || 0
    });
    setIsFoodModalOpen(true);
  };

  const handleSaveFood = async (e) => {
    e.preventDefault();
    try {
      const foodData = {
        ...foodForm,
        price: parseFloat(foodForm.price),
        originalPrice: foodForm.originalPrice ? parseFloat(foodForm.originalPrice) : undefined,
        spicyLevel: parseInt(foodForm.spicyLevel, 10)
      };

      if (editingFood) {
        await api.updateFood(editingFood.id || editingFood._id, foodData);
        showNotification('success', `Updated "${foodData.name}" successfully!`);
      } else {
        await api.addFood(foodData);
        showNotification('success', `Added "${foodData.name}" to menu!`);
      }

      setIsFoodModalOpen(false);
      fetchData();
      if (onRefreshData) onRefreshData();
    } catch (err) {
      showNotification('error', err.message);
    }
  };

  const handleDeleteFood = async (foodId, foodName) => {
    if (!window.confirm(`Delete "${foodName}" from the menu?`)) return;
    try {
      await api.deleteFood(foodId);
      showNotification('success', `Deleted "${foodName}" from menu`);
      fetchData();
      if (onRefreshData) onRefreshData();
    } catch (err) {
      showNotification('error', err.message);
    }
  };

  // --- Restaurant Actions ---
  const handleOpenAddRest = () => {
    setEditingRest(null);
    setRestForm({
      name: '',
      cuisine: 'North Indian, Biryani, Desserts',
      image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
      address: 'Indiranagar 100ft Rd, Bengaluru',
      deliveryTime: '25-35 min',
      priceRange: '₹₹',
      isOpen: true
    });
    setIsRestModalOpen(true);
  };

  const handleOpenEditRest = (rest) => {
    setEditingRest(rest);
    setRestForm({
      name: rest.name,
      cuisine: rest.cuisine || '',
      image: rest.image || '',
      address: rest.address || '',
      deliveryTime: rest.deliveryTime || '25-35 min',
      priceRange: rest.priceRange || '₹₹',
      isOpen: rest.isOpen !== false
    });
    setIsRestModalOpen(true);
  };

  const handleSaveRest = async (e) => {
    e.preventDefault();
    try {
      if (editingRest) {
        await api.updateRestaurant(editingRest.id || editingRest._id, restForm);
        showNotification('success', `Updated restaurant "${restForm.name}"!`);
      } else {
        await api.createRestaurant(restForm);
        showNotification('success', `Created partner restaurant "${restForm.name}"!`);
      }
      setIsRestModalOpen(false);
      fetchData();
    } catch (err) {
      showNotification('error', err.message);
    }
  };

  const handleToggleRestStatus = async (rest) => {
    try {
      const updatedStatus = !rest.isOpen;
      await api.updateRestaurant(rest.id || rest._id, { isOpen: updatedStatus });
      showNotification('success', `${rest.name} is now ${updatedStatus ? 'OPEN' : 'CLOSED'}`);
      fetchData();
    } catch (err) {
      showNotification('error', err.message);
    }
  };

  const handleDeleteRest = async (restId, restName) => {
    if (!window.confirm(`Delete partner restaurant "${restName}"?`)) return;
    try {
      await api.deleteRestaurant(restId);
      showNotification('success', `Removed "${restName}"`);
      fetchData();
    } catch (err) {
      showNotification('error', err.message);
    }
  };

  // --- User & Role Management Actions ---
  const handleUpdateRole = async (targetUser, newRole) => {
    if (targetUser.email === 'admin@cravecourier.com' && newRole !== 'admin') {
      showNotification('error', 'Cannot demote the primary master admin!');
      return;
    }

    try {
      await api.updateUserRole(targetUser._id || targetUser.id, newRole);
      showNotification('success', `Changed ${targetUser.name}'s role to ${newRole.toUpperCase()}`);
      fetchData();
    } catch (err) {
      showNotification('error', err.message);
    }
  };

  const handleDeleteUser = async (targetUser) => {
    if (targetUser.email === 'admin@cravecourier.com') {
      showNotification('error', 'Cannot delete primary root admin account!');
      return;
    }
    if (!window.confirm(`Delete user account "${targetUser.name}" (${targetUser.email})?`)) return;

    try {
      await api.deleteUser(targetUser._id || targetUser.id);
      showNotification('success', `User "${targetUser.name}" deleted successfully`);
      fetchData();
    } catch (err) {
      showNotification('error', err.message);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await api.createAdminUser(userForm);
      showNotification('success', `Created user ${userForm.name} (${userForm.role})!`);
      setIsUserModalOpen(false);
      setUserForm({ name: '', email: '', password: '', phone: '', role: 'customer', address: '' });
      fetchData();
    } catch (err) {
      showNotification('error', err.message);
    }
  };

  // --- Coupon Actions ---
  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    try {
      await api.createCoupon(couponForm);
      showNotification('success', `Coupon ${couponForm.code.toUpperCase()} created!`);
      setCouponForm({ code: '', discount: '', minOrder: '299', description: '' });
      fetchData();
    } catch (err) {
      showNotification('error', err.message);
    }
  };

  const handleDeleteCoupon = async (code) => {
    try {
      await api.deleteCoupon(code);
      showNotification('success', `Coupon ${code} removed`);
      fetchData();
    } catch (err) {
      showNotification('error', err.message);
    }
  };

  // --- Filtered Lists ---
  const filteredOrders = orders.filter(o => {
    const matchesFilter = orderFilter === 'all' || (o.orderStatus && o.orderStatus.toLowerCase() === orderFilter.toLowerCase());
    const matchesSearch = !orderSearch || 
      (o.orderId && o.orderId.toLowerCase().includes(orderSearch.toLowerCase())) ||
      (o.deliveryAddress?.fullName && o.deliveryAddress.fullName.toLowerCase().includes(orderSearch.toLowerCase())) ||
      (o.deliveryAddress?.phone && o.deliveryAddress.phone.includes(orderSearch));
    return matchesFilter && matchesSearch;
  });

  const filteredFoods = foods.filter(f => {
    const matchesCategory = foodCategoryFilter === 'all' || f.category === foodCategoryFilter;
    const matchesSearch = !foodSearch || f.name.toLowerCase().includes(foodSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const filteredUsers = usersList.filter(u => {
    const matchesRole = userRoleFilter === 'all' || u.role === userRoleFilter;
    const matchesSearch = !userSearch || 
      (u.name && u.name.toLowerCase().includes(userSearch.toLowerCase())) ||
      (u.email && u.email.toLowerCase().includes(userSearch.toLowerCase())) ||
      (u.phone && u.phone.includes(userSearch));
    return matchesRole && matchesSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%', maxWidth: '1360px', margin: '0 auto' }}>
      
      {/* 1. Master Top Header Banner */}
      <div className="glass-panel" style={{
        padding: '24px 28px',
        borderRadius: 'var(--radius-lg)',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '20px',
        boxShadow: 'var(--shadow-card)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #FF5E1E 0%, #F59E0B 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            boxShadow: '0 4px 20px rgba(255, 94, 30, 0.4)',
            flexShrink: 0
          }}>
            <Crown size={28} />
          </div>
          <div>
            <h1 style={{
              fontSize: '1.85rem',
              fontWeight: 900,
              margin: 0,
              letterSpacing: '-0.02em',
              background: 'linear-gradient(135deg, #FF5E1E 0%, #FFA133 60%, #F59E0B 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Super Admin Governance Suite
            </h1>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '10px',
              marginTop: '4px',
              fontSize: '0.85rem',
              color: 'var(--text-secondary)'
            }}>
              <span>
                Logged in as: <strong style={{ color: 'var(--primary)' }}>{user?.name || 'Administrator'}</strong> ({user?.email})
              </span>
              <span style={{
                background: 'rgba(139, 92, 246, 0.2)',
                color: '#A78BFA',
                border: '1px solid rgba(139, 92, 246, 0.4)',
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.7rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                👑 Full Root Access
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={fetchData}
            disabled={loading}
            className="btn btn-secondary"
            style={{ padding: '8px 16px', fontSize: '0.88rem' }}
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} color="var(--primary)" />
            <span>Refresh Sync</span>
          </button>
        </div>
      </div>

      {/* Global Notification Banner */}
      {actionMessage.text && (
        <div style={{
          padding: '14px 20px',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          background: actionMessage.type === 'error' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
          border: `1px solid ${actionMessage.type === 'error' ? 'rgba(239, 68, 68, 0.4)' : 'rgba(16, 185, 129, 0.4)'}`,
          color: actionMessage.type === 'error' ? '#FCA5A5' : '#6EE7B7',
          boxShadow: 'var(--shadow-subtle)'
        }}>
          {actionMessage.type === 'error' ? <AlertCircle size={20} /> : <Check size={20} />}
          <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{actionMessage.text}</span>
        </div>
      )}

      {/* 2. Master Navigation Tabs */}
      <div style={{
        display: 'flex',
        gap: '8px',
        background: 'var(--bg-card)',
        padding: '8px',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-subtle)',
        overflowX: 'auto',
        boxShadow: 'var(--shadow-subtle)'
      }}>
        {[
          { id: 'orders', label: 'Live Orders Hub', icon: <ShoppingBag size={18} />, count: orders.length },
          { id: 'menu', label: 'Menu Delicacies', icon: <Utensils size={18} />, count: foods.length },
          { id: 'restaurants', label: 'Partner Kitchens', icon: <Store size={18} />, count: restaurants.length },
          { id: 'users', label: 'Users & Roles Access', icon: <Users size={18} />, count: usersList.length },
          { id: 'analytics', label: 'Financials & Coupons', icon: <BarChart3 size={18} /> }
        ].map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px 20px',
                borderRadius: 'var(--radius-md)',
                border: isActive ? '1px solid var(--primary)' : '1px solid transparent',
                background: isActive ? 'var(--primary-gradient)' : 'transparent',
                color: isActive ? '#FFFFFF' : 'var(--text-secondary)',
                boxShadow: isActive ? '0 4px 15px var(--primary-glow)' : 'none',
                fontWeight: 700,
                fontSize: '0.92rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all var(--transition-fast)'
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'var(--bg-elevated)';
                  e.currentTarget.style.color = 'var(--text-main)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }
              }}
            >
              <span style={{ display: 'flex', color: isActive ? '#FFFFFF' : 'var(--primary)' }}>
                {tab.icon}
              </span>
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span style={{
                  fontSize: '0.72rem',
                  fontWeight: 900,
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-full)',
                  background: isActive ? 'rgba(0,0,0,0.25)' : 'var(--bg-elevated)',
                  color: isActive ? '#FFFFFF' : 'var(--text-main)'
                }}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: LIVE ORDERS MASTER */}
      {/* ========================================================================= */}
      {activeTab === 'orders' && (
        <div key="admin-orders" className="tab-content-enter" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Filter & Search Bar */}
          <div className="glass-panel" style={{
            padding: '16px 20px',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px'
          }}>
            <div style={{ position: 'relative', minWidth: '280px', flex: 1, maxWidth: '450px' }}>
              <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Search by Order ID, Name, Phone..."
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px 10px 40px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.88rem'
                }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Filter size={14} /> STATUS:
              </span>
              {['all', 'Pending', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'].map(st => {
                const isSelected = orderFilter.toLowerCase() === st.toLowerCase();
                return (
                  <button
                    key={st}
                    onClick={() => setOrderFilter(st)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: 'var(--radius-full)',
                      border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border-subtle)',
                      background: isSelected ? 'var(--primary-gradient)' : 'var(--bg-elevated)',
                      color: isSelected ? '#FFFFFF' : 'var(--text-secondary)',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all var(--transition-fast)'
                    }}
                  >
                    {st}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Orders Grid */}
          {filteredOrders.length === 0 ? (
            <div className="glass-panel" style={{ padding: '60px 20px', textAlign: 'center', borderRadius: 'var(--radius-lg)' }}>
              <ShoppingBag size={48} color="var(--text-muted)" style={{ margin: '0 auto 16px' }} />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '6px' }}>No Orders Found</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No orders matching the current filter criteria.</p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
              gap: '20px'
            }}>
              {filteredOrders.map((order, idx) => (
                <div
                  key={order._id || order.orderId}
                  className="glass-panel interactive-card stagger-card"
                  style={{
                    borderRadius: 'var(--radius-lg)',
                    padding: '22px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '16px',
                    boxShadow: 'var(--shadow-subtle)',
                    animationDelay: `${Math.min(idx * 0.05, 0.4)}s`
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    
                    {/* Card Header */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{
                          fontFamily: 'monospace',
                          fontWeight: 800,
                          fontSize: '0.85rem',
                          background: 'rgba(255, 94, 30, 0.15)',
                          color: 'var(--primary)',
                          padding: '3px 8px',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid rgba(255, 94, 30, 0.3)'
                        }}>
                          #{order.orderId || order._id?.slice(-8)}
                        </span>
                        <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                          {new Date(order.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(order.createdAt || Date.now()).toLocaleDateString()}
                        </span>
                      </div>

                      <button
                        onClick={() => handleDeleteOrder(order._id || order.orderId)}
                        className="btn btn-ghost btn-sm"
                        style={{ padding: '6px', color: 'var(--nonveg-color)' }}
                        title="Delete Order (Admin Super-Power)"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    {/* Customer & Address Details */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '12px',
                      background: 'var(--bg-elevated)',
                      padding: '12px 14px',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.8rem'
                    }}>
                      <div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' }}>Customer</div>
                        <div style={{ fontWeight: 700, color: 'var(--text-main)', marginTop: '2px' }}>{order.deliveryAddress?.fullName || 'Guest Customer'}</div>
                        <div style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px', fontWeight: 600 }}>
                          <Phone size={12} /> {order.deliveryAddress?.phone || 'No phone'}
                        </div>
                      </div>

                      <div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' }}>Delivery Address</div>
                        <div style={{ fontWeight: 600, color: 'var(--text-secondary)', marginTop: '2px', display: 'flex', alignItems: 'flex-start', gap: '4px' }}>
                          <MapPin size={13} color="var(--veg-color)" style={{ flexShrink: 0, marginTop: '2px' }} />
                          <span style={{ lineClamp: 2 }}>{order.deliveryAddress?.street}, {order.deliveryAddress?.city || 'Bengaluru'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Ordered Items */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '130px', overflowY: 'auto' }}>
                      {order.items?.map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                          <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                            {item.quantity}x {item.name}
                          </span>
                          <span style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>
                            ₹{item.price * item.quantity}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Card Footer: Bill & Status Changer */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderTop: '1px solid var(--border-subtle)',
                    paddingTop: '14px',
                    marginTop: '6px'
                  }}>
                    <div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Total Bill</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--primary)', display: 'flex', alignItems: 'center' }}>
                        <IndianRupee size={18} />
                        <span>{order.total || 0}</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)' }}>Status:</span>
                      <select
                        value={order.orderStatus || 'Pending'}
                        onChange={(e) => handleUpdateOrderStatus(order._id || order.orderId, e.target.value)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: 'var(--radius-md)',
                          fontWeight: 700,
                          fontSize: '0.82rem',
                          cursor: 'pointer',
                          background: 'var(--bg-elevated)',
                          borderColor: order.orderStatus === 'Delivered' ? 'var(--veg-color)' : order.orderStatus === 'Cancelled' ? 'var(--nonveg-color)' : 'var(--primary)'
                        }}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Preparing">Preparing</option>
                        <option value="Out for Delivery">Out for Delivery</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: MENU DELICACIES CATALOG */}
      {/* ========================================================================= */}
      {activeTab === 'menu' && (
        <div key="admin-menu" className="tab-content-enter" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Toolbar */}
          <div className="glass-panel" style={{
            padding: '16px 20px',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', minWidth: '240px', flex: 1, maxWidth: '400px' }}>
                <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder="Search dishes..."
                  value={foodSearch}
                  onChange={(e) => setFoodSearch(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px 10px 40px', borderRadius: 'var(--radius-md)', fontSize: '0.88rem' }}
                />
              </div>

              <select
                value={foodCategoryFilter}
                onChange={(e) => setFoodCategoryFilter(e.target.value)}
                style={{ padding: '10px 16px', borderRadius: 'var(--radius-md)', fontSize: '0.88rem', fontWeight: 600 }}
              >
                <option value="all">All Categories</option>
                <option value="pizza">Pizza</option>
                <option value="burger">Burger</option>
                <option value="biryani">Biryani</option>
                <option value="asian">Asian / Bowls</option>
                <option value="dessert">Desserts</option>
                <option value="beverage">Beverages</option>
              </select>
            </div>

            <button
              onClick={handleOpenAddFood}
              className="btn btn-primary"
              style={{ padding: '10px 20px', fontSize: '0.9rem' }}
            >
              <Plus size={18} />
              <span>Add New Food Item</span>
            </button>
          </div>

          {/* Foods Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '20px'
          }}>
            {filteredFoods.map((food, idx) => (
              <div
                key={food.id || food._id}
                className="glass-panel interactive-card stagger-card"
                style={{
                  borderRadius: 'var(--radius-lg)',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: 'var(--shadow-subtle)',
                  animationDelay: `${Math.min(idx * 0.04, 0.4)}s`
                }}
              >
                <div>
                  <div style={{ position: 'relative', height: '170px', overflow: 'hidden', background: 'var(--bg-elevated)' }}>
                    <img
                      src={food.image}
                      alt={food.name}
                      className="card-img-zoom"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80'; }}
                    />
                    <div style={{ position: 'absolute', top: '10px', left: '10px', display: 'flex', gap: '6px' }}>
                      <span className={`badge ${food.isVeg ? 'badge-veg' : 'badge-nonveg'}`}>
                        <Leaf size={12} />
                        {food.isVeg ? 'Veg' : 'Non-Veg'}
                      </span>
                      <span className="badge" style={{ background: 'rgba(0,0,0,0.65)', color: '#FFFFFF', backdropFilter: 'blur(4px)' }}>
                        {food.category}
                      </span>
                    </div>
                  </div>

                  <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {food.name}
                    </h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0, lineClamp: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {food.description}
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '0.76rem', color: 'var(--text-muted)', paddingTop: '4px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={13} color="var(--primary)" /> {food.prepTime || '15 min'}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Flame size={13} color="var(--rating-color)" /> {food.calories || '500 kcal'}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{
                  padding: '14px 16px',
                  borderTop: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'var(--bg-elevated)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                    <span style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--primary)' }}>₹{food.price}</span>
                    {food.originalPrice && (
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>₹{food.originalPrice}</span>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <button
                      onClick={() => handleOpenEditFood(food)}
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '6px 10px' }}
                      title="Edit Item"
                    >
                      <Edit3 size={15} />
                    </button>
                    <button
                      onClick={() => handleDeleteFood(food.id || food._id, food.name)}
                      className="btn btn-ghost btn-sm"
                      style={{ padding: '6px 10px', color: 'var(--nonveg-color)' }}
                      title="Delete Item"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: PARTNER RESTAURANTS */}
      {/* ========================================================================= */}
      {activeTab === 'restaurants' && (
        <div key="admin-restaurants" className="tab-content-enter" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div className="glass-panel" style={{
            padding: '16px 20px',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px'
          }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>Partner Kitchens & Outlets</h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
                Control live store open/closed status, menus, and delivery parameters.
              </p>
            </div>

            <button
              onClick={handleOpenAddRest}
              className="btn btn-primary"
              style={{ padding: '10px 20px', fontSize: '0.9rem' }}
            >
              <Plus size={18} />
              <span>Add Partner Restaurant</span>
            </button>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: '20px'
          }}>
            {restaurants.map((rest, idx) => (
              <div
                key={rest.id || rest._id}
                className="glass-panel interactive-card stagger-card"
                style={{
                  borderRadius: 'var(--radius-lg)',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: 'var(--shadow-subtle)',
                  animationDelay: `${Math.min(idx * 0.05, 0.4)}s`
                }}
              >
                <div>
                  <div style={{ position: 'relative', height: '160px', background: 'var(--bg-elevated)', overflow: 'hidden' }}>
                    <img
                      src={rest.image}
                      alt={rest.name}
                      className="card-img-zoom"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80'; }}
                    />
                    <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.75rem',
                        fontWeight: 900,
                        background: rest.isOpen !== false ? 'var(--veg-color)' : 'var(--nonveg-color)',
                        color: '#FFFFFF',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.3)'
                      }}>
                        {rest.isOpen !== false ? 'OPEN FOR ORDERS' : 'STORE CLOSED'}
                      </span>
                    </div>
                  </div>

                  <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <h4 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>{rest.name}</h4>
                      <span className="badge badge-rating">★ {rest.rating || 4.8}</span>
                    </div>

                    <div style={{ fontSize: '0.82rem', color: 'var(--primary)', fontWeight: 600 }}>{rest.cuisine}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <MapPin size={14} color="var(--text-muted)" /> {rest.address || 'Bengaluru'}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Clock size={14} /> Delivery in {rest.deliveryTime || '25-35 min'}
                    </div>
                  </div>
                </div>

                <div style={{
                  padding: '14px 16px',
                  borderTop: '1px solid var(--border-subtle)',
                  background: 'var(--bg-elevated)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <button
                    onClick={() => handleToggleRestStatus(rest)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: 'var(--radius-md)',
                      border: 'none',
                      background: rest.isOpen !== false ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                      color: rest.isOpen !== false ? 'var(--nonveg-color)' : 'var(--veg-color)',
                      fontWeight: 800,
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <Power size={14} />
                    <span>{rest.isOpen !== false ? 'Set Closed' : 'Set Open'}</span>
                  </button>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <button
                      onClick={() => handleOpenEditRest(rest)}
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '6px 10px' }}
                      title="Edit Restaurant"
                    >
                      <Edit3 size={15} />
                    </button>
                    <button
                      onClick={() => handleDeleteRest(rest.id || rest._id, rest.name)}
                      className="btn btn-ghost btn-sm"
                      style={{ padding: '6px 10px', color: 'var(--nonveg-color)' }}
                      title="Delete Restaurant"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: USERS & ROLE ACCESS ENGINE */}
      {/* ========================================================================= */}
      {activeTab === 'users' && (
        <div key="admin-users" className="tab-content-enter" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Toolbar */}
          <div className="glass-panel" style={{
            padding: '16px 20px',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', minWidth: '240px', flex: 1, maxWidth: '400px' }}>
                <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder="Search by Name, Email, Phone..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px 10px 40px', borderRadius: 'var(--radius-md)', fontSize: '0.88rem' }}
                />
              </div>

              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
                style={{ padding: '10px 16px', borderRadius: 'var(--radius-md)', fontSize: '0.88rem', fontWeight: 600 }}
              >
                <option value="all">All Roles</option>
                <option value="admin">👑 Admins</option>
                <option value="restaurant">🍳 Kitchen Chefs</option>
                <option value="customer">👤 Customers</option>
              </select>
            </div>

            <button
              onClick={() => setIsUserModalOpen(true)}
              className="btn btn-primary"
              style={{ padding: '10px 20px', fontSize: '0.9rem' }}
            >
              <Plus size={18} />
              <span>Create New User</span>
            </button>
          </div>

          {/* Users Table */}
          <div className="glass-panel" style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-card)' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    <th style={{ padding: '16px 20px' }}>User Details</th>
                    <th style={{ padding: '16px 20px' }}>Contact Info</th>
                    <th style={{ padding: '16px 20px' }}>Current Role</th>
                    <th style={{ padding: '16px 20px' }}>Live Role Permissions Switch</th>
                    <th style={{ padding: '16px 20px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(u => (
                    <tr 
                      key={u._id || u.id}
                      style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background var(--transition-fast)' }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-card-hover)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <img
                            src={u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(u.name || 'User')}`}
                            alt={u.name}
                            style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover', background: 'var(--bg-elevated)' }}
                          />
                          <div>
                            <div style={{ fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span>{u.name}</span>
                              {u.email === 'admin@cravecourier.com' && (
                                <span style={{
                                  fontSize: '0.65rem',
                                  fontWeight: 900,
                                  color: '#F59E0B',
                                  background: 'rgba(245, 158, 11, 0.2)',
                                  border: '1px solid rgba(245, 158, 11, 0.4)',
                                  padding: '1px 6px',
                                  borderRadius: 'var(--radius-sm)'
                                }}>
                                  ROOT ADMIN
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.address || 'Bengaluru, India'}</div>
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                          <span style={{ color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Mail size={13} color="var(--primary)" /> {u.email}
                          </span>
                          <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Phone size={13} color="var(--veg-color)" /> {u.phone || 'N/A'}
                          </span>
                        </div>
                      </td>

                      <td style={{ padding: '16px 20px' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '4px 12px',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '0.75rem',
                          fontWeight: 800,
                          textTransform: 'uppercase',
                          background: u.role === 'admin' 
                            ? 'rgba(139, 92, 246, 0.15)' 
                            : u.role === 'restaurant' 
                            ? 'rgba(245, 158, 11, 0.15)' 
                            : 'rgba(59, 130, 246, 0.15)',
                          color: u.role === 'admin' 
                            ? '#A78BFA' 
                            : u.role === 'restaurant' 
                            ? '#FBBF24' 
                            : '#60A5FA',
                          border: `1px solid ${u.role === 'admin' ? 'rgba(139, 92, 246, 0.3)' : u.role === 'restaurant' ? 'rgba(245, 158, 11, 0.3)' : 'rgba(59, 130, 246, 0.3)'}`
                        }}>
                          {u.role === 'admin' ? <Crown size={13} /> : u.role === 'restaurant' ? <ChefHat size={13} /> : <Users size={13} />}
                          {u.role === 'admin' ? 'Admin 👑' : u.role === 'restaurant' ? 'Chef 🍳' : 'Customer 👤'}
                        </span>
                      </td>

                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <button
                            onClick={() => handleUpdateRole(u, 'customer')}
                            disabled={u.role === 'customer'}
                            style={{
                              padding: '5px 10px',
                              borderRadius: 'var(--radius-sm)',
                              border: u.role === 'customer' ? '1px solid rgba(59, 130, 246, 0.5)' : '1px solid var(--border-subtle)',
                              background: u.role === 'customer' ? 'rgba(59, 130, 246, 0.2)' : 'var(--bg-elevated)',
                              color: u.role === 'customer' ? '#60A5FA' : 'var(--text-secondary)',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              cursor: u.role === 'customer' ? 'default' : 'pointer'
                            }}
                          >
                            Customer
                          </button>
                          <button
                            onClick={() => handleUpdateRole(u, 'restaurant')}
                            disabled={u.role === 'restaurant'}
                            style={{
                              padding: '5px 10px',
                              borderRadius: 'var(--radius-sm)',
                              border: u.role === 'restaurant' ? '1px solid rgba(245, 158, 11, 0.5)' : '1px solid var(--border-subtle)',
                              background: u.role === 'restaurant' ? 'rgba(245, 158, 11, 0.2)' : 'var(--bg-elevated)',
                              color: u.role === 'restaurant' ? '#FBBF24' : 'var(--text-secondary)',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              cursor: u.role === 'restaurant' ? 'default' : 'pointer'
                            }}
                          >
                            Chef
                          </button>
                          <button
                            onClick={() => handleUpdateRole(u, 'admin')}
                            disabled={u.role === 'admin'}
                            style={{
                              padding: '5px 10px',
                              borderRadius: 'var(--radius-sm)',
                              border: u.role === 'admin' ? '1px solid rgba(139, 92, 246, 0.5)' : '1px solid var(--border-subtle)',
                              background: u.role === 'admin' ? 'rgba(139, 92, 246, 0.2)' : 'var(--bg-elevated)',
                              color: u.role === 'admin' ? '#A78BFA' : 'var(--text-secondary)',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              cursor: u.role === 'admin' ? 'default' : 'pointer'
                            }}
                          >
                            👑 Admin
                          </button>
                        </div>
                      </td>

                      <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                        <button
                          onClick={() => handleDeleteUser(u)}
                          disabled={u.email === 'admin@cravecourier.com'}
                          className="btn btn-ghost btn-sm"
                          style={{ padding: '6px', color: 'var(--nonveg-color)', opacity: u.email === 'admin@cravecourier.com' ? 0.3 : 1 }}
                          title="Delete User Account"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: FINANCIALS & PROMO COUPONS */}
      {/* ========================================================================= */}
      {activeTab === 'analytics' && (
        <div key="admin-analytics" className="tab-content-enter" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* 4 Financial Stat KPI Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '20px'
          }}>
            <div className="glass-panel interactive-card stagger-card" style={{ padding: '22px', borderRadius: 'var(--radius-lg)', animationDelay: '0.05s' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Gross Revenue</span>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--veg-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <IndianRupee size={20} />
                </div>
              </div>
              <div style={{ fontSize: '1.9rem', fontWeight: 900, color: 'var(--text-main)', marginTop: '12px', display: 'flex', alignItems: 'center' }}>
                <IndianRupee size={24} />
                <span>{stats?.metrics?.totalRevenue || 0}</span>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--veg-color)', margin: '4px 0 0', fontWeight: 600 }}>Platform Order Volume Sales</p>
            </div>

            <div className="glass-panel interactive-card stagger-card" style={{ padding: '22px', borderRadius: 'var(--radius-lg)', animationDelay: '0.1s' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Orders Placed</span>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(255, 94, 30, 0.15)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShoppingBag size={20} />
                </div>
              </div>
              <div style={{ fontSize: '1.9rem', fontWeight: 900, color: 'var(--text-main)', marginTop: '12px' }}>
                {stats?.metrics?.totalOrders || orders.length}
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--rating-color)', margin: '4px 0 0', fontWeight: 600 }}>
                {stats?.metrics?.activeOrders || 0} currently in kitchen
              </p>
            </div>

            <div className="glass-panel interactive-card stagger-card" style={{ padding: '22px', borderRadius: 'var(--radius-lg)', animationDelay: '0.15s' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>GST Collected (5%)</span>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(139, 92, 246, 0.15)', color: '#A78BFA', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Tag size={20} />
                </div>
              </div>
              <div style={{ fontSize: '1.9rem', fontWeight: 900, color: 'var(--text-main)', marginTop: '12px', display: 'flex', alignItems: 'center' }}>
                <IndianRupee size={24} />
                <span>{Number(((stats?.metrics?.totalRevenue || 0) * 0.05).toFixed(2))}</span>
              </div>
              <p style={{ fontSize: '0.78rem', color: '#A78BFA', margin: '4px 0 0', fontWeight: 600 }}>Standard Food Tax</p>
            </div>

            <div className="glass-panel interactive-card stagger-card" style={{ padding: '22px', borderRadius: 'var(--radius-lg)', animationDelay: '0.2s' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Active Accounts</span>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.15)', color: '#60A5FA', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Users size={20} />
                </div>
              </div>
              <div style={{ fontSize: '1.9rem', fontWeight: 900, color: 'var(--text-main)', marginTop: '12px' }}>
                {stats?.metrics?.totalUsers || usersList.length}
              </div>
              <p style={{ fontSize: '0.78rem', color: '#60A5FA', margin: '4px 0 0', fontWeight: 600 }}>Registered Platform Users</p>
            </div>
          </div>

          {/* Distribution & Promo Coupons */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
            
            {/* Category Revenue Distribution */}
            <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Utensils size={18} color="var(--primary)" />
                <span>Category Revenue Distribution</span>
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '6px' }}>
                {stats?.categorySales && Object.keys(stats.categorySales).length > 0 ? (
                  Object.entries(stats.categorySales).map(([cat, amount]) => {
                    const total = stats?.metrics?.totalRevenue || 1;
                    const pct = Math.min(100, Math.round((amount / total) * 100));
                    return (
                      <div key={cat} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 700 }}>
                          <span style={{ textTransform: 'capitalize', color: 'var(--text-main)' }}>{cat}</span>
                          <span style={{ color: 'var(--primary)' }}>₹{amount} ({pct}%)</span>
                        </div>
                        <div style={{ width: '100%', height: '8px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                          <div style={{ width: `${Math.max(6, pct)}%`, height: '100%', background: 'var(--primary-gradient)', borderRadius: 'var(--radius-full)' }} />
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', padding: '20px 0', textAlign: 'center' }}>
                    Place customer orders to populate category revenue analytics.
                  </p>
                )}
              </div>
            </div>

            {/* Promo Discount Coupons Manager */}
            <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Tag size={18} color="var(--rating-color)" />
                <span>Promo Discount Coupons</span>
              </h3>

              {/* Coupon Add Form */}
              <form onSubmit={handleCreateCoupon} style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr auto',
                gap: '8px',
                background: 'var(--bg-elevated)',
                padding: '12px',
                borderRadius: 'var(--radius-md)'
              }}>
                <input
                  type="text"
                  placeholder="CODE (e.g. CRAVE50)"
                  value={couponForm.code}
                  onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                  required
                  style={{ padding: '8px 12px', borderRadius: 'var(--radius-sm)', fontSize: '0.82rem', fontFamily: 'monospace', fontWeight: 800, textTransform: 'uppercase' }}
                />
                <input
                  type="number"
                  placeholder="Discount ₹"
                  value={couponForm.discount}
                  onChange={(e) => setCouponForm({ ...couponForm, discount: e.target.value })}
                  required
                  style={{ padding: '8px 12px', borderRadius: 'var(--radius-sm)', fontSize: '0.82rem' }}
                />
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  style={{ padding: '8px 16px', gridColumn: 'span 3', justifySelf: 'stretch', marginTop: '4px' }}
                >
                  + Add Coupon Code
                </button>
              </form>

              {/* Existing Coupons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto' }}>
                {coupons.map(c => (
                  <div key={c.code} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    background: 'var(--bg-elevated)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{
                        fontFamily: 'monospace',
                        fontWeight: 900,
                        fontSize: '0.82rem',
                        color: 'var(--rating-color)',
                        background: 'rgba(245, 158, 11, 0.15)',
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-sm)'
                      }}>
                        {c.code}
                      </span>
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)' }}>
                        ₹{c.discount} OFF <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>(Min ₹{c.minOrder || 0})</span>
                      </span>
                    </div>

                    <button
                      onClick={() => handleDeleteCoupon(c.code)}
                      className="btn btn-ghost btn-sm"
                      style={{ padding: '4px 8px', color: 'var(--nonveg-color)' }}
                      title="Delete Coupon"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT FOOD */}
      {/* ========================================================================= */}
      {isFoodModalOpen && (
        <div className="modal-overlay">
          <div className="glass-panel animate-modal" style={{
            maxWidth: '520px',
            width: '100%',
            padding: '28px',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '14px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Utensils size={20} color="var(--primary)" />
                <span>{editingFood ? 'Edit Dish' : 'Add New Delicacy'}</span>
              </h3>
              <button onClick={() => setIsFoodModalOpen(false)} className="btn btn-ghost btn-sm" style={{ padding: '6px' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveFood} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>Dish Name *</label>
                <input
                  type="text"
                  required
                  value={foodForm.name}
                  onChange={(e) => setFoodForm({ ...foodForm, name: e.target.value })}
                  placeholder="e.g. Royal Hyderabadi Dum Biryani"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>Category *</label>
                  <select
                    value={foodForm.category}
                    onChange={(e) => setFoodForm({ ...foodForm, category: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)' }}
                  >
                    <option value="pizza">Pizza</option>
                    <option value="burger">Burger</option>
                    <option value="biryani">Biryani</option>
                    <option value="asian">Asian / Bowls</option>
                    <option value="dessert">Desserts</option>
                    <option value="beverage">Beverages</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>Dietary Type</label>
                  <button
                    type="button"
                    onClick={() => setFoodForm({ ...foodForm, isVeg: !foodForm.isVeg })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-md)',
                      border: `1px solid ${foodForm.isVeg ? 'var(--veg-color)' : 'var(--nonveg-color)'}`,
                      background: foodForm.isVeg ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                      color: foodForm.isVeg ? 'var(--veg-color)' : 'var(--nonveg-color)',
                      fontWeight: 800,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    <Leaf size={14} />
                    <span>{foodForm.isVeg ? 'Pure Veg 🟢' : 'Non-Veg 🔴'}</span>
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>Selling Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="1"
                    value={foodForm.price}
                    onChange={(e) => setFoodForm({ ...foodForm, price: e.target.value })}
                    placeholder="299"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>Original Price (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={foodForm.originalPrice}
                    onChange={(e) => setFoodForm({ ...foodForm, originalPrice: e.target.value })}
                    placeholder="399"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>Image URL</label>
                <input
                  type="url"
                  value={foodForm.image}
                  onChange={(e) => setFoodForm({ ...foodForm, image: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>Description</label>
                <textarea
                  rows="2"
                  value={foodForm.description}
                  onChange={(e) => setFoodForm({ ...foodForm, description: e.target.value })}
                  placeholder="Fresh herbs, slow-cooked spices..."
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', resize: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
                <button type="button" onClick={() => setIsFoodModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingFood ? 'Save Changes' : 'Create Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT RESTAURANT */}
      {/* ========================================================================= */}
      {isRestModalOpen && (
        <div className="modal-overlay">
          <div className="glass-panel animate-modal" style={{
            maxWidth: '520px',
            width: '100%',
            padding: '28px',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '14px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Store size={20} color="var(--primary)" />
                <span>{editingRest ? 'Edit Restaurant' : 'Add Partner Kitchen'}</span>
              </h3>
              <button onClick={() => setIsRestModalOpen(false)} className="btn btn-ghost btn-sm" style={{ padding: '6px' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveRest} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>Restaurant Name *</label>
                <input
                  type="text"
                  required
                  value={restForm.name}
                  onChange={(e) => setRestForm({ ...restForm, name: e.target.value })}
                  placeholder="e.g. Royal Biryani Palace"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>Cuisines & Specialties *</label>
                <input
                  type="text"
                  required
                  value={restForm.cuisine}
                  onChange={(e) => setRestForm({ ...restForm, cuisine: e.target.value })}
                  placeholder="North Indian, Biryani, Kebabs"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>Address & Location *</label>
                <input
                  type="text"
                  required
                  value={restForm.address}
                  onChange={(e) => setRestForm({ ...restForm, address: e.target.value })}
                  placeholder="Indiranagar 100ft Rd, Bengaluru"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>Delivery Time</label>
                  <input
                    type="text"
                    value={restForm.deliveryTime}
                    onChange={(e) => setRestForm({ ...restForm, deliveryTime: e.target.value })}
                    placeholder="25-35 min"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>Kitchen State</label>
                  <button
                    type="button"
                    onClick={() => setRestForm({ ...restForm, isOpen: !restForm.isOpen })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-md)',
                      border: `1px solid ${restForm.isOpen ? 'var(--veg-color)' : 'var(--nonveg-color)'}`,
                      background: restForm.isOpen ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                      color: restForm.isOpen ? 'var(--veg-color)' : 'var(--nonveg-color)',
                      fontWeight: 800,
                      fontSize: '0.82rem',
                      cursor: 'pointer'
                    }}
                  >
                    {restForm.isOpen ? 'OPEN FOR ORDERS' : 'STORE CLOSED'}
                  </button>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>Cover Image URL</label>
                <input
                  type="url"
                  value={restForm.image}
                  onChange={(e) => setRestForm({ ...restForm, image: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
                <button type="button" onClick={() => setIsRestModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingRest ? 'Save Changes' : 'Create Restaurant'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CREATE USER WITH ROLE */}
      {/* ========================================================================= */}
      {isUserModalOpen && (
        <div className="modal-overlay">
          <div className="glass-panel animate-modal" style={{
            maxWidth: '520px',
            width: '100%',
            padding: '28px',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '14px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Crown size={20} color="var(--rating-color)" />
                <span>Create New User Account</span>
              </h3>
              <button onClick={() => setIsUserModalOpen(false)} className="btn btn-ghost btn-sm" style={{ padding: '6px' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>Full Name *</label>
                <input
                  type="text"
                  required
                  value={userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  placeholder="e.g. Ramesh Sharma"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>Email Address *</label>
                  <input
                    type="email"
                    required
                    value={userForm.email}
                    onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                    placeholder="user@cravecourier.com"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>Mobile Number (OTP)</label>
                  <input
                    type="tel"
                    value={userForm.phone}
                    onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                    placeholder="9876543210"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>Password *</label>
                  <input
                    type="password"
                    required
                    value={userForm.password}
                    onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                    placeholder="Min 6 characters"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>Role Permission *</label>
                  <select
                    value={userForm.role}
                    onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', fontWeight: 700 }}
                  >
                    <option value="customer">👤 Customer</option>
                    <option value="restaurant">🍳 Kitchen Chef / Store</option>
                    <option value="admin">👑 Super Administrator</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>City / Address</label>
                <input
                  type="text"
                  value={userForm.address}
                  onChange={(e) => setUserForm({ ...userForm, address: e.target.value })}
                  placeholder="Indiranagar, Bengaluru, Karnataka"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
                <button type="button" onClick={() => setIsUserModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
