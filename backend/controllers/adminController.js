
import User from '../models/User.js';
import Order from '../models/Order.js';

// GET all users (Admin/Superadmin)
export const getAllUsers = async (req, res, next) => {
  try {
    // Exclude passwords from the result for security
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
    // Validate role against enum manually just in case, though Mongoose runValidators catches it too
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
    // Use MongoDB Aggregation pipeline to quickly calculate total revenue
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

    // If no orders yet, return 0
    const financials = stats.length > 0 ? stats[0] : { totalRevenue: 0, successfulOrders: 0 };
    

    res.json({
      totalRevenueINR: financials.totalRevenue / 100,
      successfulOrders: financials.successfulOrders
    });
  } catch (err) {
    next(err);
  }
};
