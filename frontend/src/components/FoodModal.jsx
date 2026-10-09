import React, { useState } from 'react';
import { X, Star, Clock, Flame, ShieldAlert, Check, Plus, Minus, Heart } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const FoodModal = ({ food, onClose }) => {
  const { addToCart, setIsCartOpen } = useCart();

  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('regular');
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [spiceLevel, setSpiceLevel] = useState(food?.spicyLevel || 1);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);

  if (!food) return null;

  const sizeOptions = [
    { id: 'regular', name: 'Standard Regular Portion', extraPrice: 0 },
    { id: 'large', name: 'Medium / Large (+30% portion)', extraPrice: 60 },
    { id: 'combo', name: 'Gourmet Feast Combo (With Drink & Side)', extraPrice: 120 }
  ];

  const addonOptions = [
    { id: 'extra_cheese', name: 'Double Artisan Melted Cheese', price: 40 },
    { id: 'truffle_dip', name: 'House Black Truffle Garlic Aioli Dip', price: 35 },
    { id: 'avocado_crunch', name: 'Paneer / Tofu Crisps & Fried Onions', price: 45 },
    { id: 'spicy_jalapeno', name: 'Pickled Fire Jalapeño Peppers & Herbs', price: 25 }
  ];

  const toggleAddon = (addonId) => {
    setSelectedAddons(prev =>
      prev.includes(addonId) ? prev.filter(id => id !== addonId) : [...prev, addonId]
    );
  };

  // Calculate final unit price
  const basePrice = food.price;
  const sizeExtra = sizeOptions.find(s => s.id === selectedSize)?.extraPrice || 0;
  const addonsExtra = selectedAddons.reduce((sum, id) => {
    const addon = addonOptions.find(a => a.id === id);
    return sum + (addon ? addon.price : 0);
  }, 0);

  const unitPrice = basePrice + sizeExtra + addonsExtra;
  const finalTotalPrice = unitPrice * quantity;

  const handleAddOrder = () => {
    addToCart(
      {
        ...food,
        price: Number(unitPrice.toFixed(2))
      },
      quantity,
      {
        size: selectedSize,
        addons: selectedAddons,
        spiceLevel,
        specialInstructions
      }
    );
    onClose();
    setIsCartOpen(true);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="glass-panel animate-modal"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '680px',
          maxHeight: '90vh',
          borderRadius: 'var(--radius-xl)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-card)',
          border: '1px solid var(--border-subtle)',
          background: 'var(--bg-card)'
        }}
      >
        {/* Header Image with Floating Action Buttons */}
        <div style={{ position: 'relative', height: '240px', width: '100%' }}>
          <img
            src={food.image}
            alt={food.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(11, 15, 23, 0.9) 0%, transparent 60%)'
          }} />

          {/* Close Button */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(8px)',
              border: 'none',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <X size={20} />
          </button>

          {/* Favorite Button */}
          <button
            onClick={() => setIsFavorite(!isFavorite)}
            style={{
              position: 'absolute',
              top: '16px',
              right: '60px',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(8px)',
              border: 'none',
              color: isFavorite ? '#EF4444' : '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <Heart size={18} fill={isFavorite ? '#EF4444' : 'none'} />
          </button>

          {/* Badges on Bottom Left of Image */}
          <div style={{
            position: 'absolute',
            bottom: '16px',
            left: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span className={food.isVeg ? 'badge badge-veg' : 'badge badge-nonveg'}>
              {food.isVeg ? '🌿 Pure Veg' : '🥩 Non-Veg'}
            </span>
            <span className="badge badge-rating">
              <Star size={12} fill="#F59E0B" /> {food.rating} ({food.ratingCount} reviews)
            </span>
            <span className="badge" style={{ background: 'rgba(255,255,255,0.1)', color: '#fff' }}>
              <Clock size={12} /> {food.prepTime}
            </span>
            {food.calories && (
              <span className="badge" style={{ background: 'rgba(255,255,255,0.1)', color: '#fff' }}>
                🔥 {food.calories}
              </span>
            )}
          </div>
        </div>

        {/* Scrollable Customization Body */}
        <div style={{
          padding: '24px',
          overflowY: 'auto',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          {/* Dish Title & Description */}
          <div>
            <div style={{
              fontSize: '0.85rem',
              color: 'var(--primary)',
              fontWeight: 700,
              textTransform: 'uppercase',
              marginBottom: '4px'
            }}>
              {food.restaurantName}
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '8px' }}>
              {food.name}
            </h2>
            <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              {food.description}
            </p>
          </div>

          {/* Portion Size Selection */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '10px' }}>
              Choose Portion Size <span style={{ color: 'var(--primary)', fontSize: '0.8rem' }}>(Required)</span>
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {sizeOptions.map(option => {
                const isSelected = selectedSize === option.id;
                return (
                  <label
                    key={option.id}
                    onClick={() => setSelectedSize(option.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 16px',
                      borderRadius: 'var(--radius-md)',
                      background: isSelected ? 'rgba(255, 94, 30, 0.1)' : 'var(--bg-elevated)',
                      border: isSelected ? '1.5px solid var(--primary)' : '1px solid var(--border-subtle)',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        border: `2px solid ${isSelected ? 'var(--primary)' : 'var(--text-muted)'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {isSelected && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)' }} />}
                      </div>
                      <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{option.name}</span>
                    </div>
                    <span style={{ fontWeight: 700, color: option.extraPrice > 0 ? 'var(--primary)' : 'var(--text-muted)' }}>
                      {option.extraPrice > 0 ? `+₹${option.extraPrice}` : 'Included'}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Add-ons Checklist */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '10px' }}>
              Gourmet Add-Ons <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>(Optional)</span>
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {addonOptions.map(addon => {
                const isChecked = selectedAddons.includes(addon.id);
                return (
                  <div
                    key={addon.id}
                    onClick={() => toggleAddon(addon.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 16px',
                      borderRadius: 'var(--radius-md)',
                      background: isChecked ? 'rgba(255, 94, 30, 0.08)' : 'var(--bg-elevated)',
                      border: isChecked ? '1.5px solid var(--primary)' : '1px solid var(--border-subtle)',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '4px',
                        border: `2px solid ${isChecked ? 'var(--primary)' : 'var(--text-muted)'}`,
                        background: isChecked ? 'var(--primary)' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff'
                      }}>
                        {isChecked && <Check size={12} />}
                      </div>
                      <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>{addon.name}</span>
                    </div>
                    <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '0.88rem' }}>
                      +₹{addon.price}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Spice Level */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '10px' }}>
              Spice Preference
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
              {[
                { lvl: 0, label: '🌱 Mild / None' },
                { lvl: 1, label: '🌶️ Medium Spice' },
                { lvl: 2, label: '🔥 Extra Hot' }
              ].map(item => (
                <button
                  key={item.lvl}
                  type="button"
                  onClick={() => setSpiceLevel(item.lvl)}
                  style={{
                    padding: '10px',
                    borderRadius: 'var(--radius-md)',
                    border: spiceLevel === item.lvl ? '1.5px solid var(--primary)' : '1px solid var(--border-subtle)',
                    background: spiceLevel === item.lvl ? 'rgba(255, 94, 30, 0.15)' : 'var(--bg-elevated)',
                    color: spiceLevel === item.lvl ? 'var(--primary)' : 'var(--text-main)',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Special Cooking Instructions */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '6px' }}>
              Special Kitchen Notes
            </h4>
            <input
              type="text"
              placeholder="e.g., Less salt, dressing on the side, extra crispy..."
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 14px',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-main)',
                fontSize: '0.88rem',
                outline: 'none'
              }}
            />
          </div>
        </div>

        {/* Modal Action Footer */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid var(--border-subtle)',
          background: 'var(--bg-elevated)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px'
        }}>
          {/* Quantity Stepper */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            background: 'var(--bg-input)',
            padding: '6px 12px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)'
          }}>
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-main)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <Minus size={18} />
            </button>
            <span style={{ fontWeight: 800, fontSize: '1.1rem', minWidth: '24px', textAlign: 'center' }}>
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-main)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <Plus size={18} />
            </button>
          </div>

          {/* Add to Order Button */}
          <button
            onClick={handleAddOrder}
            className="btn btn-primary btn-lg"
            style={{ flex: 1 }}
          >
            <span>Add to Order</span>
            <span>•</span>
            <span>₹{Math.round(finalTotalPrice)}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
