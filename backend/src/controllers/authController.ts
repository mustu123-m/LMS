import { Request, Response } from 'express';
import User from '../models/User';
import { signToken } from '../utils/jwt';

export const register = async (req: Request, res: Response): Promise<void> => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400).json({ success: false, message: 'Name, email and password are required' });
    return;
  }

  const existing = await User.findOne({ email });
  if (existing) {
    res.status(400).json({ success: false, message: 'Email already registered' });
    return;
  }

  const user = await User.create({ name, email, password, role: 'borrower' });
  const token = signToken(user._id.toString(), user.role);

  res.status(201).json({
    success: true,
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ success: false, message: 'Email and password are required' });
    return;
  }

  const user = await User.findOne({ email });
  if (!user || !(await user.comparePassword(password))) {
    res.status(401).json({ success: false, message: 'Invalid email or password' });
    return;
  }

  const token = signToken(user._id.toString(), user.role);

  res.json({
    success: true,
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
};

export const getMe = async (req: Request & { user?: { id: string } }, res: Response): Promise<void> => {
  const user = await User.findById(req.user!.id).select('-password');
  res.json({ success: true, user });
};
