import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; 
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';

@Injectable()
export class BoardsService {
  constructor(private readonly prisma: PrismaService) {}

  // Create a new board
  async create(createBoardDto: CreateBoardDto) {
    return this.prisma.board.create({
      data: createBoardDto, // Using the DTO to create the board
    });
  }

  // Get all boards
  async findAll() {
    return this.prisma.board.findMany(); // Fetch all boards
  }

  // Get a single board by ID
  async findOne(id: number) {
    return this.prisma.board.findUnique({
      where: { id }, // Fetch a specific board by its ID
    });
  }

  // Update a board by ID
  async update(id: number, updateBoardDto: UpdateBoardDto) {
    return this.prisma.board.update({
      where: { id },
      data: updateBoardDto, // Update the board with new data
    });
  }

  // Delete a board by ID
  async remove(id: number) {
    return this.prisma.board.delete({
      where: { id }, // Delete the board by its ID
    });
  }
}
