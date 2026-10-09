import { getStore } from '../config/db.js';

// @desc   Get all foods with search, filters, sorting
// @route  GET /api/foods
export const getFoods = async (req, res) => {
  try {
    const store = getStore();
    let foods = [...store.foods];

    const { search, category, isVeg, isVegan, isGlutenFree, maxPrice, sort, restaurantId } = req.query;

    if (search) {
      const q = search.toLowerCase();
      foods = foods.filter(f => 
        f.name.toLowerCase().includes(q) || 
        f.description.toLowerCase().includes(q) ||
        f.restaurantName?.toLowerCase().includes(q) ||
        f.tags?.some(t => t.toLowerCase().includes(q))
      );
    }

    if (category && category !== 'all') {
      foods = foods.filter(f => f.category.toLowerCase() === category.toLowerCase());
    }

    if (restaurantId) {
      foods = foods.filter(f => f.restaurantId === restaurantId);
    }

    if (isVeg === 'true') {
      foods = foods.filter(f => f.isVeg);
    }

    if (isVegan === 'true') {
      foods = foods.filter(f => f.isVegan);
    }

    if (isGlutenFree === 'true') {
      foods = foods.filter(f => f.isGlutenFree);
    }

    if (maxPrice) {
      foods = foods.filter(f => f.price <= Number(maxPrice));
    }

    if (sort) {
      if (sort === 'price_asc') foods.sort((a, b) => a.price - b.price);
      else if (sort === 'price_desc') foods.sort((a, b) => b.price - a.price);
      else if (sort === 'rating') foods.sort((a, b) => b.rating - a.rating);
      else if (sort === 'popular') foods.sort((a, b) => (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0));
    }

    res.json(foods);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Get categories
// @route  GET /api/foods/categories
export const getCategories = async (req, res) => {
  try {
    const store = getStore();
    res.json(store.categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Get single food by ID
// @route  GET /api/foods/:id
export const getFoodById = async (req, res) => {
  try {
    const store = getStore();
    const food = store.foods.find(f => f.id === req.params.id || f._id === req.params.id);
    if (!food) {
      return res.status(404).json({ message: 'Food item not found' });
    }
    res.json(food);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Create new food item (Admin or Restaurant)
// @route  POST /api/foods
export const createFood = async (req, res) => {
  try {
    const store = getStore();
    const {
      name, category, price, originalPrice, description,
      image, isVeg, isVegan, isGlutenFree, prepTime, calories, spicyLevel,
      restaurantId, restaurantName, tags
    } = req.body;

    if (!name || !category || !price || !description) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const newFood = {
      id: `food-${Date.now()}`,
      name,
      category,
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : Number(price) * 1.2,
      discount: originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 15,
      rating: 5.0,
      ratingCount: 1,
      image: image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
      description,
      isVeg: Boolean(isVeg),
      isVegan: Boolean(isVegan),
      isGlutenFree: Boolean(isGlutenFree),
      isPopular: true,
      prepTime: prepTime || '15-20 min',
      calories: calories || '550 kcal',
      spicyLevel: Number(spicyLevel) || 0,
      restaurantId: restaurantId || 'rest-1',
      restaurantName: restaurantName || 'Bella Napoli Artisan Pizzeria',
      tags: tags || ['Special', 'Chef Recommended'],
      available: true
    };

    store.foods.unshift(newFood);
    res.status(201).json(newFood);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Update food item
// @route  PUT /api/foods/:id
export const updateFood = async (req, res) => {
  try {
    const store = getStore();
    const index = store.foods.findIndex(f => f.id === req.params.id || f._id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ message: 'Food item not found' });
    }

    store.foods[index] = { ...store.foods[index], ...req.body };
    res.json(store.foods[index]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Delete food item
// @route  DELETE /api/foods/:id
export const deleteFood = async (req, res) => {
  try {
    const store = getStore();
    const index = store.foods.findIndex(f => f.id === req.params.id || f._id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ message: 'Food item not found' });
    }

    const deleted = store.foods.splice(index, 1);
    res.json({ message: 'Food item deleted successfully', deleted: deleted[0] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
