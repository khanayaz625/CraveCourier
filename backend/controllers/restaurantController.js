import { getStore } from '../config/db.js';

// @desc   Get all restaurants
// @route  GET /api/restaurants
export const getRestaurants = async (req, res) => {
  try {
    const store = getStore();
    let restaurants = [...store.restaurants];
    const { search, cuisine } = req.query;

    if (search) {
      const q = search.toLowerCase();
      restaurants = restaurants.filter(r => 
        r.name.toLowerCase().includes(q) || 
        r.cuisine.toLowerCase().includes(q) ||
        r.address.toLowerCase().includes(q)
      );
    }

    if (cuisine) {
      restaurants = restaurants.filter(r => r.cuisine.toLowerCase().includes(cuisine.toLowerCase()));
    }

    res.json(restaurants);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Get restaurant by ID with its menu
// @route  GET /api/restaurants/:id
export const getRestaurantById = async (req, res) => {
  try {
    const store = getStore();
    const restaurant = store.restaurants.find(r => r.id === req.params.id || r._id === req.params.id);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    const menu = store.foods.filter(f => f.restaurantId === restaurant.id);
    res.json({ ...restaurant, menu });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
