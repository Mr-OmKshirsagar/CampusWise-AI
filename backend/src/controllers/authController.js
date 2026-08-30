import { AuthService } from '../services/authService.js';

export class AuthController {
  /**
   * POST /api/auth/register
   */
  static async register(req, res, next) {
    try {
      const { name, email, password, role } = req.body;
      const result = await AuthService.register({ name, email, password, role });
      return res.status(201).json({
        success: true,
        message: 'Account registered successfully.',
        data: result,
      });
    } catch (err) {
      const statusCode = err.statusCode || 400;
      return res.status(statusCode).json({
        success: false,
        error: err.message || 'Registration failed.',
      });
    }
  }

  /**
   * POST /api/auth/login
   */
  static async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await AuthService.login({ email, password });
      return res.status(200).json({
        success: true,
        message: 'Login successful.',
        data: result,
      });
    } catch (err) {
      const statusCode = err.statusCode || 401;
      return res.status(statusCode).json({
        success: false,
        error: err.message || 'Invalid credentials.',
      });
    }
  }

  /**
   * GET /api/auth/me
   */
  static async getMe(req, res, next) {
    try {
      const profile = await AuthService.getProfile(req.user.id);
      return res.status(200).json({
        success: true,
        data: {
          user: profile,
        },
      });
    } catch (err) {
      const statusCode = err.statusCode || 404;
      return res.status(statusCode).json({
        success: false,
        error: err.message || 'User profile not found.',
      });
    }
  }
}
