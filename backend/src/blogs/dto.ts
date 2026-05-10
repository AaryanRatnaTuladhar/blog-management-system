import { Transform } from 'class-transformer';
import { IsOptional, IsString, MinLength } from 'class-validator';

function trimString({ value }: { value: unknown }) {
  return typeof value === 'string' ? value.trim() : value;
}

export class CreateBlogDto {
  @Transform(trimString)
  @IsString()
  @MinLength(3, { message: 'title must be at least 3 characters' })
  title: string;

  @Transform(trimString)
  @IsString()
  @MinLength(10, { message: 'content must be at least 10 characters' })
  content: string;
}

export class UpdateBlogDto {
  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MinLength(3, { message: 'title must be at least 3 characters' })
  title?: string;

  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MinLength(10, { message: 'content must be at least 10 characters' })
  content?: string;
}
