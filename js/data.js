/**
 * FeastFlow - Database & State Store with Role Credentials
 */

const DEFAULT_USERS = [
  {
    id: 'u1',
    username: 'customer',
    email: 'customer@feastflow.com',
    password: 'customer123',
    name: 'Ayaz Khan',
    role: 'customer',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
    phone: '+1 (555) 019-2834',
    address: '742 Evergreen Terrace, Springfield',
    savedAddresses: [
      { id: 'a1', label: 'Home', address: '742 Evergreen Terrace, Apt 4B', isDefault: true },
      { id: 'a2', label: 'Office', address: '100 Silicon Blvd, Suite 300', isDefault: false }
    ],
    status: 'active'
  },
  {
    id: 'u2',
    username: 'restaurant',
    email: 'restaurant@feastflow.com',
    password: 'chef123',
    name: 'Chef Marco Rossi',
    role: 'restaurant',
    restaurantId: 'r1',
    restaurantName: 'Bella Italia Bistro',
    avatar: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=200&q=80',
    phone: '+1 (555) 982-1144',
    address: '45 Via Roma, Downtown Food Quarter',
    status: 'active'
  },
  {
    id: 'u3',
    username: 'rider',
    email: 'rider@feastflow.com',
    password: 'rider123',
    name: 'Alex Swift',
    role: 'rider',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&q=80',
    phone: '+1 (555) 887-3401',
    vehicle: 'Honda PCX Electric Scooter (Silver)',
    vehiclePlate: 'EV-882-FL',
    rating: 4.95,
    completedOrders: 342,
    todayEarnings: 86.50,
    status: 'active'
  },
  {
    id: 'u4',
    username: 'admin',
    email: 'admin@feastflow.com',
    password: 'admin123',
    name: 'Sarah Vance (Chief Admin)',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    phone: '+1 (555) 771-0022',
    status: 'active'
  }
];

const RESTAURANTS = [
  {
    id: 'r1',
    name: 'Bella Italia Bistro',
    cuisine: 'Authentic Italian & Artisan Pizza',
    rating: 4.8,
    reviewsCount: 420,
    deliveryTime: '25-35 min',
    minOrder: 15,
    deliveryFee: 2.99,
    badge: 'Chef Recommended',
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80',
    address: '45 Via Roma, Downtown District'
  },
  {
    id: 'r2',
    name: 'The Burger Foundry',
    cuisine: 'Gourmet Smashed Burgers & Fries',
    rating: 4.9,
    reviewsCount: 890,
    deliveryTime: '20-30 min',
    minOrder: 12,
    deliveryFee: 1.99,
    badge: 'Most Popular',
    image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=600&q=80',
    address: '102 Industrial Way, Meatpacking Dist'
  },
  {
    id: 'r3',
    name: 'Sakura Sushi Bar',
    cuisine: 'Japanese Sashimi, Nigiri & Rolls',
    rating: 4.7,
    reviewsCount: 310,
    deliveryTime: '30-45 min',
    minOrder: 20,
    deliveryFee: 3.49,
    badge: 'Premium Fresh',
    image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=600&q=80',
    address: '88 Cherry Blossom Lane'
  },
  {
    id: 'r4',
    name: 'Spice Symphony',
    cuisine: 'Royal Indian Mughlai & Biryani',
    rating: 4.8,
    reviewsCount: 560,
    deliveryTime: '25-35 min',
    minOrder: 18,
    deliveryFee: 2.49,
    badge: 'Trending Now',
    image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=600&q=80',
    address: '15 Curry Street, Old Town'
  },
  {
    id: 'r5',
    name: 'Green Bowl Organics',
    cuisine: 'Superfood Salads, Detox & Vegan',
    rating: 4.9,
    reviewsCount: 290,
    deliveryTime: '15-25 min',
    minOrder: 10,
    deliveryFee: 1.49,
    badge: 'Healthy Choice',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80',
    address: '210 Organic Plaza, Eco Valley'
  },
  {
    id: 'r6',
    name: 'Sweet Bliss Bakery & Cafe',
    cuisine: 'Artisan Pastries, Waffles & Coffee',
    rating: 4.9,
    reviewsCount: 680,
    deliveryTime: '20-30 min',
    minOrder: 10,
    deliveryFee: 1.99,
    badge: 'Top Rated',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
    address: '34 Sugarland Ave'
  }
];

