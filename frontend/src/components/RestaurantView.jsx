import React from 'react';
import { ArrowLeft, Star, Clock, Bike, MapPin, Sparkles, CheckCircle2 } from 'lucide-react';
import { FoodCard } from './FoodCard';

export const RestaurantView = ({ restaurant, foods, onBack, onSelectFood }) => {
  if (!restaurant) return null;

  const restaurantFoods = foods.filter(f => f.restaurantId === restaurant.id || f.restaurantName === restaurant.name);

  return (
    <div className="animate-fade" style={{ paddingBottom: '60px' }}>
      {/* Back Button */}
      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={onBack}
          className="btn btn-secondary btn-sm"
          style={{ gap: '6px' }}
        >
          <ArrowLeft size={16} />
          <span>Back to All Restaurants</span>
        </button>
      </div>

      {/* Restaurant Header Banner */}
      <div className="glass-panel" style={{
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden',
        border: '1px solid var(--border-subtle)',
        marginBottom: '32px'
      }}>
        <div style={{ position: 'relative', height: '240px', width: '100%' }}>
          <img
            src={restaurant.image}
            alt={restaurant.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(11, 15, 23, 0.95) 0%, rgba(11, 15, 23, 0.4) 60%, transparent 100%)'
          }} />

          {/* Banner Details */}
          <div style={{
            position: 'absolute',
            bottom: '24px',
            left: '24px',
            right: '24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '6px'
              }}>
                <span className="badge badge-primary">Verified Partner</span>
                <span style={{ fontSize: '0.85rem', color: '#10B981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircle2 size={14} /> Open Now
                </span>
              </div>

              <h1 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#fff', lineHeight: 1.15, marginBottom: '6px' }}>
                {restaurant.name}
              </h1>

              <div style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.8)', marginBottom: '8px' }}>
                {restaurant.cuisine}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <MapPin size={14} color="var(--primary)" /> {restaurant.address}
                </span>
              </div>
            </div>

            {/* Quick Stats Pill */}
            <div style={{
              display: 'flex',
              gap: '12px',
              background: 'rgba(0, 0, 0, 0.65)',
              backdropFilter: 'blur(10px)',
              padding: '12px 20px',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid rgba(255,255,255,0.1)'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', color: '#F59E0B', fontWeight: 800, fontSize: '1.1rem' }}>
                  <Star size={16} fill="#F59E0B" /> {restaurant.rating}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.6)' }}>{restaurant.ratingCount}+ ratings</div>
              </div>

              <div style={{ width: '1px', background: 'rgba(255,255,255,0.15)' }} />

              <div style={{ textAlign: 'center' }}>
                <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#fff' }}>
                  {restaurant.deliveryTime}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.6)' }}>Delivery Time</div>
              </div>

              <div style={{ width: '1px', background: 'rgba(255,255,255,0.15)' }} />

              <div style={{ textAlign: 'center' }}>
                <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#10B981' }}>
                  ₹{restaurant.deliveryFee}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.6)' }}>Delivery Fee</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Restaurant Menu Items */}
      <div>
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>
            Curated Menu Selection ({restaurantFoods.length} items)
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Freshly prepared upon order with prime ingredients.
          </p>
        </div>

        {restaurantFoods.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '24px'
          }}>
            {restaurantFoods.map(food => (
              <FoodCard key={food.id || food._id} food={food} onSelectFood={onSelectFood} />
            ))}
          </div>
        ) : (
          <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', borderRadius: 'var(--radius-lg)' }}>
            <p style={{ color: 'var(--text-secondary)' }}>No items found for this restaurant.</p>
          </div>
        )}
      </div>
    </div>
  );
};
