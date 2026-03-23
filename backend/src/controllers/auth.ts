import bcrypt from 'bcryptjs';
import jwt, { SignOptions, Secret } from 'jsonwebtoken';
import crypto from 'crypto';
import { userModel, doctorModel, patientModel, refreshTokenModel } from '../models/index.js';
import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';

const JWT_SECRET: Secret = (process.env.JWT_SECRET || 'your_secret_key') as Secret;
const JWT_EXPIRE: SignOptions['expiresIn'] = (process.env.JWT_EXPIRE || '7d') as SignOptions['expiresIn'];
const REFRESH_EXPIRE: SignOptions['expiresIn'] = '30d';
const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '10');

interface RegisterUserData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
}

export const authController = {
  register: async (req: any, res: Response) => {
    try {
      const { email, password, firstName, lastName, role } = req.body as RegisterUserData;

      if (!email || !password || !firstName || !lastName || !role) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Check if user already exists
      const existingUser = await userModel.findByEmail(email);
      if (existingUser) {
        return res.status(409).json({ error: 'User already exists' });
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

      // Create user
      const user = await userModel.create(email, passwordHash, firstName, lastName, role);

      // Create role-specific profile
      if (role === 'doctor') {
        await doctorModel.create(user.id, req.body.specialization || 'General Practice');
      } else if (role === 'patient') {
        await patientModel.create(user.id);
      }

      // Generate tokens
      const accessToken = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRE }
      );

      const refreshToken = jwt.sign(
        { userId: user.id },
        JWT_SECRET,
        { expiresIn: REFRESH_EXPIRE }
      );

      // Hash and store refresh token
      const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
      await refreshTokenModel.create(user.id, refreshTokenHash, new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));

      res.status(201).json({
        message: 'User registered successfully',
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role,
        },
        accessToken,
        refreshToken,
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Registration failed' });
    }
  },

  login: async (req: any, res: Response) => {
    try {
      const { identifier, email, phone, password } = req.body;
      const loginIdentifier = identifier || email || phone;

      if (!loginIdentifier || !password) {
        return res.status(400).json({ error: 'Email/mobile and password required' });
      }

      // Find user
      const user = await userModel.findByEmailOrPhone(loginIdentifier);
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Verify password
      const passwordMatch = await bcrypt.compare(password, user.password_hash);
      if (!passwordMatch) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Check if user is active
      if (user.status !== 'active') {
        return res.status(403).json({ error: 'User account is not active' });
      }

      // Generate tokens
      const accessToken = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRE }
      );

      const refreshToken = jwt.sign(
        { userId: user.id },
        JWT_SECRET,
        { expiresIn: REFRESH_EXPIRE }
      );

      // Hash and store refresh token
      const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
      await refreshTokenModel.create(user.id, refreshTokenHash, new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));

      res.json({
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role,
          phone: user.phone,
        },
        accessToken,
        refreshToken,
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  },

  logout: async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.userId;
      if (userId) {
        await refreshTokenModel.deleteByUser(userId);
      }
      res.json({ message: 'Logout successful' });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ error: 'Logout failed' });
    }
  },

  refreshToken: async (req: any, res: Response) => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({ error: 'Refresh token required' });
      }

      // Verify refresh token
      const decoded = jwt.verify(refreshToken, JWT_SECRET) as any;
      const userId = decoded.userId;

      // Check if token is in database
      const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
      const storedToken = await refreshTokenModel.findByToken(refreshTokenHash);

      if (!storedToken) {
        return res.status(401).json({ error: 'Invalid refresh token' });
      }

      // Get user
      const user = await userModel.findById(userId);
      if (!user) {
        return res.status(401).json({ error: 'User not found' });
      }

      // Generate new access token
      const accessToken = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRE }
      );

      res.json({ accessToken });
    } catch (error) {
      console.error('Refresh token error:', error);
      res.status(401).json({ error: 'Token refresh failed' });
    }
  },

  me: async (req: AuthRequest, res: Response) => {
    try {
      const user = await userModel.findById(req.userId!);

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Get role-specific data
      let roleData: any = null;
      if (user.role === 'doctor') {
        roleData = await doctorModel.findByUserId(user.id);
      } else if (user.role === 'patient') {
        roleData = await patientModel.findByUserId(user.id);
      }

      res.json({
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role,
          phone: user.phone,
          status: user.status,
        },
        roleData,
      });
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ error: 'Failed to get user' });
    }
  },

  changePassword: async (req: AuthRequest, res: Response) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.userId!;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: 'Current password and new password required' });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ error: 'New password must be at least 6 characters' });
      }

      // Get user
      const user = await userModel.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Verify current password
      const passwordMatch = await bcrypt.compare(currentPassword, user.password_hash);
      if (!passwordMatch) {
        return res.status(401).json({ error: 'Current password is incorrect' });
      }

      // Hash new password
      const newPasswordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);

      // Update password in database
      await userModel.updatePassword(userId, newPasswordHash);

      // Invalidate all refresh tokens
      await refreshTokenModel.deleteByUser(userId);

      res.json({ message: 'Password changed successfully' });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({ error: 'Failed to change password' });
    }
  },
};
