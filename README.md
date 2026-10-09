# 🍔 FeastFlow - Multi-Role Food Delivery E-Commerce Web Application

**FeastFlow** is a modern, responsive food delivery e-commerce web platform built with semantic HTML5, vanilla CSS3 (glassmorphic dark design system), and modular JavaScript. It features dedicated workflows for **Customers**, **Restaurant Kitchens**, **Delivery Couriers**, and **Super Admins**, complete with an interactive **Responsive Bottom Navigation Bar**, dynamic **Starting Greeting Page**, live **Order Tracking GPS simulation**, and full **Login Authentication**.

---

## 🌟 Key Features

### 1. 👥 Multi-Role Portal System (All Roles are Unique)
- **👤 Customer Role (`Ayaz Khan`)**:
  - Browse restaurants and gourmet dish categories (Burgers, Pizza, Asian, Biryani, Healthy, Desserts, Beverages).
  - Search food with real-time text matching and Pure Veg filters.
  - Dish Customization modal with special notes, spice preference, and quantity steppers.
  - Interactive Slide-over Cart drawer with coupon code system (`FEAST30` for 30% off, `FREESHIP`), tip selection, taxes, and checkout.
  - Live Order Tracker modal with 4 progress stages and an animated 2D Canvas GPS telemetry route showing the courier bike moving in real time.
  - Past orders list and receipt details.

- **👨‍🍳 Restaurant Kitchen Manager Role (`Chef Marco - Bella Italia Bistro`)**:
  - Live Kitchen Display System (KDS / KOT) board with ticket urgency alerts.
  - Order progression buttons: `🔥 Accept & Cook` → `🔔 Mark Food Ready` → `🛵 Handover to Courier`.
  - Kitchen KPIs: Today's Sales, Active cooking tickets, avg cook speed (16 min).
  - Menu & Stock Manager: Instant toggle between **In Stock** and **Sold Out**, inline price editing, and an **Add New Dish** modal.

- **🛵 Delivery Partner / Rider Role (`Alex Swift`)**:
  - Online / Offline toggle with glowing status pill.
  - Shift dashboard: Today's Earnings ($86.50+), Completed trips counter, and 4.95 ⭐ rating.
  - Available Delivery Requests pool with pickup/drop locations and estimated earnings.
  - Active Trip HUD with turn-by-turn guidance and moving road canvas simulation (`Confirm Pickup` → `Arrived & Delivered`).

- **👑 Super Admin Panel (`Sarah Vance`)**:
  - Executive KPI Cards: Total Platform GMV ($34,890.00), Total Orders (1,420), Active Couriers (18), Registered Restaurants (38).
  - Weekly Sales Volume visual bar chart & top-selling dish categories.
  - Real-time Platform Orders desk with status override actions.
  - User & Role Access Management table with role promotion/demotion and Suspend/Activate toggles.

---

### 2. 📱 Responsive Bottom Navigation Bar
- Docked glassmorphic navigation bar optimized for mobile devices and tablets.
- **Dynamic tab switching**: Adapts automatically depending on which role is logged in:
  - *Customer*: `[🍽️ Explore]` `[🔍 Search]` `[🛍️ Cart]` `[📦 Orders]` `[👤 Account]`
  - *Restaurant*: `[📋 Tickets]` `[🍽️ Menu Stock]` `[➕ Add Dish]` `[👨‍🍳 Kitchen Acc]`
  - *Rider*: `[📍 Deliveries]` `[🛵 Active Trip]` `[💰 Earnings]` `[👤 Profile]`
  - *Admin*: `[📊 Dashboard]` `[🛒 All Orders]` `[👥 Users & Roles]` `[👑 Admin]`
- Includes an active glowing indicator, bouncy micro-interactions, and live cart count badges.
- **"📱 Simulator" button**: Built into the top navbar on desktop so you can preview the mobile phone experience with bottom navigation at any time!

---

### 3. ☀️ Starting Greeting Page & Personalized User Name
- Time-aware greeting: Displays `Good Morning ☀️`, `Good Afternoon 🍕`, or `Good Evening 🌙` with custom personalized mood copy.
- Prominently displays the logged-in user name (`Ayaz Khan`, `Chef Marco`, `Alex Swift`, `Sarah Vance`) in the header chip and greeting banner.
- Promotional banner with 1-click coupon application (`FEAST30`).

---

### 4. 🔐 Login Authentication Modal
- Modal with **1-Click Instant Demo Login** for each of the 4 roles:
  - `👤 Customer` (Ayaz Khan)
  - `👨‍🍳 Restaurant` (Chef Marco)
  - `🛵 Rider Partner` (Alex Swift)
  - `👑 Super Admin` (Sarah Vance)
- Standard Sign In and Sign Up forms with email, role selection, and persistent `localStorage` session state.

---

## 🚀 Running the Project Locally

The local server is already running in the background on **Port 3000**:

```bash
# To view in your browser:
http://localhost:3000/index.html
```

To stop or restart the server at any time:
```bash
# Using Python:
python -m http.server 3000

# Or using Node:
npx -y serve . -p 3000
```
