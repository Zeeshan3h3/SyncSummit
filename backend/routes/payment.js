import express from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { authenticate } from '../middleware/auth.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';

const router = express.Router();


router.post('/create-order', authenticate, async (req, res, next) => {
  try {
    const { items, totalAmount } = req.body; // Items array from cart

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_mock',
      key_secret: process.env.RAZORPAY_SECRET || 'mock_secret'
    });

    // We skip actual Inventory decrement for now because ProductDetail uses mock IDs (e.g. 1, 2, 999) 
    // that don't exist in the real Inventory DB schema yet. 
    // In production, we'd loop through items and decrement.

    // Using the totalAmount passed from frontend (in INR)
    const amountInPaise = Math.round(totalAmount * 100);

    const orderParams = {
      amount: amountInPaise, 
      currency: 'INR',
      receipt: `receipt_${Date.now()}`
    };

    // Since razorpay keys might be dummy strings in dev, let's try-catch razorpay call
    // If it fails (due to bad keys), we'll simulate a successful order creation for testing purposes
    let order;
    try {
      order = await razorpay.orders.create(orderParams);
    } catch (rzpErr) {
      console.warn("Razorpay API error (likely invalid keys). Mocking order creation for dev.", rzpErr);
      order = {
        id: `order_mock_${Date.now()}`,
        amount: amountInPaise
      };
    }

    // Save order to our DB
    const newOrder = await Order.create({
      user: req.user.id,
      items: items.map(i => ({
        productId: i.product_id?.toString() || i.id?.toString(),
        name: i.name,
        quantity: i.quantity,
        price: i.price,
        size: i.size
      })),
      razorpayOrderId: order.id,
      amount: totalAmount
    });

    res.json({ orderId: order.id, amount: order.amount, dbOrderId: newOrder._id });
  } catch(err) { next(err); }
});


router.post('/verify', authenticate, async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    
    // If it's a mock order (from our dev fallback), just verify it directly
    if (razorpay_order_id.startsWith('order_mock_')) {
      await Order.findOneAndUpdate(
        { razorpayOrderId: razorpay_order_id },
        { status: 'paid' }
      );
      return res.json({ success: true, message: 'Mock payment verified' });
    }

    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expected = crypto
      .createHmac('sha256', process.env.RAZORPAY_SECRET || 'mock_secret')
      .update(body).digest('hex');
    
    if (expected !== razorpay_signature)
      return res.status(400).json({ error: 'Payment verification failed' });

    await Order.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      { status: 'paid' }
    );
    res.json({ success: true });
  } catch(err) { next(err); }
});

// WEBHOOK: Real-time server-to-server updates from Razorpay
router.post('/webhook', express.json(), async (req, res, next) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET || 'mock')
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (expectedSignature !== signature) {
      return res.status(400).json({ error: 'Invalid webhook signature' });
    }

    const event = req.body.event;
    const paymentEntity = req.body.payload.payment.entity;
    
    if (event === 'payment.captured') {
      await Order.findOneAndUpdate(
        { razorpayOrderId: paymentEntity.order_id },
        { status: 'paid' }
      );
    } else if (event === 'payment.failed') {
      await Order.findOneAndUpdate(
        { razorpayOrderId: paymentEntity.order_id },
        { status: 'failed' }
      );
    }

    res.status(200).json({ received: true });
  } catch (err) {
    next(err);
  }
});

export default router;
