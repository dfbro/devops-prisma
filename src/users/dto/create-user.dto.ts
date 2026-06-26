import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
    @IsEmail({}, { message: 'Format email tidak valid' })
    @IsNotEmpty({ message: 'Email wajib diisi' })
    email!: string;

    @IsString({ message: 'Nama harus berupa text' })
    @IsNotEmpty({ message: 'Nama wajib diisi' })
    name!: string;

    @IsString()
    @IsNotEmpty({ message: 'Password wajib diisi' })
    @MinLength(8, { message: 'Password minimal harus 8 karakter' })
    password!: string;
}