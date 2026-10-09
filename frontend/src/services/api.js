const API_BASE_URL = 'http://localhost:5000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('crave_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

export const api = {
  // Foods
  getFoods: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE_URL}/foods?${query}`);
    if (!res.ok) throw new Error('Failed to fetch foods');
    return res.json();
  },

  getCategories: async () => {
    const res = await fetch(`${API_BASE_URL}/foods/categories`);
    if (!res.ok) throw new Error('Failed to fetch categories');
    return res.json();
  },

  getFoodById: async (id) => {
    const res = await fetch(`${API_BASE_URL}/foods/${id}`);
    if (!res.ok) throw new Error('Failed to fetch food details');
    return res.json();
  },

  createFood: async (foodData) => {
    const res = await fetch(`${API_BASE_URL}/foods`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(foodData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to create food item');
    return data;
  },

  updateFood: async (id, foodData) => {
    const res = await fetch(`${API_BASE_URL}/foods/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(foodData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update food item');
    return data;
  },

  deleteFood: async (id) => {
    const res = await fetch(`${API_BASE_URL}/foods/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to delete food item');
    return data;
  },

  // Restaurants
  getRestaurants: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE_URL}/restaurants?${query}`);
    if (!res.ok) throw new Error('Failed to fetch restaurants');
    return res.json();
  },

  getRestaurantById: async (id) => {
    const res = await fetch(`${API_BASE_URL}/restaurants/${id}`);
    if (!res.ok) throw new Error('Failed to fetch restaurant details');
    return res.json();
  },

  // Orders
  createOrder: async (orderData) => {
    const res = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(orderData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to place order');
    return data;
  },

  getMyOrders: async () => {
    const res = await fetch(`${API_BASE_URL}/orders/myorders`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch user orders');
    return res.json();
  },

  getOrderById: async (id) => {
    const res = await fetch(`${API_BASE_URL}/orders/${id}`);
    if (!res.ok) throw new Error('Failed to fetch order details');
    return res.json();
  },

  updateOrderStatus: async (id, status) => {
    const res = await fetch(`${API_BASE_URL}/orders/${id}/status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update order status');
    return data;
  },

  getAllOrders: async () => {
    const res = await fetch(`${API_BASE_URL}/orders`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch orders');
    return res.json();
  },

  // Coupons
  validateCoupon: async (code, orderAmount) => {
    const res = await fetch(`${API_BASE_URL}/coupons/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, orderAmount })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Invalid coupon');
    return data;
  },

  getCoupons: async () => {
    const res = await fetch(`${API_BASE_URL}/coupons`);
    if (!res.ok) throw new Error('Failed to fetch coupons');
    return res.json();
  },

  // Auth
  login: async (credentials) => {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Login failed');
    return data;
  },

  googleLogin: async (googleData) => {
    const res = await fetch(`${API_BASE_URL}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(googleData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Google authentication failed');
    return data;
  },

  sendOTP: async (phone) => {
    const fast2smsKey = localStorage.getItem('crave_fast2sms_key') || '';
    const twoFactorKey = localStorage.getItem('crave_2factor_key') || '';
    const twilioSid = localStorage.getItem('crave_twilio_sid') || '';
    const twilioToken = localStorage.getItem('crave_twilio_token') || '';
    const twilioFrom = localStorage.getItem('crave_twilio_from') || '';

    const res = await fetch(`${API_BASE_URL}/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        phone, 
        fast2smsKey: fast2smsKey || undefined,
        twoFactorKey: twoFactorKey || undefined,
        twilioSid: twilioSid || undefined,
        twilioToken: twilioToken || undefined,
        twilioFrom: twilioFrom || undefined
      })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to send verification code');
    return data;
  },

  verifyOTP: async (phone, otp, name, role) => {
    const res = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, otp, name, role })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Invalid or expired OTP');
    return data;
  },

  register: async (userData) => {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Registration failed');
    return data;
  },

  getMe: async () => {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch profile');
    return res.json();
  },

  updateProfile: async (profileData) => {
    const res = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(profileData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update profile');
    return data;
  },

  // Admin Management API
  getAdminStats: async () => {
    const res = await fetch(`${API_BASE_URL}/admin/stats`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch admin stats');
    return res.json();
  },

  getAdminUsers: async () => {
    const res = await fetch(`${API_BASE_URL}/admin/users`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch users');
    return res.json();
  },

  updateUserRole: async (userId, role) => {
    const res = await fetch(`${API_BASE_URL}/admin/users/${userId}/role`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ role })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update user role');
    return data;
  },

  deleteUser: async (userId) => {
    const res = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to delete user');
    return data;
  },

  createAdminUser: async (userData) => {
    const res = await fetch(`${API_BASE_URL}/admin/users`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(userData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to create user');
    return data;
  },

  createRestaurant: async (restaurantData) => {
    const res = await fetch(`${API_BASE_URL}/admin/restaurants`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(restaurantData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to create restaurant');
    return data;
  },

  updateRestaurant: async (id, restaurantData) => {
    const res = await fetch(`${API_BASE_URL}/admin/restaurants/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(restaurantData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update restaurant');
    return data;
  },

  deleteRestaurant: async (id) => {
    const res = await fetch(`${API_BASE_URL}/admin/restaurants/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to delete restaurant');
    return data;
  },

  deleteOrder: async (orderId) => {
    const res = await fetch(`${API_BASE_URL}/admin/orders/${orderId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to delete order');
    return data;
  },

  getCoupons: async () => {
    const res = await fetch(`${API_BASE_URL}/admin/coupons`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch coupons');
    return res.json();
  },

  createCoupon: async (couponData) => {
    const res = await fetch(`${API_BASE_URL}/admin/coupons`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(couponData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to create coupon');
    return data;
  },

  deleteCoupon: async (code) => {
    const res = await fetch(`${API_BASE_URL}/admin/coupons/${code}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to delete coupon');
    return data;
  }
};
