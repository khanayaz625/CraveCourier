import React from 'react';
import { Star, Clock, Plus, Minus, Flame } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const FoodCard = ({ food, onSelectFood }) => {
  const { cartItems, addToCart, updateQuantity } = useCart();

  const targetId = food?.id || food?._id;
  const cartItem = cartItems.find(item => {
    const itemId = item?.id || item?._id;
    return Boolean(targetId && itemId && String(itemId) === String(targetId));
  });
  const quantityInCart = cartItem ? cartItem.quantity : 0;

  const handleAddClick = (e) => {
    e.stopPropagation();
    addToCart(food, 1);
  };

  const handleIncrement = (e) => {
    e.stopPropagation();
    if (cartItem) {
      updateQuantity(cartItem.cartKey, cartItem.quantity + 1);
    } else {
      addToCart(food, 1);
    }
  };

  const handleDecrement = (e) => {
    e.stopPropagation();
    if (cartItem) {
      updateQuantity(cartItem.cartKey, cartItem.quantity - 1);
    }
  };

  return (
    <div
      onClick={() => onSelectFood(food)}
      className="glass-panel interactive-card stagger-card"
      style={{
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        border: '1px solid var(--border-card)'
      }}
    >
      {/* Image & Badges Container */}
      <div style={{ position: 'relative', width: '100%', height: '200px', overflow: 'hidden' }}>
        <img
          src={food.image}
          alt={food.name}
          loading="lazy"
          className="card-img-zoom"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        />
        
        {/* Subtle Gradient Overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, rgba(11, 15, 23, 0.7) 0%, transparent 40%)'
        }} />

        {/* Veg / Non-Veg Indicator */}
        <div style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <div style={{
            width: '20px',
            height: '20px',
            background: '#FFFFFF',
            border: `2px solid ${food.isVeg ? '#10B981' : '#EF4444'}`,
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 6px rgba(0,0,0,0.3)'
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: food.isVeg ? '#10B981' : '#EF4444'
            }} />
          </div>

          {food.discount > 0 && (
            <span className="badge badge-discount" style={{ fontWeight: 800 }}>
              {food.discount}% OFF
            </span>
          )}
        </div>

        {/* Rating Badge */}
        <div style={{
          position: 'absolute',
          bottom: '12px',
          left: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(6px)',
          padding: '4px 8px',
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.78rem',
          fontWeight: 700,
          color: '#FFFFFF'
        }}>
          <Star size={13} color="#F59E0B" fill="#F59E0B" />
          <span>{food.rating}</span>
          <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.7rem' }}>({food.ratingCount})</span>
        </div>

        {/* Prep Time */}
        <div style={{
          position: 'absolute',
          bottom: '12px',
          right: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(6px)',
          padding: '4px 8px',
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.75rem',
          fontWeight: 600,
          color: '#FFFFFF'
        }}>
          <Clock size={12} />
          <span>{food.prepTime}</span>
        </div>
      </div>

      {/* Content Area */}
      <div style={{
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        justifyContent: 'space-between'
      }}>
        <div>
          {/* Restaurant name */}
          <div style={{
            fontSize: '0.75rem',
            fontWeight: 600,
            color: 'var(--primary)',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            marginBottom: '4px'
          }}>
            {food.restaurantName}
          </div>

          {/* Dish Name */}
          <h3 style={{
            fontSize: '1.05rem',
            fontWeight: 700,
            lineHeight: 1.3,
            marginBottom: '6px',
            color: 'var(--text-main)'
          }}>
            {food.name}
          </h3>

          {/* Description */}
          <p style={{
            fontSize: '0.82rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.45,
            marginBottom: '12px',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}>
            {food.description}
          </p>
        </div>

        {/* Price & Add to Cart footer */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '12px',
          borderTop: '1px solid var(--border-subtle)',
          marginTop: 'auto'
        }}>
          {/* Price */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <span style={{
              fontSize: '1.25rem',
              fontWeight: 800,
              color: 'var(--text-main)',
              fontFamily: 'var(--font-heading)'
            }}>
              ₹{food.price}
            </span>
            {food.originalPrice && (
              <span style={{
                fontSize: '0.85rem',
                color: 'var(--text-muted)',
                textDecoration: 'line-through'
              }}>
                ₹{food.originalPrice}
              </span>
            )}
          </div>

          {/* Quantity Stepper or Add Button */}
          {quantityInCart > 0 ? (
            <div 
              onClick={(e) => e.stopPropagation()}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'var(--primary-gradient)',
                borderRadius: 'var(--radius-md)',
                padding: '4px 8px',
                boxShadow: '0 2px 10px var(--primary-glow)'
              }}
            >
              <button
                onClick={handleDecrement}
                style={{
                  background: 'rgba(0,0,0,0.2)',
                  border: 'none',
                  borderRadius: '4px',
                  color: '#fff',
                  width: '24px',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <Minus size={14} />
              </button>

              <span style={{ fontWeight: 800, color: '#fff', fontSize: '0.9rem', minWidth: '16px', textAlign: 'center' }}>
                {quantityInCart}
              </span>

              <button
                onClick={handleIncrement}
                style={{
                  background: 'rgba(0,0,0,0.2)',
                  border: 'none',
                  borderRadius: '4px',
                  color: '#fff',
                  width: '24px',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <Plus size={14} />
              </button>
            </div>
          ) : (
            <button
              onClick={handleAddClick}
              className="btn btn-primary btn-sm"
              style={{ padding: '7px 14px' }}
            >
              <Plus size={15} />
              <span>Add</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
