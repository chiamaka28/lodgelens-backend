import { Router } from 'express';
import { AuthController } from './auth.controller';
import { loginRequestValidator, registerUserValidator } from './auth.validator'


const authRouter: Router = Router();
const authController = new AuthController();

authRouter.post(
  '/register',
  registerUserValidator,
  authController.register.bind(authController),
);

authRouter.post(
  '/login',
  loginRequestValidator,
  authController.login.bind(authController),
);

authRouter.post(
  '/refresh', 
  authController.refreshToken.bind(authController),
)

authRouter.post(
  '/logout', 
  authController.logout.bind(authController),
)

export default authRouter;