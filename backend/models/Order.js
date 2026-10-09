import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  user: {
    _id: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String }
  },
  items: [
    {
      id: { type: String, required: true },
      name: { type: String, required: true },
      price: { type: Number, required: true },
      quantity: { type: Number, required: true },
      image: { type: String },
      selectedOptions: { type: Object }
    }
  ],
  restaurant: {
    id: { type: String },
    name: { type: String },
    address: { type: String }
  },
  deliveryAddress: {
    street: { type: String, required: true },
    city: { type: String, default: 'Metropolis' },
    instructions: { type: String },
    lat: { type: Number },
    lng: { type: Number }
  },
  paymentMethod: { type: String, default: 'Credit Card' },
  paymentStatus: { type: String, default: 'Paid' },
  orderStatus: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'],
    default: 'Confirmed'
  },
  subtotal: { type: Number, required: true },
  tax: { type: Number, default: 0 },
  deliveryFee: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  total: { type: Number, required: true },
  driverInfo: {
    name: { type: String, default: 'Alex Rivera' },
    phone: { type: String, default: '+1 (555) 321-9876' },
    rating: { type: Number, default: 4.9 },
    vehicle: { type: String, default: 'Yamaha E-Scooter (Plate: NY-7842)' },
    photo: { type: String, default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80' }
  },
  timeline: [
    {
      status: { type: String },
      time: { type: String },
      completed: { type: Boolean }
    }
  ],
  estimatedDeliveryTime: { type: String, default: '25-35 min' }
}, {
  timestamps: true
});

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);
export default Order;
