import User from '../models/User.js';
import Order from '../models/Order.js';
import Event from '../models/Event.js';
import Product from '../models/Product.js';

// GET all users (Admin/Superadmin)
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    next(err);
  }
};

// PATCH change user role (Superadmin only)
export const changeUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin', 'superadmin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id, 
      { role }, 
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) return res.status(404).json({ error: 'User not found' });
    res.json(updatedUser);
  } catch (err) {
    next(err);
  }
};

// GET financials (Superadmin only)
export const getFinancials = async (req, res, next) => {
  try {
    const stats = await Order.aggregate([
      { $match: { status: 'paid' } },
      { 
        $group: { 
          _id: null, 
          totalRevenue: { $sum: "$amount" }, 
          successfulOrders: { $sum: 1 } 
        } 
      }
    ]);

    const financials = stats.length > 0 ? stats[0] : { totalRevenue: 0, successfulOrders: 0 };
    
    res.json({
      totalRevenueINR: financials.totalRevenue / 100,
      successfulOrders: financials.successfulOrders
    });
  } catch (err) {
    next(err);
  }
};

// GET system stats (Superadmin only)
export const getSystemStats = async (req, res, next) => {
  try {
    const usersCount = await User.countDocuments();
    const eventsCount = await Event.countDocuments();
    const productsCount = await Product.countDocuments();
    const ordersCount = await Order.countDocuments();
    
    const stats = await Order.aggregate([
      { $match: { status: 'paid' } },
      { 
        $group: { 
          _id: null, 
          totalRevenue: { $sum: "$amount" }
        } 
      }
    ]);
    const revenue = stats.length > 0 ? stats[0].totalRevenue / 100 : 0;

    // Calculate revenue by category
    const categoryStats = await Order.aggregate([
      { $match: { status: 'paid' } },
      { $unwind: "$items" },
      { 
        $group: { 
          _id: "$items.category", 
          val: { $sum: { $multiply: ["$items.price", "$items.quantity"] } }
        } 
      },
      { $sort: { val: -1 } }
    ]);
    
    let totalRevenueCategory = 0;
    categoryStats.forEach(stat => { totalRevenueCategory += stat.val; });

    const revenueByCategory = categoryStats.map(stat => ({
      label: stat._id || 'Uncategorized',
      val: stat.val,
      percent: totalRevenueCategory > 0 ? Math.round((stat.val / totalRevenueCategory) * 100) : 0
    }));

    res.json({
      users: usersCount,
      events: eventsCount,
      products: productsCount,
      orders: ordersCount,
      revenue,
      revenueByCategory,
      registrationsOverTime: [
        { day: 'Day 1', val: 160 },
        { day: 'Day 2', val: 140 },
        { day: 'Day 3', val: 150 },
        { day: 'Day 4', val: 110 },
        { day: 'Day 5', val: 70 },
        { day: 'Day 6', val: 40 },
        { day: 'Day 7', val: 0 }
      ]
    });
  } catch (err) {
    next(err);
  }
};

// GET all orders with user info (Admin/Superadmin)
export const getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    next(err);
  }
};

// GET event registrations by eventId (Admin/Superadmin)
export const getEventRegistrations = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.eventId)
      .populate('registrations', 'name email');
    if (!event) return res.status(404).json({ error: 'Event not found' });
    res.json(event.registrations || []);
  } catch (err) {
    next(err);
  }
};
