//src\boards\boards.controller.ts

import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { BoardsService } from './boards.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';

@UseGuards(JwtAuthGuard)
@Controller('boards')
export class BoardsController {
  constructor(
    private readonly boardsService: BoardsService,
    private readonly prisma: PrismaService,
  ) {}

  // Create a new board (Protected)
  @Post()
  async create(
    @Body() createBoardDto: Omit<CreateBoardDto, 'userId'>,
    @Request() req,
  ) {
    const supabaseId = req.user.sub; // Get Supabase UID from token
    const user = await this.prisma.user.findUnique({
      where: { supabaseId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Pass the userId from the database to the service
    return this.boardsService.create({ ...createBoardDto, userId: user.id });
  }

  // Get all boards (protected)
  @Get()
  findAll() {
    return this.boardsService.findAll();
  }

  // Search boards by name or description
  @Get('search')
  async search(@Query('query') query: string) {
    return this.boardsService.search(query);
  }

  // Get a single board by ID (protected)
  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.boardsService.findOne(id);
  }

  // Update a board by ID (protected)
  @Put(':id')
  update(@Param('id') id: number, @Body() updateBoardDto: UpdateBoardDto) {
    return this.boardsService.update(id, updateBoardDto);
  }

  // Delete a board by ID (Protected)
  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.boardsService.remove(id);
  }
}
