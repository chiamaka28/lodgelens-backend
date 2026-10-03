import type { NextFunction, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';

export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const mapped = errors.mapped();
    const errorList = Object.entries(mapped).map(([field, err]) => ({
      field: field ?? 'unknown',
      message: typeof err.msg === 'string' ? err.msg : String(err.msg),
    }));

    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errorList,
    });
  }
  next();
};

const registerUserValidator = [
  body('firstname')
    .notEmpty()
    .withMessage('First Name is required')
    .isString()
    .withMessage('First Name must be a string'),
  body('lastname')
    .notEmpty()
    .withMessage('Last name is required')
    .isString()
    .withMessage('Last Name must be a string'),
  body('email')
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email format'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  handleValidationErrors,
];

const loginRequestValidator = [
  body('email')
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email format'),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidationErrors,
];

export { registerUserValidator, loginRequestValidator };
