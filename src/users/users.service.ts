import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../prisma.service'; // 1. Import jembatan database
import * as bcrypt from 'bcrypt'; 

@Injectable()
export class UsersService {
  // 2. Suntikkan PrismaService ke dalam dapur Users
  constructor(private readonly prisma: PrismaService) { }
  async create(createUserDto: CreateUserDto) {
    const { password, ...restData } = createUserDto;

    // 2. Acak password mentah menjadi hash kriptografi yang aman
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 3. Simpan data ke database dengan password yang sudah aman
    const user = await this.prisma.user.create({
      data: {
        ...restData,
        password: hashedPassword, // Ganti dengan versi ter-hash
      },
    });

    // Singkirkan dari respons objek agar aman
    const { password: _, ...safeUser } = user;

    return {
      status: 'success',
      message: 'User berhasil didaftarkan ke dalam database',
      data: safeUser,
    };
  }

  // 3. Ubah menjadi async untuk menarik data asli dari PostgreSQL
  async findAll() {
    // Memerintahkan database hanya mengirim kolom yang kita ijinkan saja
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
        // password: false <-- Tidak perlu ditulis, otomatis tidak akan ditarik jika tidak di-set true
      },
    });

    return {
      status: 'success',
      total: users.length,
      data: users,
    };
  }

  async findOne(id: string) {
    // Terapkan hal yang sama untuk pencarian user tunggal berdasarkan ID
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Antisipasi jika user tidak ditemukan di database
    if (!user) {
      return {
        status: 'error',
        message: 'User tidak ditemukan',
      };
    }

    return {
      status: 'success',
      data: user,
    };
  }

  update(id: string, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: string) {
    return `This action removes a #${id} user`;
  }
}