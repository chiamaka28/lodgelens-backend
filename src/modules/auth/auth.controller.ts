import type { Request, Response } from "express";
import * as AuthService from "./auth.service";

const ALLOWED_REGISTER_ROLES = ["STUDENT", "LODGE_OWNER"] as const;

export class AuthController {

    async register(req: Request, res: Response) {
       const { firstname, lastname, email, password, role } = req.body;

       
       if (!ALLOWED_REGISTER_ROLES.includes(role)) {
         return res.status(400).json({
           success: false,
           message: 'Role must be STUDENT or LODGE_OWNER',
         });
       }

       try {
         const result = await AuthService.register({
            firstname,
            lastname,
            email,
            password,
            role,
         });
          res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: result,
      });

       } catch (error : any) {
        console.error(error.message || error);
        switch (error.status) {
         case 400:
         res
         .status(400)
         .json({
            success: false,
            message: error.message || 'Bad Request',
         });
         break;
         default:
         res.
         status(500)
         .json({
            success: false,
            message:  'Internal Server Error',
         });
        }
       }
    }

  async login(req: Request, res: Response) {
    const { email, password } = req.body;

    try {
      const result = await AuthService.login({ email, password });

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: result,
      });
    } catch (error: any) {
      console.error(error.message || error);
      switch (error.status) {
        case 400:
          res
            .status(400)
            .json({ success: false, message: error.message || 'Bad Request' });
          break;
        case 401:
          res
            .status(401)
            .json({ success: false, message: error.message || 'Invalid email or password' });
          break;
        default:
          res
            .status(500)
            .json({ success: false, message: 'Internal Server Error' });
      }
    }
  }

  async refreshToken(req: Request, res: Response) {
    const { refreshToken } = req.body;
    try {
      const result = await AuthService.refreshToken(refreshToken);

      res.status(200).json({
        success: true,
        message: 'Token refreshed successfully',
        data: result,
      });
    } catch (error: any) {
      console.log(error.message || error);
      switch (error.status) {
        case 400:
          res
            .status(400)
            .json({ success: false, message: error.message || 'Bad Request' });
          break;
        default:
          res
            .status(500)
            .json({ success: false, message: 'Internal Server Error' });
      }

    }
  }


  async logout(req: Request, res: Response) {
    const { refreshToken } = req.body;


    if (!refreshToken) {
      res.status(200).json({ message: "Logged out successfully" });
      return;
    }

    try {

      await AuthService.logout(refreshToken);

      res.status(200).json({ message: "Logged out successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
}