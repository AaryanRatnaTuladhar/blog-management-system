import { Transform } from 'class-transformer';
import { IsEmail, IsString, MinLength } from 'class-validator';

function trim({ value }: { value: unknown }) {
  return typeof value === 'string' ? value.trim() : value;
}

export class RegisterDto {
  @Transform(trim)
  @IsEmail()
  email: string;

  @Transform(trim)
  @IsString()
  @MinLength(6, { message: 'password must be at least 6 characters' })
  password: string;
}

export class LoginDto extends RegisterDto {}
