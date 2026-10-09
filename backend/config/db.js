import mongoose from 'mongoose';
import { foodsData, restaurantsData, categoriesData, couponsData } from '../data/seedData.js';
import bcrypt from 'bcryptjs';

// In-Memory Data Store (Active when standalone or alongside Mongoose)
export const inMemoryStore = {
  users: [
    {
      _id: 'user-admin-1',
      name: 'System Administrator',
      email: 'admin@cravecourier.com',
      passwordHash: bcrypt.hashSync('admin123', 10),
      role: 'admin',
      phone: '+919876543210',
      address: '742 Brigade Road, Bengaluru, Karnataka',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      createdAt: new Date().toISOString()
    },
    {
      _id: 'user-admin-alias',
      name: 'System Administrator',
      email: 'admin@crave.com',
      passwordHash: bcrypt.hashSync('admin123', 10),
      role: 'admin',
      phone: '+919876543210',
      address: '742 Brigade Road, Bengaluru, Karnataka',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      createdAt: new Date().toISOString()
    },
    {
      _id: 'user-chef-1',
      name: 'Chef Sanjeev (Partner Kitchen)',
      email: 'restaurant@cravecourier.com',
      passwordHash: bcrypt.hashSync('chef123', 10),
      role: 'restaurant',
      restaurantId: 'rest-1',
      phone: '+919822011223',
      address: '142 Little Italy Way, Indiranagar, Bengaluru',
      avatar: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=200&q=80',
      createdAt: new Date().toISOString()
    },
    {
      _id: 'user-chef-alias',
      name: 'Chef Sanjeev (Partner Kitchen)',
      email: 'chef@crave.com',
      passwordHash: bcrypt.hashSync('chef123', 10),
      role: 'restaurant',
      restaurantId: 'rest-1',
      phone: '+919822011223',
      address: '142 Little Italy Way, Indiranagar, Bengaluru',
      avatar: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=200&q=80',
      createdAt: new Date().toISOString()
    },
    {
      _id: 'user-demo-1',
      name: 'Aarav Sharma (Foodie Customer)',
      email: 'customer@cravecourier.com',
      passwordHash: bcrypt.hashSync('user123', 10),
      role: 'customer',
      phone: '+919123456789',
      address: 'Flat 402, Palm Heights, Indiranagar, Bengaluru',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      createdAt: new Date().toISOString()
    },
    {
      _id: 'user-demo-alias',
      name: 'Aarav Sharma (Foodie Customer)',
      email: 'user@crave.com',
      passwordHash: bcrypt.hashSync('user123', 10),
      role: 'customer',
      phone: '+919123456789',
      address: 'Flat 402, Palm Heights, Indiranagar, Bengaluru',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      createdAt: new Date().toISOString()
    }
  ],
  foods: [...foodsData],
  restaurants: [...restaurantsData],
  categories: [...categoriesData],
  coupons: [...couponsData],
  otps: {},
  orders: [
    {
      _id: 'ORD-98214',
      orderId: 'ORD-98214',
      user: {
        _id: 'user-demo-1',
        name: 'Aarav Sharma',
        email: 'user@crave.com',
        phone: '+91 91234 56789'
      },
      items: [
        {
          id: 'food-1',
          name: 'Truffle Burrata & Wild Mushroom Pizza',
          price: 349,
          quantity: 2,
          image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
          selectedOptions: { crust: 'Sourdough Thin', cheese: 'Extra Burrata' }
        },
        {
          id: 'food-9',
          name: 'Molten Belgian Dark Chocolate Lava Cake',
          price: 149,
          quantity: 1,
          image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80'
        }
      ],
      restaurant: {
        id: 'rest-1',
        name: 'Bella Napoli Artisan Pizzeria',
        address: '142 Little Italy Way, Indiranagar, Bengaluru'
      },
      deliveryAddress: {
        street: 'Flat 402, Palm Heights, 12th Main',
        city: 'Indiranagar, Bengaluru',
        instructions: 'Leave at security or ring bell',
        lat: 12.9716,
        lng: 77.5946
      },
      paymentMethod: 'UPI / Google Pay',
      paymentStatus: 'Paid',
      orderStatus: 'Out for Delivery',
      subtotal: 847,
      tax: 42.35,
      deliveryFee: 49,
      discount: 100,
      total: 838.35,
      driverInfo: {
        name: 'Vikram Singh',
        phone: '+91 98450 99887',
        rating: 4.92,
        vehicle: 'Ather 450X EV (Plate: KA-03-EK-9821)',
        photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
        currentLocation: { lat: 12.9720, lng: 77.5950 }
      },
      timeline: [
        { status: 'Confirmed', time: '12:15 PM', completed: true },
        { status: 'Preparing in Kitchen', time: '12:22 PM', completed: true },
        { status: 'Picked Up by Driver', time: '12:35 PM', completed: true },
        { status: 'Out for Delivery', time: '12:40 PM', completed: true },
        { status: 'Delivered', time: 'Est. 12:55 PM', completed: false }
      ],
      estimatedDeliveryTime: '15-20 mins',
      createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString()
    }
  ]
};

let isMongoConnected = false;

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/food_delivery_db';
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2000
    });
    isMongoConnected = true;
    console.log(` MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.log(`ℹ️ MongoDB local/remote not reachable (${error.message}).`);
    console.log(`🚀 Seamless In-Memory Storage Engine initialized with Indian Rupees (₹) seed data!`);
    isMongoConnected = false;
  }
};

export const getStore = () => inMemoryStore;
export const getMongoStatus = () => isMongoConnected;
