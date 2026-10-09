import React from 'react';
import { 
  Utensils, 
  Pizza, 
  Sandwich, 
  Soup, 
  Flame, 
  Sparkles, 
  Salad, 
  CakeSlice, 
  Coffee 
} from 'lucide-react';

const iconMap = {
  Utensils: <Utensils size={20} />,
  Pizza: <Pizza size={20} />,
  Sandwich: <Sandwich size={20} />,
  Soup: <Soup size={20} />,
  Flame: <Flame size={20} />,
  Sparkles: <Sparkles size={20} />,
  Salad: <Salad size={20} />,
  CakeSlice: <CakeSlice size={20} />,
  Coffee: <Coffee size={20} />
};

export const CategoryBar = ({ categories, selectedCategory, onSelectCategory }) => {
  return (
    <div 
      className="category-scroll-container"
      style={{
        margin: '20px 0 30px 0',
        paddingBottom: '10px'
      }}
    >
      <div style={{
        display: 'flex',
        gap: '12px',
        minWidth: 'max-content'
      }}>
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          const icon = iconMap[cat.icon] || <Utensils size={20} />;

          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px 20px',
                borderRadius: 'var(--radius-full)',
                border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border-subtle)',
                background: isSelected ? 'var(--primary-gradient)' : 'var(--bg-elevated)',
                color: isSelected ? '#FFFFFF' : 'var(--text-main)',
                boxShadow: isSelected ? '0 4px 15px var(--primary-glow)' : 'none',
                cursor: 'pointer',
                fontFamily: 'var(--font-heading)',
                fontWeight: 600,
                fontSize: '0.92rem',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                whiteSpace: 'nowrap'
              }}
            >
              <span style={{
                color: isSelected ? '#FFFFFF' : 'var(--primary)',
                display: 'flex',
                alignItems: 'center'
              }}>
                {icon}
              </span>
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
