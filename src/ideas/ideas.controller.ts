import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
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
  @Post('boards/:boardId/ideas') // Route for creating an idea
  create(
    @Param('boardId') boardId: number,
    @Body() createIdeaDto: CreateIdeaDto,
  ) {
    return this.ideasService.create(boardId, createIdeaDto);
  }

  // Update an idea by ID
  @Put('ideas/:id') // Route for updating an idea
  update(
    @Param('id') id: number,
    @Body() updateIdeaDto: UpdateIdeaDto,
  ) {
    return this.ideasService.update(id, updateIdeaDto);
  }

  // Delete an idea by ID
  @Delete('ideas/:id') // Route for deleting an idea
  remove(@Param('id') id: number) {
    return this.ideasService.remove(id);
  }
}
