import { Temporal } from 'temporal-polyfill';
(globalThis as any).Temporal = Temporal;
import express, { type Express, type Response } from 'express';
import cors from 'cors';
import { rateLimit } from 'express-rate-limit';
import authRouter from './modules/auth/auth.router';
import { errorHandler } from './middleware/errorHandler';
// import { authenticate } from './middleware/auth';


const app: Express = express();


const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  statusCode: 429,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 5, // Only 5 attempts allowed
  message: 'Too many login attempts. Please try again later.',
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(limiter);
app.use(cors());


app.get('/', (_req, res: Response) => {
  res.send('Hello, World!');
});

app.use('/api/auth', authLimiter, authRouter);
app.use(errorHandler);
export default app;
