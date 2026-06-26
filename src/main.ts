import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common'; 
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 2. Aktifkan satpam penapis input secara global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Buang otomatis semua field ghaib yang tidak didefinisikan di DTO
      forbidNonWhitelisted: true, // Tolak request (400 Bad Request) jika klien nekat mengirim field terlarang
      transform: true, // Otomatis mengubah tipe data JSON mentah menjadi object instance DTO murni
    }),
  );
  app.use(cookieParser())

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();