/**
 * Authentication Controller
 * 
 * Handles user authentication operations including registration and login.
 */

import { Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import User from '../models/User';

/**
 * POST /auth/register
 * Register a new user
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ error: 'User already exists' });
      return;
    }

    const user = new User({
      email,
      passwordHash: password, // Will be hashed by pre-save hook
      role: role || 'operator',
    });

    await user.save();

    const jwtSecret = process.env.JWT_SECRET || 'default-secret';
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      jwtSecret
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error('Register error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * POST /auth/login
 * Login user
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const jwtSecret = process.env.JWT_SECRET || 'default-secret';
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      jwtSecret
    );

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message });
  }
};
