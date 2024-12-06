import { Controller, Get, Post, Body, Param, Request, UseGuards } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service'; // Import Prisma service

@UseGuards(JwtAuthGuard) // Protect the endpoints
@Controller('ideas')
export class CommentsController {
  constructor(
    private readonly commentsService: CommentsService,
    private readonly prisma: PrismaService // Inject Prisma service
  ) {}

  // Add a comment to an idea (Protected)
  @Post(':ideaId/comments')
  async create(
    @Param('ideaId') ideaId: number,
    @Body() createCommentDto: CreateCommentDto,
    @Request() req
  ) {
    const supabaseId = req.user.sub; // Get Supabase UID from token
    const user = await this.prisma.user.findUnique({
      where: { supabaseId },
    });

    if (!user) {
      throw new Error('User not found'); // Handle user not found error
    }

    // Pass the userId, ideaId, and content separately
    return this.commentsService.create(createCommentDto.content, ideaId, user.id);
  }

  // Get all comments for an idea (Protected)
  @Get(':ideaId/comments')
  async findAll(@Param('ideaId') ideaId: number) {
    return this.commentsService.findAll(ideaId); // Retrieve comments for the given idea
  }
}
