import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { IdeasService } from './ideas.service';
import { CreateIdeaDto } from './dto/create-idea.dto';
import { UpdateIdeaDto } from './dto/update-idea.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard) // Apply guard to all routes in this controller
@Controller()
export class IdeasController {
  constructor(private readonly ideasService: IdeasService) {}

  // Get all ideas for a board
  @Get('boards/:boardId/ideas') // Route for getting ideas
  async findAll(@Param('boardId') boardId: number) {
    return this.ideasService.findAll(boardId);
  }

  // Create a new idea in a board
  @Post('boards/:boardId/ideas')
  async create(
    @Param('boardId') boardId: number,
    @Body() createIdeaDto: CreateIdeaDto,
  ) {
    return this.ideasService.create(boardId, createIdeaDto);
  }

  // Update an idea by ID
  @Put('ideas/:id')
  async update(@Param('id') id: number, @Body() updateIdeaDto: UpdateIdeaDto) {
    return this.ideasService.update(id, updateIdeaDto);
  }

  // Delete an idea by ID
  @Delete('ideas/:id')
  async remove(@Param('id') id: number) {
    return this.ideasService.remove(id);
  }

  // New route for fetching the leaderboard for a board
  @Get('boards/:boardId/ideas/leaderboard')
  async getLeaderboard(@Param('boardId') boardId: number) {
    return this.ideasService.getLeaderboard(boardId);
  }

  // New route for searching ideas by title or description
  @Get('boards/:boardId/ideas/search')
  async search(
    @Param('boardId') boardId: number,
    @Query('query') query: string,
  ) {
    return this.ideasService.search(boardId, query);
  }
}
