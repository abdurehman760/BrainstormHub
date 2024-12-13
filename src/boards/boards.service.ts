import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { ActivityGateway } from '../activity/activity.gateway';
@Injectable()
export class BoardsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly activityGateway: ActivityGateway,
  ) {}

  // Create a new board
  async create(createBoardDto: CreateBoardDto) {
    const { userId, ...boardData } = createBoardDto;

    const newBoard = await this.prisma.board.create({
      data: {
        ...boardData,
        user: {
          connect: { id: userId },
        },
      },
    });

    // Emit a notification for board creation with dynamic activity
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    this.activityGateway.sendActivity(
      `${user?.username} created a new board: ${newBoard.title}`,
    );

    return newBoard;
  }

  // Get all boards
  async findAll() {
    return this.prisma.board.findMany();
  }

  // Search boards by name or description
  async search(query: string) {
    return this.prisma.board.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
      },
    });
  }

  // Get a single board by ID
  async findOne(id: number) {
    return this.prisma.board.findUnique({
      where: { id: Number(id) },
    });
  }

  // Update a board by ID
 // Update a board by ID
async update(id: number, updateBoardDto: UpdateBoardDto) {
  // Check if the board exists before updating
  const existingBoard = await this.prisma.board.findUnique({
    where: { id: Number(id) },
  });

  if (!existingBoard) {
    throw new NotFoundException(`Board with ID ${id} not found`);
  }

  // Proceed with the update if the board exists
  const updatedBoard = await this.prisma.board.update({
    where: { id: Number(id) },
    data: updateBoardDto,
  });

  // Emit a notification for board update
  const user = await this.prisma.user.findUnique({
    where: { id: updatedBoard.userId },
  });

  this.activityGateway.sendActivity(
    `${user?.username} updated board: ${updatedBoard.title}`,
  );

  return updatedBoard;
}

  // Delete a board by ID
  async remove(id: number) {
    try {
      const deletedBoard = await this.prisma.board.delete({
        where: { id: Number(id) },
      });
  
      // Emit a notification for board deletion with dynamic activity
      const user = await this.prisma.user.findUnique({
        where: { id: deletedBoard.userId },
      });
  
      this.activityGateway.sendActivity(
        `${user?.username} deleted board: ${deletedBoard.title}`,
      );
  
      return deletedBoard;
    } catch (error) {
      if (error.code === 'P2025') {
        // Prisma error code for "Record not found"
        throw new NotFoundException(`Board with ID ${id} not found`);
      } else if (error.code === 'P2003') {
        // Prisma error code for "Foreign key constraint failed"
        throw new BadRequestException(
          `Cannot delete board with ID ${id} because it is referenced by other records`,
        );
      }
      throw error;
    }
  }
}
