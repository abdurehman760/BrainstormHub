// src/boards/dto/create-board.dto.ts
import { IsString, IsOptional, IsInt } from 'class-validator';

export class CreateBoardDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional() 
  @IsInt()
  userId?: number; 
}
