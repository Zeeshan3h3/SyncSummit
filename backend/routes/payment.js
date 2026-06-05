import express from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { authenticate } from '../middleware/auth.js';
import Inventory from '../models/Inventory.js';
import Order from '../models/Order.js';

const router = express.Router();


router.post('/create-order', authenticate, async (req, res, next) => {
  try {
    
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_SECRET
    });

    const item = await Inventory.findOneAndUpdate(
      { _id: req.body.itemId, quantity: { $gt: 0 } },
      { $inc: { quantity: -1 } },
      { new: true }
    );
    if (!item) return res.status(400).json({ error: 'Out of stock' });

    const order = await razorpay.orders.create({
      amount: item.price * 100, currency: 'INR',
      receipt: `receipt_${Date.now()}`
    });
    res.json({ orderId: order.id, amount: order.amount });
  } catch(err) { next(err); }
});


router.post('/verify', authenticate, async (req, res, next) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  const body = razorpay_order_id + '|' + razorpay_payment_id;
  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_SECRET)
    .update(body).digest('hex');
  if (expected !== razorpay_signature)
    return res.status(400).json({ error: 'Payment verification failed' });

  await Order.findOneAndUpdate(
    { razorpayOrderId: razorpay_order_id },
    { status: 'paid' }
  );
  res.json({ success: true });
});

// WEBHOOK: Real-time server-to-server updates from Razorpay
// NOTE: No 'authenticate' middleware here because Razorpay's servers are calling this, not our users!
router.post('/webhook', express.json(), async (req, res, next) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    
    // Cryptographically verify that this request actually came from Razorpay
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (expectedSignature !== signature) {
      return res.status(400).json({ error: 'Invalid webhook signature' });
    }

    // Razorpay sends different events. We only care about payment success or failure.
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

    // Always return a 200 OK immediately so Razorpay knows we received it
    res.status(200).json({ received: true });
  } catch (err) {
    next(err);
  }
});

export default router;
