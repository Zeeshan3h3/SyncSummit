import { Router } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { authenticate } from '../middleware/auth.js';
const router = Router();

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

const sendToken = (user, res) => {
  const token = signToken(user._id);
  res.cookie('token', token, {
    httpOnly: true, secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 * 1000
  });
  return token;
};

router.post('/register', async (req, res, next) => {
  try {
    const user = await User.create(req.body);
    const token = sendToken(user, res);
    res.status(201).json({ user: { id: user._id, name: user.name, role: user.role }, token });
  } catch(err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: 'An account with this email already exists' });
    }
    next(err);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ error: 'Invalid credentials' });
    const token = sendToken(user, res);
    res.json({ user: { id: user._id, name: user.name, role: user.role }, token });
  } catch(err) { next(err); }
});

router.post('/logout', (req, res) => {
  res.clearCookie('token').json({ message: 'Logged out' });
});

router.get('/me', authenticate, (req, res) => {
  // Grab the token from the cookie or header so we can pass it back to the frontend
  const currentToken = req.cookies.token || req.headers.authorization?.split(' ')[1];
  
  res.json({
    user: { 
      id: req.user._id, 
      name: req.user.name, 
      role: req.user.role 
    },
    token: currentToken
  });
});


export default router;