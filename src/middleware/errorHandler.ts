// src/middleware/errorHandler.ts
import type{ Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';

export function errorHandler(
    err: any,
    _req: Request,
    res: Response,
    _next: NextFunction  
) {
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
        });
    }

    console.error(err);   
    res.status(500).json({ success: false, message: 'Internal Server Error' });
}