import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/index.js';
import { env } from '../config/env.js';

export class AuthService {
  /**
   * Generates a signed JWT for an authenticated user
   */
  static generateToken(user) {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      env.jwt.secret,
      { expiresIn: env.jwt.expiresIn }
    );
  }

  /**
   * Verifies and decodes a JWT token
   */
  static verifyToken(token) {
    try {
      return jwt.verify(token, env.jwt.secret);
    } catch (err) {
      throw new Error('Invalid or expired authentication token.');
    }
  }

  /**
   * Registers a new user (Student or Admin)
   */
  static async register({ name, email, password, role = 'student' }) {
    if (!name || !email || !password) {
      throw new Error('Name, email, and password are required.');
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await UserModel.findByEmail(normalizedEmail);
    if (existingUser) {
      const error = new Error('An account with this email already exists.');
      error.statusCode = 400;
      throw error;
    }

    // Role validation
    const validRoles = ['student', 'admin'];
    const userRole = validRoles.includes(role) ? role : 'student';

    // Hash password with bcrypt cost factor 12
    const hashedPassword = await bcrypt.hash(password, env.jwt.saltRounds);

    const user = await UserModel.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: userRole,
    });

    const token = this.generateToken(user);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        created_at: user.created_at,
      },
      token,
    };
  }

  /**
   * Authenticates user with email and password
   */
  static async login({ email, password }) {
    if (!email || !password) {
      const error = new Error('Email and password are required.');
      error.statusCode = 400;
      throw error;
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await UserModel.findByEmail(normalizedEmail);

    if (!user) {
      const error = new Error('Invalid email or password.');
      error.statusCode = 401;
      throw error;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      const error = new Error('Invalid email or password.');
      error.statusCode = 401;
      throw error;
    }

    const token = this.generateToken(user);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        created_at: user.created_at,
      },
      token,
    };
  }

  /**
   * Retrieves profile for an authenticated user by ID
   */
  static async getProfile(userId) {
    const user = await UserModel.findById(userId);
    if (!user) {
      const error = new Error('User not found.');
      error.statusCode = 404;
      throw error;
    }
    return user;
  }
}
