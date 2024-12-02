import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { BoardsService } from './boards.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';

@Controller('boards')
export class BoardsController {
  constructor(private readonly boardsService: BoardsService) {}

  // Create a new board
  @Post()
  create(@Body() createBoardDto: CreateBoardDto) {
    return this.boardsService.create(createBoardDto);
  }

  // Get all boards
  @Get()
  findAll() {
    return this.boardsService.findAll();
  }

  // Get a single board by ID
  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.boardsService.findOne(id);
  }

  // Update a board by ID
  @Put(':id')
  update(@Param('id') id: number, @Body() updateBoardDto: UpdateBoardDto) {
    return this.boardsService.update(id, updateBoardDto);
  }

  // Delete a board by ID
  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.boardsService.remove(id);
  }
}
