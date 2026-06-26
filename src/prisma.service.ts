import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config'; // Paksa NestJS membaca file .env seketika

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    // 1. Buat jembatan koneksi native PostgreSQL
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });

    // 2. Bungkus ke dalam Prisma Adapter
    const adapter = new PrismaPg(pool);

    // 3. Suntikkan adapter ke class induk (PrismaClient)
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }
}