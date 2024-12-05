import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; 
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';

@Injectable()
export class BoardsService {
  constructor(private readonly prisma: PrismaService) {}

  // Create a new board
  async create(createBoardDto: CreateBoardDto) {
    const { userId, ...boardData } = createBoardDto; // Destructure to get userId

    return this.prisma.board.create({
      data: {
        ...boardData,
        user: {
          connect: { id: userId }, // Connect the board to the user by userId
        },
      },
    });
  }

  // Get all boards
  async findAll() {
    return this.prisma.board.findMany(); // Fetch all boards
  }

  // Get a single board by ID
  async findOne(id: number) {
    return this.prisma.board.findUnique({
      where: {
        id: Number(id), // Convert id to a number
      },
    });
  }

  // Update a board by ID
  async update(id: number, updateBoardDto: UpdateBoardDto) {
    return this.prisma.board.update({
      where: { id: Number(id) }, // Ensure id is a number
      data: updateBoardDto, // Spread the update data
    });
  }

  // Delete a board by ID
  async remove(id: number) {
    return this.prisma.board.delete({
      where: { id: Number(id) }, // Convert to number
    });
  }
}
