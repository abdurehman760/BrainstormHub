import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { IdeasService } from './ideas.service';
import { CreateIdeaDto } from './dto/create-idea.dto';
import { UpdateIdeaDto } from './dto/update-idea.dto';

@Controller() // Don't specify a base route for this controller
export class IdeasController {
  constructor(private readonly ideasService: IdeasService) {}

  // Get all ideas for a board
  @Get('boards/:boardId/ideas') // Keep this URL as is
  async findAll(@Param('boardId') boardId: number) {
    return this.ideasService.findAll(boardId);
  }

  // Create a new idea in a board
  @Post('boards/:boardId/ideas') // Keep this URL as is
  create(
    @Param('boardId') boardId: number,
    @Body() createIdeaDto: CreateIdeaDto
  ) {
    return this.ideasService.create(boardId, createIdeaDto);
  }

  // Update an idea by ID
  @Put('ideas/:id') // Use this format for PUT
  update(
    @Param('id') id: number,
    @Body() updateIdeaDto: UpdateIdeaDto
  ) {
    return this.ideasService.update(id, updateIdeaDto);
  }

  // Delete an idea by ID
  @Delete('ideas/:id') // Use this format for DELETE
  remove(@Param('id') id: number) {
    return this.ideasService.remove(id);
  }
}
