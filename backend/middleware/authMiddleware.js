import jwt from 'jsonwebtoken';
import { getStore } from '../config/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_food_delivery_jwt_key_998877';

export const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
};

export const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      
      const store = getStore();
      const user = store.users.find(u => u._id === decoded.id || u.email === decoded.email);
      
      if (!user) {
        return res.status(401).json({ message: 'User not found in session' });
      }
      
      req.user = {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        address: user.address
      };
      next();
    } catch (error) {
      console.error('Token verification failed:', error.message);
      return res.status(401).json({ message: 'Not authorized, invalid token' });
    }
  } else {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

export const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Admin access required' });
  }
};

export const restaurantOrAdmin = (req, res, next) => {
  if (req.user && (req.user.role === 'restaurant' || req.user.role === 'admin')) {
    next();
  } else {
    res.status(403).json({ message: 'Restaurant manager or Admin access required' });
  }
};
