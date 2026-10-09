import { getStore } from '../config/db.js';

// @desc   Create new order
// @route  POST /api/orders
export const createOrder = async (req, res) => {
  try {
    const store = getStore();
    const {
      items,
      restaurant,
      deliveryAddress,
      paymentMethod,
      couponCode
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'No order items provided' });
    }

    if (!deliveryAddress || !deliveryAddress.street) {
      return res.status(400).json({ message: 'Please provide a valid delivery address' });
    }

    // Calculate prices accurately
    let subtotal = 0;
    items.forEach(item => {
      subtotal += (item.price * item.quantity);
    });

    let discount = 0;
    if (couponCode) {
      const coupon = store.coupons.find(c => c.code.toUpperCase() === couponCode.toUpperCase());
      if (coupon && subtotal >= (coupon.minOrderAmount || 0)) {
        if (coupon.isFreeDelivery) {
          discount = 0; // Handled in delivery fee
        } else if (coupon.discountPercent) {
          discount = Math.min((subtotal * coupon.discountPercent) / 100, coupon.maxDiscount || Infinity);
        }
      }
    }

    const tax = Number((subtotal * 0.05).toFixed(2));
    const deliveryFee = (couponCode?.toUpperCase() === 'FREEDEL' || subtotal >= 299) ? 0 : 49;
    const total = Number((subtotal + tax + deliveryFee - discount).toFixed(2));

    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const orderId = `ORD-${randomSuffix}`;

    const newOrder = {
      _id: `ord_${Date.now()}`,
      orderId,
      user: {
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone || deliveryAddress.phone || '+1 (555) 019-2831'
      },
      items,
      restaurant: restaurant || {
        id: 'rest-1',
        name: 'Bella Napoli Artisan Pizzeria',
        address: '142 Little Italy Way, Downtown'
      },
      deliveryAddress: {
        street: deliveryAddress.street,
        city: deliveryAddress.city || 'Metropolis',
        instructions: deliveryAddress.instructions || '',
        lat: deliveryAddress.lat || 40.7128,
        lng: deliveryAddress.lng || -74.0060
      },
      paymentMethod: paymentMethod || 'Credit Card',
      paymentStatus: 'Paid',
      orderStatus: 'Confirmed',
      subtotal: Number(subtotal.toFixed(2)),
      tax,
      deliveryFee,
      discount: Number(discount.toFixed(2)),
      total,
      driverInfo: {
        name: 'Jordan Sparks',
        phone: '+1 (555) 492-1084',
        rating: 4.95,
        vehicle: 'Honda FastBike (Plate: CF-9201)',
        photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        currentLocation: { lat: 40.7130, lng: -74.0065 }
      },
      timeline: [
        { status: 'Confirmed', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), completed: true },
        { status: 'Preparing in Kitchen', time: 'In ~5 mins', completed: false },
        { status: 'Picked Up by Driver', time: 'In ~15 mins', completed: false },
        { status: 'Out for Delivery', time: 'In ~20 mins', completed: false },
        { status: 'Delivered', time: 'Est. 25-30 mins', completed: false }
      ],
      estimatedDeliveryTime: '25-35 min',
      createdAt: new Date().toISOString()
    };

    store.orders.unshift(newOrder);
    res.status(201).json(newOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Get logged in user orders
// @route  GET /api/orders/myorders
export const getMyOrders = async (req, res) => {
  try {
    const store = getStore();
    const orders = store.orders.filter(o => o.user._id === req.user._id || o.user.email === req.user.email);
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Get single order by orderId
// @route  GET /api/orders/:id
export const getOrderById = async (req, res) => {
  try {
    const store = getStore();
    const order = store.orders.find(o => o.orderId === req.params.id || o._id === req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Update order status (Admin / Restaurant / Simulator)
// @route  PUT /api/orders/:id/status
export const updateOrderStatus = async (req, res) => {
  try {
    const store = getStore();
    const { status } = req.body;
    const orderIndex = store.orders.findIndex(o => o.orderId === req.params.id || o._id === req.params.id);

    if (orderIndex === -1) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const order = store.orders[orderIndex];
    order.orderStatus = status;

    // Update timeline steps dynamically
    const statusOrder = ['Confirmed', 'Preparing', 'Picked Up', 'Out for Delivery', 'Delivered'];
    const currentIdx = statusOrder.findIndex(s => s.toLowerCase().includes(status.toLowerCase()) || status.toLowerCase().includes(s.toLowerCase()));

    if (currentIdx !== -1) {
      order.timeline.forEach((step, idx) => {
        if (idx <= currentIdx) {
          step.completed = true;
          if (!step.time.includes('M')) {
            step.time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          }
        }
      });
    }

    if (status === 'Delivered') {
      order.timeline[order.timeline.length - 1].completed = true;
      order.timeline[order.timeline.length - 1].time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    store.orders[orderIndex] = order;
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Get all orders (Admin / Restaurant)
// @route  GET /api/orders
export const getAllOrders = async (req, res) => {
  try {
    const store = getStore();
    res.json(store.orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
