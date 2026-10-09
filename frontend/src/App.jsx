import React, { useState, useEffect, Component } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LocationProvider } from './context/LocationContext';
import { CartProvider } from './context/CartContext';
import { NotificationProvider, useNotification } from './context/NotificationContext';

import { LoginPage } from './components/LoginPage';
import { Sidebar } from './components/Sidebar';
import { HeroSection } from './components/HeroSection';
import { CategoryBar } from './components/CategoryBar';
import { FiltersBar } from './components/FiltersBar';
import { FoodCard } from './components/FoodCard';
import { FoodModal } from './components/FoodModal';
import { RestaurantCard } from './components/RestaurantCard';
import { RestaurantView } from './components/RestaurantView';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderTrackingView } from './components/OrderTrackingView';
import { AdminDashboard } from './components/AdminDashboard';
import { AuthModal } from './components/AuthModal';
import { LocationModal } from './components/LocationModal';
import { UserOrdersModal } from './components/UserOrdersModal';
import { NotificationToast } from './components/NotificationToast';
import { NotificationCenterModal } from './components/NotificationCenterModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { Footer } from './components/Footer';

import { initialCategories, initialFoods, initialRestaurants } from './data/initialData';
import { api } from './services/api';

// Error Boundary for bulletproof stability
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0B0F17',
          color: '#fff',
          padding: '20px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🍽️</div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '8px' }}>Something went off the menu!</h2>
          <p style={{ color: '#94A3B8', marginBottom: '24px', maxWidth: '480px' }}>
            {this.state.error?.message || 'A unexpected render glitch occurred.'}
          </p>
          <button
            onClick={() => { localStorage.clear(); window.location.reload(); }}
            className="btn btn-primary"
          >
            Refresh & Reset Session
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function MainApp() {
  const { user, isGuestMode, continueAsGuest } = useAuth();
  const { triggerOrderNotification } = useNotification();

  const [currentTab, setCurrentTab] = useState(() => {
    if (user?.role === 'admin' || user?.role === 'restaurant') return 'admin';
    return 'menu';
  });

  const [categories, setCategories] = useState(initialCategories);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [dietaryFilter, setDietaryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [searchQuery, setSearchQuery] = useState('');

  const [foods, setFoods] = useState(initialFoods);
  const [restaurants, setRestaurants] = useState(initialRestaurants);
  const [loading, setLoading] = useState(false);

  // Modals & Active Selections
  const [selectedFoodForModal, setSelectedFoodForModal] = useState(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [trackingOrderId, setTrackingOrderId] = useState(null);
  const [isPastOrdersOpen, setIsPastOrdersOpen] = useState(false);

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('crave_sidebar_collapsed');
    return saved !== null ? saved === 'true' : true; // Default to collapsed
  });

  // Automatically redirect user to their designated panel on login/auth change
  useEffect(() => {
    if (user?.role === 'admin' || user?.role === 'restaurant') {
      setCurrentTab('admin');
    } else if (user?.role === 'customer') {
      setCurrentTab('menu');
    }
  }, [user?._id, user?.role]);

  // Window listener for native browser notification click routing
  useEffect(() => {
    const handleNavEvent = (e) => {
      if (e.detail?.tab) {
        setCurrentTab(e.detail.tab);
        if (e.detail?.orderId) {
          setTrackingOrderId(e.detail.orderId);
        }
      }
    };
    window.addEventListener('crave_navigate_tab', handleNavEvent);
    return () => window.removeEventListener('crave_navigate_tab', handleNavEvent);
  }, []);

  // Fetch Live Data from Backend API
  const loadData = async () => {
    try {
      const [catsData, foodsData, restsData] = await Promise.all([
        api.getCategories().catch(() => null),
        api.getFoods().catch(() => null),
        api.getRestaurants().catch(() => null)
      ]);

      if (Array.isArray(catsData) && catsData.length > 0) setCategories(catsData);
      if (Array.isArray(foodsData) && foodsData.length > 0) setFoods(foodsData);
      if (Array.isArray(restsData) && restsData.length > 0) setRestaurants(restsData);
    } catch (err) {
      console.warn('Live API sync fallback, using instant initial store:', err.message);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // If user is not authenticated and has not clicked guest explore, render LoginPage as first view
  if (!user && !isGuestMode) {
    return <LoginPage onGuestContinue={continueAsGuest} />;
  }

  // Filter & Sort Foods in Memory
  const safeFoods = Array.isArray(foods) ? foods : [];
  const filteredFoods = safeFoods.filter(food => {
    if (!food) return false;

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = food.name?.toLowerCase().includes(q);
      const matchDesc = food.description?.toLowerCase().includes(q);
      const matchRest = food.restaurantName?.toLowerCase().includes(q);
      const matchTag = food.tags?.some(t => t?.toLowerCase().includes(q));
      if (!matchName && !matchDesc && !matchRest && !matchTag) return false;
    }

    // Category filter
    if (selectedCategory && selectedCategory !== 'all') {
      if (food.category?.toLowerCase() !== selectedCategory.toLowerCase()) return false;
    }

    // Dietary filter
    if (dietaryFilter === 'veg' && !food.isVeg) return false;
    if (dietaryFilter === 'nonveg' && food.isVeg) return false;
    if (dietaryFilter === 'vegan' && !food.isVegan) return false;
    if (dietaryFilter === 'glutenFree' && !food.isGlutenFree) return false;

    return true;
  }).sort((a, b) => {
    if (sortBy === 'price_asc') return (a.price || 0) - (b.price || 0);
    if (sortBy === 'price_desc') return (b.price || 0) - (a.price || 0);
    if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
    // default: popular
    return (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0);
  });

  const handleOrderPlaced = (newOrder) => {
    const orderId = newOrder?.orderId || newOrder?._id || 'ORD-98214';
    setTrackingOrderId(orderId);
    triggerOrderNotification('placed', newOrder);
    setCurrentTab('tracking');
  };

  const handleTrackOrderFromHistory = (orderId) => {
    setTrackingOrderId(orderId);
    setCurrentTab('tracking');
  };

  const handleNavigateFromNotification = (tab, orderId) => {
    setCurrentTab(tab);
    if (orderId) {
      setTrackingOrderId(orderId);
    }
  };

  return (
    <div className={`layout-root ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Sleek Vertical Left Sidebar (Permanently Stuck / Fixed) */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenOrdersModal={() => setIsPastOrdersOpen(true)}
        onOpenTrackingModal={() => setCurrentTab('tracking')}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />

      {/* Main Content Viewport */}
      <div className="layout-main">
        <main style={{ flex: 1 }}>
          {/* TAB 1: MENU & DISCOVERY */}
          {currentTab === 'menu' && (
            <div key="tab-menu" className="tab-content-enter">
              {/* Hero Section shown on clean menu start */}
              {!searchQuery && selectedCategory === 'all' && (
                <HeroSection
                  onSelectCategory={(catId) => setSelectedCategory(catId)}
                  onTagClick={(query) => setSearchQuery(query)}
                />
              )}

              <div className="app-container" style={{ paddingBottom: '60px', paddingTop: searchQuery ? '30px' : '0' }}>
                {/* Category Slider Bar */}
                <CategoryBar
                  categories={categories}
                  selectedCategory={selectedCategory}
                  onSelectCategory={(catId) => setSelectedCategory(catId)}
                />

                {/* Filters Bar */}
                <FiltersBar
                  dietaryFilter={dietaryFilter}
                  setDietaryFilter={setDietaryFilter}
                  sortBy={sortBy}
                  setSortBy={setSortBy}
                  itemsCount={filteredFoods.length}
                />

                {/* Food Dishes Grid */}
                {loading ? (
                  <div className="foods-grid">
                    {[1, 2, 3, 4, 5, 6].map(n => (
                      <div key={n} className="skeleton" style={{ height: '340px' }} />
                    ))}
                  </div>
                ) : filteredFoods.length > 0 ? (
                  <div className="foods-grid">
                    {filteredFoods.map((food, idx) => (
                      <div key={food.id || food._id} style={{ animationDelay: `${Math.min(idx * 0.04, 0.4)}s` }}>
                        <FoodCard
                          food={food}
                          onSelectFood={(item) => setSelectedFoodForModal(item)}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="glass-panel" style={{
                    padding: '60px 20px',
                    textAlign: 'center',
                    borderRadius: 'var(--radius-xl)'
                  }}>
                    <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🍽️</div>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '8px' }}>
                      No matching culinary dishes found
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
                      Try clearing your search query or selecting a different dietary filter.
                    </p>
                    <button
                      onClick={() => { setSearchQuery(''); setSelectedCategory('all'); setDietaryFilter('all'); }}
                      className="btn btn-primary"
                    >
                      Reset All Filters
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: RESTAURANTS DIRECTORY */}
          {currentTab === 'restaurants' && (
            <div key="tab-restaurants" className="tab-content-enter app-container" style={{ padding: '30px 20px 60px' }}>
              {selectedRestaurant ? (
                <RestaurantView
                  restaurant={selectedRestaurant}
                  foods={foods}
                  onBack={() => setSelectedRestaurant(null)}
                  onSelectFood={(item) => setSelectedFoodForModal(item)}
                />
              ) : (
                <div>
                  <div style={{ marginBottom: '28px' }}>
                    <span className="badge badge-primary">PARTNER RESTAURANTS</span>
                    <h1 style={{ fontSize: '2.2rem', fontWeight: 900, marginTop: '6px' }}>
                      Top Culinary Kitchens & Artisans
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                      Certified high-standard hygiene, gourmet chefs, and exclusive recipe signatures.
                    </p>
                  </div>

                  <div className="restaurants-grid">
                    {restaurants.map((restaurant, idx) => (
                      <div key={restaurant.id || restaurant._id} style={{ animationDelay: `${Math.min(idx * 0.05, 0.4)}s` }}>
                        <RestaurantCard
                          restaurant={restaurant}
                          onSelectRestaurant={(rest) => setSelectedRestaurant(rest)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: LIVE ORDER TRACKING */}
          {currentTab === 'tracking' && (
            <div key="tab-tracking" className="tab-content-enter app-container" style={{ padding: '30px 20px 60px' }}>
              <OrderTrackingView
                orderId={trackingOrderId}
                onBackToMenu={() => setCurrentTab('menu')}
                onReorder={() => setCurrentTab('menu')}
              />
            </div>
          )}

          {/* TAB 4: ADMIN / KITCHEN DASHBOARD */}
          {currentTab === 'admin' && (
            <div key="tab-admin" className="tab-content-enter app-container" style={{ padding: '30px 20px 60px' }}>
              <AdminDashboard onRefreshData={loadData} />
            </div>
          )}
        </main>

        {/* Modern Footer */}
        <Footer onSelectCategory={(catId) => {
          setSelectedCategory(catId);
          setCurrentTab('menu');
          window.scrollTo({ top: 300, behavior: 'smooth' });
        }} />
      </div>

      {/* Global Modals & Drawers */}
      {selectedFoodForModal && (
        <FoodModal
          food={selectedFoodForModal}
          onClose={() => setSelectedFoodForModal(null)}
        />
      )}

      <CartDrawer />

      <CheckoutModal
        onOrderPlaced={handleOrderPlaced}
      />

      <AuthModal />

      <LocationModal />

      <UserOrdersModal
        isOpen={isPastOrdersOpen}
        onClose={() => setIsPastOrdersOpen(false)}
        onTrackOrder={handleTrackOrderFromHistory}
      />

      {/* Live Interactive Notification Push Toast */}
      <NotificationToast onNavigateTab={handleNavigateFromNotification} />

      {/* Notification Center Drawer / Modal */}
      <NotificationCenterModal onNavigateTab={handleNavigateFromNotification} />

      {/* Mobile Bottom Navigation Switcher */}
      <MobileBottomNav
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenOrdersModal={() => setIsPastOrdersOpen(true)}
      />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <LocationProvider>
            <CartProvider>
              <NotificationProvider>
                <MainApp />
              </NotificationProvider>
            </CartProvider>
          </LocationProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