const DISHES = [
  {
    id: 'd1',
    restaurantId: 'r2',
    restaurantName: 'The Burger Foundry',
    name: 'Truffle Mushroom Smash Burger',
    category: 'Burgers',
    price: 14.99,
    originalPrice: 17.99,
    rating: 4.9,
    ratingCount: 320,
    prepTime: '15 min',
    calories: '680 kcal',
    isVeg: false,
    badge: 'Best Seller',
    inStock: true,
    description: 'Double Angus beef patties, melted Swiss Gruyere, pan-seared black truffle mushrooms, garlic aioli on toasted brioche.',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'd2',
    restaurantId: 'r1',
    restaurantName: 'Bella Italia Bistro',
    name: 'Wood-Fired Margherita D.O.P',
    category: 'Pizza',
    price: 16.50,
    originalPrice: 19.00,
    rating: 4.8,
    ratingCount: 412,
    prepTime: '18 min',
    calories: '820 kcal',
    isVeg: true,
    badge: 'Classic',
    inStock: true,
    description: 'San Marzano tomatoes, fresh Buffalo mozzarella, hand-picked sweet basil, and extra virgin cold-pressed olive oil.',
    image: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'd3',
    restaurantId: 'r3',
    restaurantName: 'Sakura Sushi Bar',
    name: 'Spicy Dragon Salmon Roll',
    category: 'Asian',
    price: 17.80,
    originalPrice: 21.00,
    rating: 4.9,
    ratingCount: 190,
    prepTime: '20 min',
    calories: '450 kcal',
    isVeg: false,
    badge: 'Chef Special',
    inStock: true,
    description: 'Atlantic salmon, spicy sriracha crunch, avocado, unagi glaze, torched to perfection with tobiko roe.',
    image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'd4',
    restaurantId: 'r4',
    restaurantName: 'Spice Symphony',
    name: 'Royal Awadhi Dum Biryani',
    category: 'Biryani',
    price: 15.99,
    originalPrice: 18.50,
    rating: 4.9,
    ratingCount: 520,
    prepTime: '25 min',
    calories: '740 kcal',
    isVeg: false,
    badge: 'Most Loved',
    inStock: true,
    description: 'Slow-cooked fragrant Basmati rice layered with tender spiced chicken, saffron milk, caramelized onions, and cooling mint raita.',
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'd5',
    restaurantId: 'r5',
    restaurantName: 'Green Bowl Organics',
    name: 'Avocado & Quinoa Power Bowl',
    category: 'Healthy',
    price: 13.50,
    originalPrice: 15.00,
    rating: 4.8,
    ratingCount: 145,
    prepTime: '12 min',
    calories: '390 kcal',
    isVeg: true,
    badge: 'Superfood',
    inStock: true,
    description: 'Hass avocado roses, organic tri-color quinoa, edamame, roasted chickpeas, cherry tomatoes, and tahini lemon dressing.',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'd6',
    restaurantId: 'r1',
    restaurantName: 'Bella Italia Bistro',
    name: 'Tuscan Garlic Herb Pasta',
    category: 'Pasta',
    price: 18.25,
    originalPrice: 21.00,
    rating: 4.7,
    ratingCount: 220,
    prepTime: '20 min',
    calories: '650 kcal',
    isVeg: true,
    badge: 'Popular',
    inStock: true,
    description: 'Handmade fettuccine tossed in a rich roasted garlic white wine cream, sun-dried tomatoes, and 24-month aged Parmigiano Reggiano.',
    image: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281781?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'd7',
    restaurantId: 'r2',
    restaurantName: 'The Burger Foundry',
    name: 'Crispy Truffle Parmesan Fries',
    category: 'Sides',
    price: 7.99,
    originalPrice: 9.50,
    rating: 4.8,
    ratingCount: 390,
    prepTime: '10 min',
    calories: '420 kcal',
    isVeg: true,
    badge: 'Crunchy',
    inStock: true,
    description: 'Skin-on golden Idaho fries tossed in aromatic white truffle oil, grated pecorino parmesan, and fresh chopped parsley.',
    image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'd8',
    restaurantId: 'r6',
    restaurantName: 'Sweet Bliss Bakery & Cafe',
    name: 'Belgian Triple Choco Waffle',
    category: 'Desserts',
    price: 10.50,
    originalPrice: 12.50,
    rating: 4.9,
    ratingCount: 460,
    prepTime: '15 min',
    calories: '550 kcal',
    isVeg: true,
    badge: 'Sweet Tooth',
    inStock: true,
    description: 'Golden liege waffle drenched in dark, milk, and white Belgian chocolate ganache, topped with fresh strawberries and vanilla bean gelato.',
    image: 'https://images.unsplash.com/photo-1562376552-0d160a2f238d?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'd9',
    restaurantId: 'r6',
    restaurantName: 'Sweet Bliss Bakery & Cafe',
    name: 'Iced Salted Caramel Cold Brew',
    category: 'Beverages',
    price: 5.49,
    originalPrice: 6.50,
    rating: 4.9,
    ratingCount: 280,
    prepTime: '5 min',
    calories: '180 kcal',
    isVeg: true,
    badge: 'Chilled',
    inStock: true,
    description: '18-hour steeped single-origin Ethiopian cold brew with handcrafted salted caramel syrup and velvety sweet cream cloud cold foam.',
    image: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'd10',
    restaurantId: 'r4',
    restaurantName: 'Spice Symphony',
    name: 'Paneer Butter Masala & Garlic Naan',
    category: 'Curry',
    price: 16.00,
    originalPrice: 18.00,
    rating: 4.8,
    ratingCount: 310,
    prepTime: '20 min',
    calories: '690 kcal',
    isVeg: true,
    badge: 'Vegetarian Favorite',
    inStock: true,
    description: 'Soft cottage cheese cubes simmered in a creamy, velvety tomato, cashew and butter gravy served with clay-oven baked garlic butter naan.',
    image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=600&q=80'
  }
];

