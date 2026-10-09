import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Clock, 
  ShieldCheck, 
  Zap, 
  ArrowRight, 
  Tag, 
  Check, 
  Copy, 
  Star, 
  ShoppingBag, 
  Flame, 
  ChevronRight,
  TrendingUp,
  Percent
} from 'lucide-react';
import { useCart } from '../context/CartContext';

export const HeroSection = ({ onSelectCategory, onTagClick }) => {
  const { addToCart, applyCoupon, setIsCartOpen } = useCart();
  const [copiedCode, setCopiedCode] = useState(null);
  const [activeDishIndex, setActiveDishIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [addedDishId, setAddedDishId] = useState(null);

  const spotlightDishes = [
    {
      id: 'spot-1',
      name: 'Hyderabadi Dum Gosht Biryani',
      subtitle: 'Slow-cooked saffron basmati rice with marinated mutton & royal spices',
      category: 'indian',
      price: 449,
      originalPrice: 599,
      discount: '25% OFF',
      rating: 4.9,
      reviewsCount: '3.4k',
      prepTime: '25 mins',
      calories: '680 kcal',
      isVeg: false,
      restaurantName: 'Royal Dawat Palace',
      image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=1000&q=80',
      tag: '🔥 Royal Bestseller'
    },
    {
      id: 'spot-2',
      name: 'Artisan Truffle & Wild Mushroom Pizza',
      subtitle: 'Wood-fired sourdough crust, fior di latte mozzarella & black truffle oil',
      category: 'pizza',
      price: 499,
      originalPrice: 649,
      discount: '23% OFF',
      rating: 4.8,
      reviewsCount: '2.8k',
      prepTime: '20 mins',
      calories: '540 kcal',
      isVeg: true,
      restaurantName: 'Napoli Wood Fired Pizza',
      image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1000&q=80',
      tag: '🍕 Chef Signature'
    },
    {
      id: 'spot-3',
      name: 'Double Smashed Wagyu Cheese Burger',
      subtitle: 'Charred double patties, melted aged cheddar, caramelized onions on brioche',
      category: 'burgers',
      price: 389,
      originalPrice: 499,
      discount: '22% OFF',
      rating: 4.9,
      reviewsCount: '4.6k',
      prepTime: '18 mins',
      calories: '620 kcal',
      isVeg: false,
      restaurantName: 'The Smashed Patty Co.',
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1000&q=80',
      tag: '🍔 Crowd Favorite'
    },
    {
      id: 'spot-4',
      name: 'Tokyo Dragon Salmon Sushi Platter',
      subtitle: 'Fresh Atlantic salmon, creamy avocado, tobiko caviar & unagi glaze',
      category: 'asian',
      price: 549,
      originalPrice: 699,
      discount: '21% OFF',
      rating: 4.9,
      reviewsCount: '1.9k',
      prepTime: '22 mins',
      calories: '420 kcal',
      isVeg: false,
      restaurantName: 'Sakura Zen Asian Bistro',
      image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=1000&q=80',
      tag: '🍣 Artisan Catch'
    },
    {
      id: 'spot-5',
      name: 'Crispy Birria Street Tacos Trio',
      subtitle: 'Slow-braised beef brisket in corn tortillas with spiced consommé dip',
      category: 'mexican',
      price: 369,
      originalPrice: 459,
      discount: '20% OFF',
      rating: 4.7,
      reviewsCount: '1.5k',
      prepTime: '16 mins',
      calories: '480 kcal',
      isVeg: false,
      restaurantName: 'La Taqueria Caliente',
      image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=1000&q=80',
      tag: '🌮 Street Fiesta'
    }
  ];

  const popularTags = [
    { label: '🍛 Dum Biryani', cat: 'indian', query: 'Biryani' },
    { label: '🍕 Truffle Pizza', cat: 'pizza', query: 'Pizza' },
    { label: '🍔 Smashed Burger', cat: 'burgers', query: 'Burger' },
    { label: '🍗 Butter Chicken', cat: 'indian', query: 'Butter Chicken' },
    { label: '🍣 Salmon Sushi', cat: 'asian', query: 'Sushi' },
    { label: '🍰 Belgian Waffles', cat: 'desserts', query: 'Dessert' }
  ];

  // Auto-play spotlight dishes
  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setActiveDishIndex(prev => (prev + 1) % spotlightDishes.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isAutoPlaying, spotlightDishes.length]);

  const activeDish = spotlightDishes[activeDishIndex];

  const handleCopyCoupon = (code) => {
    navigator.clipboard?.writeText(code);
    applyCoupon(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 3000);
  };

  const handleQuickAddDish = (dish) => {
    addToCart({
      id: dish.id,
      name: dish.name,
      price: dish.price,
      image: dish.image,
      restaurantName: dish.restaurantName,
      isVeg: dish.isVeg,
      rating: dish.rating,
      category: dish.category
    }, 1);
    
    setAddedDishId(dish.id);
    setTimeout(() => setAddedDishId(null), 2000);
  };

  return (
    <section 
      className="hero-section-root"
      style={{
        position: 'relative',
        padding: '32px 0 20px 0',
        overflow: 'hidden'
      }}
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      {/* Radiant Background Ambient Glows */}
      <div style={{
        position: 'absolute',
        top: '-15%',
        right: '5%',
        width: '520px',
        height: '520px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255, 94, 30, 0.22) 0%, rgba(255, 161, 51, 0.08) 50%, transparent 70%)',
        filter: 'blur(70px)',
        zIndex: 0,
        pointerEvents: 'none'
      }} />

      <div style={{
        position: 'absolute',
        bottom: '-10%',
        left: '2%',
        width: '420px',
        height: '420px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, rgba(99, 102, 241, 0.06) 60%, transparent 75%)',
        filter: 'blur(80px)',
        zIndex: 0,
        pointerEvents: 'none'
      }} />

      <div className="app-container" style={{ position: 'relative', zIndex: 1 }}>
        <div className="hero-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.15fr) minmax(0, 0.85fr)',
          gap: '36px',
          alignItems: 'center'
        }}>
          
          {/* LEFT COLUMN: HERO HEADLINE, COUPONS & SEARCH PILLS */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            
            {/* Top Promo Announcement Pill */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              background: 'linear-gradient(135deg, rgba(255, 94, 30, 0.15) 0%, rgba(255, 161, 51, 0.15) 100%)',
              border: '1px solid rgba(255, 94, 30, 0.3)',
              borderRadius: 'var(--radius-full)',
              marginBottom: '18px',
              boxShadow: '0 2px 10px rgba(255, 94, 30, 0.15)'
            }}>
              <Sparkles size={16} color="var(--primary)" />
              <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '0.02em' }}>
                GOURMET FOOD FESTIVAL • UP TO 50% OFF
              </span>
            </div>

            {/* Dynamic Main Impact Headline */}
            <h1 style={{
              fontSize: 'clamp(2.3rem, 4.8vw, 3.6rem)',
              lineHeight: 1.12,
              fontWeight: 900,
              marginBottom: '16px',
              letterSpacing: '-0.035em'
            }}>
              Craving Iconic Flavours? <br />
              <span className="gradient-text">Delivered In 25 Mins.</span>
            </h1>

            {/* Sub-headline */}
            <p style={{
              fontSize: '1.05rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
              marginBottom: '22px',
              maxWidth: '540px'
            }}>
              Order authentic dum biryanis, wood-fired pizzas, gourmet smashed burgers, and fresh sushi crafted by certified master chefs in top cloud kitchens.
            </p>

            {/* Dual Interactive Offer Strip */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '10px',
              width: '100%',
              maxWidth: '540px',
              marginBottom: '22px'
            }}>
              {/* Coupon 1 */}
              <div className="glass-panel" style={{
                flex: '1 1 240px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid rgba(255, 94, 30, 0.25)',
                background: 'rgba(255, 94, 30, 0.06)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Percent size={18} color="var(--primary)" />
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.85rem' }}>FLAT 50% OFF</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Code: <strong>FEAST50</strong></div>
                  </div>
                </div>
                <button
                  onClick={() => handleCopyCoupon('FEAST50')}
                  className="btn btn-primary btn-sm"
                  style={{
                    padding: '5px 10px',
                    fontSize: '0.75rem',
                    borderRadius: 'var(--radius-full)'
                  }}
                  title="Apply coupon code FEAST50"
                >
                  {copiedCode === 'FEAST50' ? (
                    <><Check size={14} /> Applied</>
                  ) : (
                    <><Copy size={13} /> Apply</>
                  )}
                </button>
              </div>

              {/* Coupon 2 */}
              <div className="glass-panel" style={{
                flex: '1 1 240px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                background: 'rgba(16, 185, 129, 0.06)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Tag size={18} color="var(--veg-color)" />
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.85rem' }}>FLAT ₹100 OFF</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Code: <strong>CRAVE100</strong></div>
                  </div>
                </div>
                <button
                  onClick={() => handleCopyCoupon('CRAVE100')}
                  className="btn btn-secondary btn-sm"
                  style={{
                    padding: '5px 10px',
                    fontSize: '0.75rem',
                    borderRadius: 'var(--radius-full)',
                    borderColor: 'rgba(16, 185, 129, 0.4)',
                    color: 'var(--veg-color)'
                  }}
                  title="Apply coupon code CRAVE100"
                >
                  {copiedCode === 'CRAVE100' ? (
                    <><Check size={14} /> Applied</>
                  ) : (
                    <><Copy size={13} /> Apply</>
                  )}
                </button>
              </div>
            </div>

            {/* Quick Filter & Search Tags */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center', marginBottom: '24px' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 700 }}>Popular Searches:</span>
              {popularTags.map((tagItem, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    if (onTagClick) onTagClick(tagItem.query);
                    if (onSelectCategory) onSelectCategory(tagItem.cat);
                  }}
                  className="btn btn-secondary btn-sm"
                  style={{
                    fontSize: '0.8rem',
                    padding: '5px 11px',
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--bg-card)'
                  }}
                >
                  {tagItem.label}
                </button>
              ))}
            </div>

            {/* Delivery Guarantees Badges */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '18px',
              paddingTop: '16px',
              borderTop: '1px solid var(--border-subtle)',
              width: '100%',
              maxWidth: '540px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '10px',
                  background: 'rgba(255, 94, 30, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Zap size={18} color="var(--primary)" />
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.85rem' }}>25 Mins</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Express Rider</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '10px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <ShieldCheck size={18} color="var(--veg-color)" />
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.85rem' }}>Hygiene 5★</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Clean Kitchens</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '10px',
                  background: 'rgba(59, 130, 246, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Clock size={18} color="#3B82F6" />
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.85rem' }}>Live GPS</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Map Tracking</div>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: INTERACTIVE SPOTLIGHT DISH SHOWCASE */}
          <div style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%'
          }}>
            
            {/* Main Interactive Dish Card */}
            <div className="glass-panel" style={{
              position: 'relative',
              width: '100%',
              maxWidth: '460px',
              borderRadius: 'var(--radius-xl)',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-card)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              background: 'var(--bg-card)'
            }}>
              
              {/* Dish Visual Header */}
              <div style={{
                position: 'relative',
                width: '100%',
                height: '270px',
                overflow: 'hidden'
              }}>
                <img
                  src={activeDish.image}
                  alt={activeDish.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'transform 0.4s ease'
                  }}
                />
                
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(11, 15, 23, 0.95) 0%, rgba(11, 15, 23, 0.3) 50%, transparent 100%)'
                }} />

                {/* Top Badge: Highlight Tag */}
                <div style={{
                  position: 'absolute',
                  top: '16px',
                  left: '16px',
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-full)',
                  background: 'rgba(15, 23, 42, 0.85)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  {activeDish.tag}
                </div>

                {/* Top Right: Discount Pill */}
                <div style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-full)',
                  background: 'var(--primary-gradient)',
                  fontSize: '0.78rem',
                  fontWeight: 900,
                  color: '#fff',
                  boxShadow: '0 2px 10px var(--primary-glow)'
                }}>
                  {activeDish.discount}
                </div>

                {/* Floating Driver ETA Badge */}
                <div className="glass-panel" style={{
                  position: 'absolute',
                  bottom: '16px',
                  left: '16px',
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(15, 23, 42, 0.85)',
                  backdropFilter: 'blur(12px)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: '#fff'
                }}>
                  <Zap size={14} color="var(--primary)" />
                  <span>ETA: {activeDish.prepTime}</span>
                </div>

                {/* Floating Rating Badge */}
                <div className="glass-panel" style={{
                  position: 'absolute',
                  bottom: '16px',
                  right: '16px',
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  background: 'rgba(15, 23, 42, 0.85)',
                  backdropFilter: 'blur(12px)',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  color: '#F59E0B'
                }}>
                  <Star size={14} fill="#F59E0B" color="#F59E0B" />
                  <span>{activeDish.rating} ({activeDish.reviewsCount})</span>
                </div>
              </div>

              {/* Dish Content Body */}
              <div style={{ padding: '18px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span className={`badge ${activeDish.isVeg ? 'badge-veg' : 'badge-nonveg'}`} style={{ fontSize: '0.68rem' }}>
                    {activeDish.isVeg ? '● 100% PURE VEG' : '▲ NON-VEG'}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>• {activeDish.restaurantName}</span>
                </div>

                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  marginBottom: '6px',
                  color: 'var(--text-main)'
                }}>
                  {activeDish.name}
                </h3>

                <p style={{
                  fontSize: '0.82rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.4,
                  marginBottom: '16px',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {activeDish.subtitle}
                </p>

                {/* Price & Action Button */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '12px',
                  borderTop: '1px solid var(--border-subtle)'
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                      <span style={{ fontSize: '1.45rem', fontWeight: 900, color: 'var(--primary)' }}>
                        ₹{activeDish.price}
                      </span>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                        ₹{activeDish.originalPrice}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--veg-color)', fontWeight: 700 }}>
                      Inclusive of all taxes
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      onClick={() => handleQuickAddDish(activeDish)}
                      className="btn btn-primary"
                      style={{
                        padding: '9px 18px',
                        fontSize: '0.88rem',
                        fontWeight: 800,
                        borderRadius: 'var(--radius-md)',
                        boxShadow: '0 4px 14px var(--primary-glow)'
                      }}
                    >
                      {addedDishId === activeDish.id ? (
                        <><Check size={16} /> Added!</>
                      ) : (
                        <><ShoppingBag size={16} /> + Add to Plate</>
                      )}
                    </button>
                  </div>
                </div>
              </div>

            </div>

            {/* Thumbnail Navigation Switcher */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              marginTop: '16px',
              width: '100%',
              maxWidth: '460px',
              overflowX: 'auto',
              padding: '4px 0'
            }}>
              {spotlightDishes.map((dish, idx) => (
                <button
                  key={dish.id}
                  onClick={() => {
                    setActiveDishIndex(idx);
                    setIsAutoPlaying(false);
                  }}
                  style={{
                    width: '64px',
                    height: '52px',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    border: idx === activeDishIndex ? '2px solid var(--primary)' : '2px solid transparent',
                    boxShadow: idx === activeDishIndex ? '0 0 12px var(--primary-glow)' : 'none',
                    padding: 0,
                    background: 'transparent',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    transform: idx === activeDishIndex ? 'scale(1.08)' : 'scale(0.95)',
                    opacity: idx === activeDishIndex ? 1 : 0.65,
                    flexShrink: 0
                  }}
                  title={dish.name}
                >
                  <img
                    src={dish.image}
                    alt={dish.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </button>
              ))}
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};
