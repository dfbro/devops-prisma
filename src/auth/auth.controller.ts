import { Controller, Post, Body, Res, Req, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { type Response, type Request } from 'express';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('login')
    async login(
        @Body() loginDto: LoginDto,
        @Res({ passthrough: true }) response: Response,
    ) {
        const result = await this.authService.login(loginDto);

        response.cookie('refresh_token', result.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return {
            status: 'success',
            message: 'Login berhasil',
            accessToken: result.accessToken,
        };
    }

    @Post('refresh')
    async refresh(
        @Req() request: Request,
    ) {
        // Ambil cookie refresh_token yang sudah diparsing oleh cookie-parser
        const refreshToken = request.cookies['refresh_token'];

        if (!refreshToken) {
            throw new UnauthorizedException('Sesi tidak ditemukan');
        }

        // Eksekusi penukaran token
        const result = await this.authService.refreshTokens(refreshToken);

        return {
            status: 'success',
            accessToken: result.accessToken,
        };
    }
}