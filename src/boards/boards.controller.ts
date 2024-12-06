// src/boards/boards.controller.ts
import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { BoardsService } from './boards.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';  

@UseGuards(JwtAuthGuard) 
@Controller('boards')
export class BoardsController {
  constructor(private readonly boardsService: BoardsService) {}

  // Create a new board (Protected)
  @Post()
  create(@Body() createBoardDto: CreateBoardDto) {
    return this.boardsService.create(createBoardDto);
  }

  // Get all boards (protected)
  @Get()
  findAll() {
    return this.boardsService.findAll();
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
