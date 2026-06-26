import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class JwtGuard implements CanActivate {
  constructor(private jwtService: JwtService) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Akses ditolak: Token tidak ditemukan');
    }

    try {
      // Verifikasi token. Jika gagal (palsu/expired), akan otomatis masuk ke blok catch
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET ?? 'SUPER_SECRET_KEY_UNTUK_SIGNING_JWT_123',
      });

      // Sisipkan data payload (sub/id dan email) ke dalam object request
      // agar bisa dibaca oleh Controller jika diperlukan
      request['user'] = payload;
    } catch {
      throw new UnauthorizedException('Akses ditolak: Token tidak valid atau sudah kedaluwarsa');
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    // Memecah header "Bearer eyJhbG..." menjadi array ['Bearer', 'eyJhbG...']
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}