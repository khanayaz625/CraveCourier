# 🍔 CraveCourier — Full-Stack MERN Food Delivery E-Commerce Platform

> **Modern, Lightning-Fast Gourmet Food Delivery Application** powered by **MongoDB, Express.js, React (Vite), and Node.js**.

---

## 🌟 Key Features

### 🍕 Customer Experience
- **Interactive Menu & Category Browsing**: Pizza, Burgers, Asian Sushi & Ramen, Indian Dum Biryani, Mexican Tacos, Healthy Bowls, Desserts, and Drinks.
- **Dietary & Preference Filters**: Pure Veg (`🌿`), Non-Veg (`🥩`), Vegan (`🌱`), Gluten-Free (`🌾`), and multi-attribute sorting.
- **Smart Customizer Dialog**: Select portion size, gourmet add-ons, spice level, and chef notes.
- **Slide-in Cart & Promo Engine**: Real-time tax & delivery fee calculations, free delivery threshold progress bar, and instant promo validation (`FEAST50`, `CRAVE20`, `FREEDEL`).
- **Multi-Step Checkout**: Preset address picker, instant GPS detect, priority vs. eco delivery, interactive credit card / Apple Pay / UPI / COD payment methods with celebration confetti.
- **Live GPS Order Tracking**: Vector simulated map showing Restaurant Pin, moving Driver Scooter along the delivery route, Customer destination pin, ETA countdown, and VoIP call / messaging simulation.
- **Past Order History**: View order status, detailed receipt items, 1-click reorder, and live tracking.

### 👨‍🍳 Admin & Kitchen Dashboard
- **Analytics Overview**: Gross Revenue metrics, active kitchen orders, fulfillment rate, cuisine breakdown charts.
- **Live Dispatch Pipeline**: Change order status across *Confirmed ➜ Preparing ➜ Out for Delivery ➜ Delivered*.
- **Menu Delicacies CRUD**: Add new dish, update prices, change description/image, toggle vegetarian status, and delete items.

---

## 🔑 1-Click Demo Accounts

| Role | Email | Password | Access / Capabilities |
|---|---|---|---|
| **Customer** | `user@crave.com` | `user123` | Place orders, track deliveries, save addresses |
| **Admin** | `admin@crave.com` | `admin123` | Full dashboard, revenue analytics, menu management |
| **Kitchen Chef** | `chef@crave.com` | `chef123` | Kitchen order dispatching, menu item management |

---

## 🚀 Running the Project

### 1. Backend Server
```bash
cd backend
npm install
npm run dev
# Running on http://localhost:5000
```

### 2. Frontend Application
```bash
cd frontend
npm install
npm run dev
# Running on http://localhost:5173
```

---

## 🛠️ API Reference

- `GET /api/health` — Backend health check
- `POST /api/auth/login` — JWT user authentication
- `POST /api/auth/register` — User registration
- `GET /api/foods` — Get foods with search, filters, category & dietary parameters
- `POST /api/foods` — Add new dish (Admin/Chef)
- `GET /api/restaurants` — List all culinary partner restaurants
- `POST /api/orders` — Place order
- `GET /api/orders/myorders` — Retrieve user's orders
- `GET /api/orders/:id` — Get live order tracking data
- `PUT /api/orders/:id/status` — Update order delivery status
- `POST /api/coupons/validate` — Validate promo code
- `GET /api/admin/stats` — Retrieve sales & revenue metrics

---

*Built with ❤️ for culinary enthusiasts.*
