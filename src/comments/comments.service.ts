import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityGateway } from '../activity/activity.gateway';

@Injectable()
export class CommentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly activityGateway: ActivityGateway,
  ) {}

  // Add a comment to an idea
  async create(content: string, ideaId: number, userId: number) {
    const parsedIdeaId = parseInt(ideaId.toString(), 10);
    const parsedUserId = parseInt(userId.toString(), 10);

    // Check if the Idea exists before creating the comment
    const idea = await this.prisma.idea.findUnique({
      where: { id: parsedIdeaId },
      include: {
        board: true, // Include the board information for the idea
      },
    });

    if (!idea) {
      throw new NotFoundException('Idea not found');
    }

    // Check if the User exists (optional)
    const user = await this.prisma.user.findUnique({
      where: { id: parsedUserId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Create the comment in the database
    const newComment = await this.prisma.comment.create({
      data: {
        content,
        idea: {
          connect: {
            id: parsedIdeaId,
          },
        },
        user: {
          connect: {
            id: parsedUserId,
          },
        },
      },
    });

    // Emit activity message with the board information
    this.activityGateway.sendActivity(
      `${user.username} commented on the idea: "${idea.title}" with comment: "${newComment.content}" in board: "${idea.board.title}"`,
    );

    return newComment;
  }

  // Get comments for an idea
  async findAll(ideaId: number) {
    // Ensure ideaId is parsed as an integer
    const parsedIdeaId = parseInt(ideaId.toString(), 10);

    // Validate ideaId
    if (isNaN(parsedIdeaId)) {
      throw new NotFoundException('Idea not found');
    }

    const idea = await this.prisma.idea.findUnique({
      where: { id: parsedIdeaId },
    });

    if (!idea) {
      throw new NotFoundException('Idea not found');
    }

    return this.prisma.comment.findMany({
      where: { ideaId: parsedIdeaId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
