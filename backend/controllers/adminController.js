import { getStore } from '../config/db.js';
import bcrypt from 'bcryptjs';

// @desc   Get admin dashboard analytics & metrics
// @route  GET /api/admin/stats
export const getAdminStats = async (req, res) => {
  try {
    const store = getStore();

    const totalOrders = store.orders.length;
    const totalRevenue = store.orders.reduce((sum, order) => sum + (order.total || 0), 0);
    const activeOrders = store.orders.filter(o => o.orderStatus !== 'Delivered' && o.orderStatus !== 'Cancelled').length;
    const totalFoods = store.foods.length;
    const totalUsers = store.users.length;
    const totalRestaurants = store.restaurants.length;

    // Recent orders
    const recentOrders = store.orders.slice(0, 10);

    // Sales breakdown by category
    const categorySales = {};
    store.orders.forEach(order => {
      order.items?.forEach(item => {
        const food = store.foods.find(f => f.id === item.id);
        const cat = food?.category || 'general';
        categorySales[cat] = (categorySales[cat] || 0) + (item.price * item.quantity);
      });
    });

    res.json({
      metrics: {
        totalRevenue: Number(totalRevenue.toFixed(2)),
        totalOrders,
        activeOrders,
        totalFoods,
        totalUsers,
        totalRestaurants,
        avgOrderValue: totalOrders > 0 ? Number((totalRevenue / totalOrders).toFixed(2)) : 0
      },
      categorySales,
      recentOrders
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Get all users (Admin only)
// @route  GET /api/admin/users
export const getAllUsers = async (req, res) => {
  try {
    const store = getStore();
    const sanitizedUsers = store.users.map(({ passwordHash, ...u }) => u);
    res.json(sanitizedUsers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Update a user's role (Promote to Admin / Kitchen / Customer)
// @route  PUT /api/admin/users/:id/role
export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const store = getStore();

    if (!['admin', 'restaurant', 'customer'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role specified. Must be admin, restaurant, or customer.' });
    }

    const userIndex = store.users.findIndex(u => u._id === id || u.id === id);
    if (userIndex === -1) {
      return res.status(404).json({ message: 'User not found' });
    }

    store.users[userIndex].role = role;
    const { passwordHash, ...updatedUser } = store.users[userIndex];

    res.json({
      success: true,
      message: `User ${updatedUser.name} role updated to ${role}`,
      user: updatedUser
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Delete a user
// @route  DELETE /api/admin/users/:id
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const store = getStore();

    const userIndex = store.users.findIndex(u => u._id === id || u.id === id);
    if (userIndex === -1) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent deleting the primary admin
    if (store.users[userIndex].email === 'admin@cravecourier.com') {
      return res.status(400).json({ message: 'Primary System Admin account cannot be deleted' });
    }

    const deleted = store.users.splice(userIndex, 1)[0];
    res.json({ success: true, message: `User ${deleted.name} removed successfully` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Create new user from admin console
// @route  POST /api/admin/users
export const createAdminUser = async (req, res) => {
  try {
    const { name, email, password, role, phone, address } = req.body;
    const store = getStore();

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const exists = store.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (exists) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = {
      _id: `user-${Date.now()}`,
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: role || 'customer',
      phone: phone || '',
      address: address || 'Bengaluru, Karnataka',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
      createdAt: new Date().toISOString()
    };

    store.users.push(newUser);
    const { passwordHash: _, ...sanitized } = newUser;

    res.status(201).json({ success: true, message: 'User created successfully', user: sanitized });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Create a partner restaurant
// @route  POST /api/admin/restaurants
export const createRestaurant = async (req, res) => {
  try {
    const store = getStore();
    const newRest = {
      id: `rest-${Date.now()}`,
      _id: `rest-${Date.now()}`,
      rating: 4.8,
      reviewsCount: 120,
      isOpen: true,
      priceRange: '₹₹',
      ...req.body
    };

    store.restaurants.unshift(newRest);
    res.status(201).json(newRest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Update a partner restaurant
// @route  PUT /api/admin/restaurants/:id
export const updateRestaurant = async (req, res) => {
  try {
    const { id } = req.params;
    const store = getStore();

    const idx = store.restaurants.findIndex(r => r.id === id || r._id === id);
    if (idx === -1) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    store.restaurants[idx] = { ...store.restaurants[idx], ...req.body };
    res.json(store.restaurants[idx]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Delete a partner restaurant
// @route  DELETE /api/admin/restaurants/:id
export const deleteRestaurant = async (req, res) => {
  try {
    const { id } = req.params;
    const store = getStore();

    const idx = store.restaurants.findIndex(r => r.id === id || r._id === id);
    if (idx === -1) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    store.restaurants.splice(idx, 1);
    res.json({ success: true, message: 'Restaurant deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Delete / cancel order (Admin only)
// @route  DELETE /api/admin/orders/:id
export const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const store = getStore();

    const idx = store.orders.findIndex(o => o._id === id || o.orderId === id);
    if (idx === -1) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const removed = store.orders.splice(idx, 1)[0];
    res.json({ success: true, message: `Order ${removed.orderId || id} deleted successfully` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Get coupons
// @route  GET /api/admin/coupons
export const getCoupons = async (req, res) => {
  try {
    const store = getStore();
    res.json(store.coupons || []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Create coupon
// @route  POST /api/admin/coupons
export const createCoupon = async (req, res) => {
  try {
    const { code, discount, minOrder, description } = req.body;
    const store = getStore();

    if (!code || !discount) {
      return res.status(400).json({ message: 'Coupon code and discount amount are required' });
    }

    if (!store.coupons) store.coupons = [];
    const newCoupon = {
      code: code.toUpperCase(),
      discount: Number(discount),
      minOrder: Number(minOrder) || 0,
      description: description || `Get ₹${discount} off on your order`,
      createdAt: new Date().toISOString()
    };

    store.coupons.push(newCoupon);
    res.status(201).json(newCoupon);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Delete coupon
// @route  DELETE /api/admin/coupons/:code
export const deleteCoupon = async (req, res) => {
  try {
    const { code } = req.params;
    const store = getStore();

    if (!store.coupons) store.coupons = [];
    store.coupons = store.coupons.filter(c => c.code.toUpperCase() !== code.toUpperCase());
    res.json({ success: true, message: `Coupon ${code} deleted` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

