import React from 'react';
import { Star, Clock, Bike, MapPin, Sparkles } from 'lucide-react';

export const RestaurantCard = ({ restaurant, onSelectRestaurant }) => {
  return (
    <div
      onClick={() => onSelectRestaurant(restaurant)}
      className="glass-panel interactive-card stagger-card"
      style={{
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        cursor: 'pointer',
        border: '1px solid var(--border-card)',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Restaurant Image */}
      <div style={{ position: 'relative', height: '190px', width: '100%', overflow: 'hidden' }}>
        <img
          src={restaurant.image}
          alt={restaurant.name}
          loading="lazy"
          className="card-img-zoom"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, rgba(11, 15, 23, 0.75) 0%, transparent 50%)'
        }} />

        {/* Featured Badge */}
        {restaurant.featured && (
          <div style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            background: 'var(--primary-gradient)',
            color: '#fff',
            padding: '4px 10px',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.72rem',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            boxShadow: '0 2px 10px var(--primary-glow)'
          }}>
            <Sparkles size={12} /> TOP FEATURED
          </div>
        )}

        {/* Rating Badge */}
        <div style={{
          position: 'absolute',
          bottom: '12px',
          left: '12px',
          background: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(4px)',
          padding: '4px 8px',
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.8rem',
          fontWeight: 800,
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          <Star size={13} fill="#F59E0B" color="#F59E0B" />
          <span>{restaurant.rating}</span>
          <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.7rem' }}>({restaurant.ratingCount})</span>
        </div>

        {/* Delivery Time */}
        <div style={{
          position: 'absolute',
          bottom: '12px',
          right: '12px',
          background: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(4px)',
          padding: '4px 8px',
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.75rem',
          fontWeight: 700,
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          <Clock size={13} />
          <span>{restaurant.deliveryTime}</span>
        </div>
      </div>

      {/* Details */}
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, lineHeight: 1.25 }}>
          {restaurant.name}
        </h3>

        <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
          {restaurant.cuisine}
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          fontSize: '0.78rem',
          color: 'var(--text-muted)'
        }}>
          <MapPin size={13} color="var(--primary)" />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {restaurant.address}
          </span>
        </div>

        {/* Tags */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
          {restaurant.tags?.slice(0, 3).map((tag, idx) => (
            <span
              key={idx}
              style={{
                fontSize: '0.72rem',
                fontWeight: 600,
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-secondary)'
              }}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Delivery Fee Info */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: 'auto',
          paddingTop: '10px',
          borderTop: '1px solid var(--border-subtle)',
          fontSize: '0.82rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)' }}>
            <Bike size={15} color="var(--veg-color)" />
            <span>Delivery: <strong>₹{restaurant.deliveryFee}</strong></span>
          </div>

          <span style={{ color: 'var(--primary)', fontWeight: 700 }}>
            Min ₹{restaurant.minOrder}
          </span>
        </div>
      </div>
    </div>
  );
};
