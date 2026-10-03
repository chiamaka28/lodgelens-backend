import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { db } from "@/prisma/db";
import { AuthMapper } from './auth.dto';
import type { STATUS } from './auth.dto';
import type {
  LoginRequestDto,
  LoginResponseDto,
  RegisterRequestDto,
  RegisterResponseDto,
} from './auth.dto';
import { AppError } from '@/errors/AppError';
import { Temporal } from 'temporal-polyfill';


export async function register({
    firstname,
    lastname,
    email,
    password,
    role
}: RegisterRequestDto): Promise<RegisterResponseDto> {
    const existingUser = await db.orm.public.User
    .where({ email })
    .first();
 
    if (existingUser) {
        throw new AppError(401, 'Email is already in use');
    }
 
    const hashedPassword = await bcrypt.hash(password, 10);
 
  
    const status: STATUS = role === "LODGE_OWNER" ? "PENDING" : "APPROVED";
 
    const user = await db.orm.public.User.create({
      firstname,
      lastname,
      email,
      password: hashedPassword,
      role,
      status
    });
 
    return AuthMapper.toRegisterResponseDto(user);
}

export async function login({
    email,
    password
}: LoginRequestDto): Promise<LoginResponseDto> {
    const user = await db.orm.public.User.where({ email }).first();

    if (!user) {
        throw new AppError(401, 'Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user!.password);
    if (!isPasswordValid) {
         throw new AppError(401, 'Invalid email or password');
    }
     
      const payload = {
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status,
    }

    const accessToken = jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '15m'});
    const refreshToken = jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '7d'});

    await db.orm.public.RefreshToken.create({
            id: crypto.randomUUID(),
            token: refreshToken,
            userId: user.id,
            expiresAt: Temporal.Now.instant().add({ hours: 7 * 24 })
    });

    return AuthMapper.toLoginResponseDto(user, accessToken, refreshToken);

}



export async function refreshToken(refreshToken: string): Promise<string> {
  try {
     
      const decoded = jwt.verify(
        refreshToken, 
        process.env.JWT_REFRESH_SECRET as string
      ) as { id: number; email: string };
      
      
      const storedToken = await db.orm.public.RefreshToken.where({
    token: refreshToken,
    userId: decoded.id,
    expiresAt: { gt: Temporal.Now.instant() }
}).first();

if (!storedToken) {
  throw new Error("Invalid or expired refresh token");
}
      
      
      const payload = { id: decoded.id, email: decoded.email };
      const newAccessToken = jwt.sign(
        payload, 
        process.env.JWT_SECRET as string, 
        { expiresIn: '15m' }
      );
      
      return newAccessToken;
      
    } catch (error: any) {
     
      throw new Error("Invalid or expired refresh token");
    }
}


export async function logout(refreshToken: string): Promise<void> {
 try {
      await db.orm.public.RefreshToken.where({
        token: refreshToken 
      }).deleteAll();
    } catch (error: any) {
      throw new Error(error.message || "Logout failed");
    }

}