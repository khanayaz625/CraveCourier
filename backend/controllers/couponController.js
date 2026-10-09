import { getStore } from '../config/db.js';

// @desc   Validate coupon code
// @route  POST /api/coupons/validate
export const validateCoupon = async (req, res) => {
  try {
    const store = getStore();
    const { code, orderAmount } = req.body;

    if (!code) {
      return res.status(400).json({ message: 'Coupon code is required' });
    }

    const coupon = store.coupons.find(c => c.code.toUpperCase() === code.trim().toUpperCase());
    if (!coupon) {
      return res.status(404).json({ message: 'Invalid promo code. Try FEAST50 or CRAVE20!' });
    }

    if (orderAmount && orderAmount < (coupon.minOrderAmount || 0)) {
      return res.status(400).json({
        message: `Minimum order of $${coupon.minOrderAmount} required for coupon ${coupon.code}`
      });
    }

    let discount = 0;
    if (coupon.discountPercent && !coupon.isFreeDelivery) {
      discount = Math.min((orderAmount * coupon.discountPercent) / 100, coupon.maxDiscount || 999);
    }

    res.json({
      valid: true,
      code: coupon.code,
      discount: Number(discount.toFixed(2)),
      isFreeDelivery: Boolean(coupon.isFreeDelivery),
      description: coupon.description
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Get all active coupons
// @route  GET /api/coupons
export const getCoupons = async (req, res) => {
  try {
    const store = getStore();
    res.json(store.coupons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