const INITIAL_ORDERS = [
  {
    id: 'ORD-8921',
    customerName: 'Ayaz Khan',
    customerId: 'u1',
    restaurantId: 'r2',
    restaurantName: 'The Burger Foundry',
    riderId: 'u3',
    riderName: 'Alex Swift',
    riderPhone: '+1 (555) 887-3401',
    items: [
      { id: 'd1', name: 'Truffle Mushroom Smash Burger', price: 14.99, quantity: 2 },
      { id: 'd7', name: 'Crispy Truffle Parmesan Fries', price: 7.99, quantity: 1 }
    ],
    subtotal: 37.97,
    discount: 11.39,
    deliveryFee: 1.99,
    taxes: 2.50,
    total: 31.07,
    status: 'out_for_delivery',
    deliveryAddress: '742 Evergreen Terrace, Springfield',
    orderTime: '15 mins ago',
    eta: '12 mins',
    paymentMethod: 'Credit Card (•••• 4242)',
    liveProgress: 75
  },
  {
    id: 'ORD-8919',
    customerName: 'Sophia Lin',
    customerId: 'u_guest1',
    restaurantId: 'r1',
    restaurantName: 'Bella Italia Bistro',
    riderId: null,
    riderName: null,
    items: [
      { id: 'd2', name: 'Wood-Fired Margherita D.O.P', price: 16.50, quantity: 1 },
      { id: 'd6', name: 'Tuscan Garlic Herb Pasta', price: 18.25, quantity: 1 }
    ],
    subtotal: 34.75,
    discount: 0,
    deliveryFee: 2.99,
    taxes: 2.90,
    total: 40.64,
    status: 'preparing',
    deliveryAddress: '404 Grand Avenue, Apt 12C',
    orderTime: '22 mins ago',
    eta: '25 mins',
    paymentMethod: 'Apple Pay',
    liveProgress: 45
  },
  {
    id: 'ORD-8915',
    customerName: 'Marcus Bennett',
    customerId: 'u_guest2',
    restaurantId: 'r1',
    restaurantName: 'Bella Italia Bistro',
    riderId: null,
    riderName: null,
    items: [
      { id: 'd2', name: 'Wood-Fired Margherita D.O.P', price: 16.50, quantity: 2 }
    ],
    subtotal: 33.00,
    discount: 5.00,
    deliveryFee: 2.99,
    taxes: 2.50,
    total: 33.49,
    status: 'pending',
    deliveryAddress: '12 West River Street',
    orderTime: '5 mins ago',
    eta: '35 mins',
    paymentMethod: 'Cash on Delivery',
    liveProgress: 15
  },
  {
    id: 'ORD-8890',
    customerName: 'Ayaz Khan',
    customerId: 'u1',
    restaurantId: 'r6',
    restaurantName: 'Sweet Bliss Bakery & Cafe',
    riderId: 'u3',
    riderName: 'Alex Swift',
    items: [
      { id: 'd8', name: 'Belgian Triple Choco Waffle', price: 10.50, quantity: 2 },
      { id: 'd9', name: 'Iced Salted Caramel Cold Brew', price: 5.49, quantity: 2 }
    ],
    subtotal: 31.98,
    discount: 9.59,
    deliveryFee: 1.99,
    taxes: 2.20,
    total: 26.58,
    status: 'delivered',
    deliveryAddress: '742 Evergreen Terrace, Springfield',
    orderTime: 'Yesterday, 8:15 PM',
    eta: 'Completed',
    paymentMethod: 'Credit Card (•••• 4242)',
    liveProgress: 100
  }
];

