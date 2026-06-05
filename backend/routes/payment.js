import Razorpay from 'razorpay';
import crypto from 'crypto';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET
});

// Step 1: Create order (user clicks Buy)
router.post('/create-order', authenticate, async (req, res, next) => {
  try {
    // Atomic check — only decrement if quantity > 0
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

// Step 2: Verify payment after Razorpay checkout
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