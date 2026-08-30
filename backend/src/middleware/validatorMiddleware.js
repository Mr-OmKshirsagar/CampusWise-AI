import { body, param, validationResult } from 'express-validator';

/**
 * Checks validation results and returns 400 Bad Request if errors exist
 */
export function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: errors.array()[0].msg,
      errors: errors.array().map(err => ({
        field: err.path || err.param,
        message: err.msg,
      })),
    });
  }
  next();
}

/**
 * Validation rules for user registration
 */
export const registerValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Full name is required.')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters.'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required.')
    .isEmail()
    .withMessage('Please provide a valid email address.')
    .normalizeEmail(),
  body('password')
    .trim()
    .notEmpty()
    .withMessage('Password is required.')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long.'),
  body('role')
    .optional()
    .isIn(['student', 'admin'])
    .withMessage("Role must be either 'student' or 'admin'."),
  handleValidationErrors,
];

/**
 * Validation rules for user login
 */
export const loginValidator = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required.')
    .isEmail()
    .withMessage('Please provide a valid email address.')
    .normalizeEmail(),
  body('password')
    .trim()
    .notEmpty()
    .withMessage('Password is required.'),
  handleValidationErrors,
];

/**
 * Validation rules for chat query
 */
export const chatQueryValidator = [
  param('id')
    .trim()
    .notEmpty()
    .withMessage('Conversation ID is required.'),
  body('query')
    .trim()
    .notEmpty()
    .withMessage('Query text cannot be empty.')
    .isLength({ min: 2, max: 2000 })
    .withMessage('Query must be between 2 and 2000 characters.'),
  handleValidationErrors,
];

/**
 * Validation rules for conversation creation
 */
export const createConversationValidator = [
  body('title')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters.'),
  handleValidationErrors,
];
