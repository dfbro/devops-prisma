import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
    ) { }

    async login(loginDto: LoginDto) {
        const { email, password } = loginDto;

        const user = await this.prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            throw new UnauthorizedException('Email atau password salah');
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            throw new UnauthorizedException('Email atau password salah');
        }

        const accessToken = await this.jwtService.signAsync({
            sub: user.id,
            email: user.email,
        });

        const refreshToken = await this.jwtService.signAsync(
            { sub: user.id },
            { expiresIn: '7d' },
        );

        return {
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
            },
        };
    }

    async refreshTokens(refreshToken: string) {
        try {
            // 1. Validasi token jangka panjang tersebut
            const payload = await this.jwtService.verifyAsync(refreshToken, {
                secret: process.env.JWT_SECRET ?? 'SUPER_SECRET_KEY_UNTUK_SIGNING_JWT_123',
            });

            // 2. Ambil user terbaru dari database berdasarkan payload.sub (ID)
            const user = await this.prisma.user.findUnique({
                where: { id: payload.sub },
            });

            if (!user) {
                throw new UnauthorizedException('Sesi tidak valid: User tidak ditemukan');
            }

            // 3. Cetak Access Token baru berumur pendek (15 menit)
            const newAccessToken = await this.jwtService.signAsync({
                sub: user.id,
                email: user.email,
            });

            return {
                accessToken: newAccessToken,
            };
        } catch {
            // Jika token kedaluwarsa atau tandatangannya dimanipulasi
            throw new UnauthorizedException('Sesi telah berakhir, silakan login ulang');
        }
    }
}