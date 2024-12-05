import { IsString, IsOptional, IsInt } from 'class-validator';
export class CreateBoardDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsInt()
  userId: number; // Add userId or user object to match the Prisma schema
}