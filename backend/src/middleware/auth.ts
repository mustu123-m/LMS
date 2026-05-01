import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { UserRole } from '../models/User';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: UserRole;
    name: string;
    email: string;
  };
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'No token provided' });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
      role: UserRole;
    };
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      res.status(401).json({ success: false, message: 'User not found' });
      return;
    }
    req.user = { id: user._id.toString(), role: user.role, name: user.name, email: user.email };
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

export const authorize = (...roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }
    // Admin can access everything
    if (req.user.role === 'admin' || roles.includes(req.user.role)) {
      next();
      return;
    }
    res.status(403).json({
      success: false,
      message: `Access denied. Required roles: ${roles.join(', ')}`,
    });
  };
};