const PROMO_CODES = {
  FEAST30: { discountPercent: 30, minOrder: 15, description: '30% off your entire order' },
  WELCOME50: { discountAmount: 10, minOrder: 25, description: '$10 off first order over $25' },
  FREESHIP: { freeDelivery: true, minOrder: 10, description: 'Free Express Delivery' }
};

class DataStore {
  constructor() {
    this.loadState();
  }

  loadState() {
    this.users = JSON.parse(localStorage.getItem('ff_users')) || DEFAULT_USERS;
    this.restaurants = JSON.parse(localStorage.getItem('ff_restaurants')) || RESTAURANTS;
    this.dishes = JSON.parse(localStorage.getItem('ff_dishes')) || DISHES;
    this.orders = JSON.parse(localStorage.getItem('ff_orders')) || INITIAL_ORDERS;
    // By default, currentUser is null if unauthenticated
    const savedUser = localStorage.getItem('ff_current_user');
    this.currentUser = savedUser ? JSON.parse(savedUser) : null;
  }

  save() {
    localStorage.setItem('ff_users', JSON.stringify(this.users));
    localStorage.setItem('ff_restaurants', JSON.stringify(this.restaurants));
    localStorage.setItem('ff_dishes', JSON.stringify(this.dishes));
    localStorage.setItem('ff_orders', JSON.stringify(this.orders));
    if (this.currentUser) {
      localStorage.setItem('ff_current_user', JSON.stringify(this.currentUser));
    } else {
      localStorage.removeItem('ff_current_user');
    }
  }

  setCurrentUser(user) {
    this.currentUser = user;
    this.save();
    window.dispatchEvent(new CustomEvent('user-changed', { detail: user }));
  }

  addOrder(order) {
    this.orders.unshift(order);
    this.save();
    window.dispatchEvent(new CustomEvent('orders-updated'));
    return order;
  }

  updateOrderStatus(orderId, newStatus, extraData = {}) {
    const order = this.orders.find(o => o.id === orderId);
    if (order) {
      order.status = newStatus;
      Object.assign(order, extraData);
      if (newStatus === 'delivered') order.liveProgress = 100;
      if (newStatus === 'out_for_delivery') order.liveProgress = 75;
      if (newStatus === 'ready') order.liveProgress = 60;
      if (newStatus === 'preparing') order.liveProgress = 40;
      this.save();
      window.dispatchEvent(new CustomEvent('orders-updated'));
    }
  }

  toggleDishStock(dishId) {
    const dish = this.dishes.find(d => d.id === dishId);
    if (dish) {
      dish.inStock = !dish.inStock;
      this.save();
      window.dispatchEvent(new CustomEvent('dishes-updated'));
    }
  }

  updateDishPrice(dishId, newPrice) {
    const dish = this.dishes.find(d => d.id === dishId);
    if (dish) {
      dish.price = parseFloat(newPrice);
      this.save();
      window.dispatchEvent(new CustomEvent('dishes-updated'));
    }
  }

  addDish(newDish) {
    this.dishes.unshift(newDish);
    this.save();
    window.dispatchEvent(new CustomEvent('dishes-updated'));
  }

  updateUserRole(userId, newRole) {
    const user = this.users.find(u => u.id === userId);
    if (user) {
      user.role = newRole;
      if (this.currentUser && this.currentUser.id === userId) {
        this.currentUser.role = newRole;
      }
      this.save();
      window.dispatchEvent(new CustomEvent('user-changed', { detail: this.currentUser }));
      window.dispatchEvent(new CustomEvent('users-updated'));
    }
  }

  toggleUserStatus(userId) {
    const user = this.users.find(u => u.id === userId);
    if (user) {
      user.status = user.status === 'active' ? 'suspended' : 'active';
      this.save();
      window.dispatchEvent(new CustomEvent('users-updated'));
    }
  }
}

window.db = new DataStore();
window.PROMO_CODES = PROMO_CODES;
