import { Module, Global } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';

@Global() // 1. Tambahkan dekorator Global agar semua modul langsung bisa mendeteksinya
@Module({
  imports: [UsersModule, AuthModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
  exports: [PrismaService], // 2. Ekspor PrismaService ke luar gedung pusat
})
export class AppModule { }