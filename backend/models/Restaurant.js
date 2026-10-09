import mongoose from 'mongoose';

const restaurantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  cuisine: { type: String, required: true },
  rating: { type: Number, default: 4.8 },
  ratingCount: { type: Number, default: 0 },
  deliveryTime: { type: String, default: '20-30 min' },
  deliveryFee: { type: Number, default: 1.99 },
  minOrder: { type: Number, default: 10.00 },
  image: { type: String, required: true },
  address: { type: String, required: true },
  isOpen: { type: Boolean, default: true },
  tags: [{ type: String }],
  featured: { type: Boolean, default: false }
}, {
  timestamps: true
});

const Restaurant = mongoose.models.Restaurant || mongoose.model('Restaurant', restaurantSchema);
export default Restaurant;
