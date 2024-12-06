// src/boards/dto/create-board.dto.ts
import { IsString, IsOptional, IsInt } from 'class-validator';

export class CreateBoardDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()  // Make userId optional
  @IsInt()
  userId?: number; // Optional userId for programmatic assignment
}
