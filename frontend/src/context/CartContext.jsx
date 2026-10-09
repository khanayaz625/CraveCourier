import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('crave_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [appliedCoupon, setAppliedCoupon] = useState(() => {
    try {
      const saved = localStorage.getItem('crave_coupon');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [activeRestaurant, setActiveRestaurant] = useState(null);

  useEffect(() => {
    localStorage.setItem('crave_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    if (appliedCoupon) {
      localStorage.setItem('crave_coupon', JSON.stringify(appliedCoupon));
    } else {
      localStorage.removeItem('crave_coupon');
    }
  }, [appliedCoupon]);

  const getItemKey = (id, options = {}) => {
    return `${id}_${JSON.stringify(options)}`;
  };

  const addToCart = (foodItem, quantity = 1, selectedOptions = {}) => {
    const rawId = foodItem?.id || foodItem?._id || `food_${Date.now()}`;
    const key = getItemKey(rawId, selectedOptions);

    setCartItems(prev => {
      const existingIdx = prev.findIndex(item => item.cartKey === key);
      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx].quantity += quantity;
        return updated;
      } else {
        return [
          ...prev,
          {
            ...foodItem,
            id: rawId,
            _id: rawId,
            cartKey: key,
            quantity,
            selectedOptions
          }
        ];
      }
    });

    if (foodItem.restaurantId || foodItem.restaurantName) {
      setActiveRestaurant({
        id: foodItem.restaurantId || 'rest-1',
        name: foodItem.restaurantName || 'Bella Napoli Artisan Pizzeria'
      });
    }
  };

  const updateQuantity = (cartKey, newQty) => {
    if (newQty <= 0) {
      removeFromCart(cartKey);
      return;
    }
    setCartItems(prev =>
      prev.map(item => (item.cartKey === cartKey ? { ...item, quantity: newQty } : item))
    );
  };

  const removeFromCart = (cartKey) => {
    setCartItems(prev => prev.filter(item => item.cartKey !== cartKey));
  };

  const clearCart = () => {
    setCartItems([]);
    setAppliedCoupon(null);
  };

  const applyCoupon = async (code) => {
    try {
      const result = await api.validateCoupon(code, subtotal);
      if (result.valid) {
        setAppliedCoupon(result);
        return { success: true, message: `Coupon ${code} applied successfully!` };
      }
    } catch (error) {
      return { success: false, message: error.message || 'Invalid promo code' };
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  // Indian Calculations in Rupees (₹)
  const subtotal = Math.round(
    cartItems.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0)
  );

  // Free delivery above ₹299 or if coupon FREEDEL is applied
  let deliveryFee = subtotal > 0 ? (subtotal >= 299 ? 0 : 49) : 0;
  if (appliedCoupon?.isFreeDelivery) {
    deliveryFee = 0;
  }

  let discount = 0;
  if (appliedCoupon && !appliedCoupon.isFreeDelivery) {
    discount = appliedCoupon.discount || 0;
  }

  const tax = Number((subtotal * 0.05).toFixed(2)); // 5% GST on Restaurant Food
  const total = Number(Math.max(0, subtotal + tax + deliveryFee - discount).toFixed(2));
  const totalItemsCount = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      appliedCoupon,
      applyCoupon,
      removeCoupon,
      subtotal,
      deliveryFee,
      tax,
      discount,
      total,
      totalItemsCount,
      isCartOpen,
      setIsCartOpen,
      isCheckoutOpen,
      setIsCheckoutOpen,
      activeRestaurant
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
