import mongoose from 'mongoose';

const foodSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  restaurantId: { type: String, required: true },
  restaurantName: { type: String, required: true },
  price: { type: Number, required: true },
  originalPrice: { type: Number },
  discount: { type: Number, default: 0 },
  rating: { type: Number, default: 4.8 },
  ratingCount: { type: Number, default: 0 },
  image: { type: String, required: true },
  description: { type: String, required: true },
  isVeg: { type: Boolean, default: false },
  isVegan: { type: Boolean, default: false },
  isGlutenFree: { type: Boolean, default: false },
  isPopular: { type: Boolean, default: false },
  prepTime: { type: String, default: '15-20 min' },
  calories: { type: String, default: '500 kcal' },
  spicyLevel: { type: Number, default: 0 },
  tags: [{ type: String }],
  available: { type: Boolean, default: true }
}, {
  timestamps: true
});

const Food = mongoose.models.Food || mongoose.model('Food', foodSchema);
export default Food;
