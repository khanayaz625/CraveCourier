import React from 'react';
import { Filter, ArrowUpDown, Check } from 'lucide-react';

export const FiltersBar = ({
  dietaryFilter,
  setDietaryFilter,
  sortBy,
  setSortBy,
  itemsCount = 0
}) => {
  const dietaryOptions = [
    { id: 'all', label: 'All Items' },
    { id: 'veg', label: '🌿 Pure Veg' },
    { id: 'nonveg', label: '🥩 Non-Veg' },
    { id: 'vegan', label: '🌱 Vegan' },
    { id: 'glutenFree', label: '🌾 Gluten-Free' }
  ];

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '16px',
      padding: '16px 0',
      borderBottom: '1px solid var(--border-subtle)',
      marginBottom: '24px'
    }}>
      {/* Dietary Buttons */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        flexWrap: 'wrap'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          color: 'var(--text-muted)',
          fontSize: '0.85rem',
          fontWeight: 600,
          marginRight: '6px'
        }}>
          <Filter size={16} />
          <span>Dietary:</span>
        </div>

        {dietaryOptions.map(option => {
          const isActive = dietaryFilter === option.id;
          return (
            <button
              key={option.id}
              onClick={() => setDietaryFilter(option.id)}
              style={{
                padding: '7px 14px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.84rem',
                fontWeight: 600,
                border: isActive ? '1px solid var(--primary)' : '1px solid var(--border-subtle)',
                background: isActive ? 'rgba(255, 94, 30, 0.15)' : 'var(--bg-elevated)',
                color: isActive ? 'var(--primary)' : 'var(--text-main)',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      {/* Right Side: Sorting & Total Count */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px'
      }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Showing <strong>{itemsCount}</strong> delicacies
        </span>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'var(--bg-elevated)',
          padding: '6px 14px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)'
        }}>
          <ArrowUpDown size={16} color="var(--primary)" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-main)',
              fontSize: '0.85rem',
              fontWeight: 600,
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="popular">🔥 Most Popular</option>
            <option value="rating">⭐ Highest Rated</option>
            <option value="price_asc">💵 Price: Low to High</option>
            <option value="price_desc">💎 Price: High to Low</option>
          </select>
        </div>
      </div>
    </div>
  );
};
