import type { Models } from '@/prisma/contract.d';

export type User = Models.public_User;

export type ROLE = 'STUDENT' | 'LODGE_OWNER' | 'ADMIN';
export type STATUS= 'PENDING' | 'APPROVED' | 'SUSPENDED';

interface UserRow {
    id: number;
    firstname: string;
    lastname: string;
    email: string;
    role: ROLE;
    status: STATUS;

}


interface RegisterRequestDto {
    firstname: string;
    lastname: string;
    email: string;
    password: string;
    role: "STUDENT" | "LODGE_OWNER";
}

interface RegisterResponseDto{
    id: number;
    firstname: string;
    lastname: string;
    email: string;
    role: ROLE;
    status: STATUS;
}

interface LoginRequestDto {
    email: string;
    password: string;
    selectedPortal?: "STUDENT" | "LODGE_OWNER";

}

interface LoginResponseDto{
    accessToken: string;
    refreshToken: string;
    user: {
        id: number;
        firstname: string;
        lastname: string;
        email: string;
        role: ROLE; 
        status: STATUS;
    }
}

class AuthMapper {
    static toRegisterResponseDto(user: UserRow): RegisterResponseDto {
        return {
            id: user.id,
            firstname: user.firstname,
            lastname: user.lastname,
            email: user.email,
            role: user.role,
            status: user.status
        };
    }

    static toLoginResponseDto(
        user: UserRow,
        accessToken: string,
        refreshToken: string
    ): LoginResponseDto {
        return {
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                firstname: user.firstname,
                lastname: user.lastname,
                email: user.email,
                role: user.role,
                status: user.status,
            },
        };
    }
}

export type{
    RegisterRequestDto,
    RegisterResponseDto,
    LoginRequestDto,
    LoginResponseDto
};
export {AuthMapper}