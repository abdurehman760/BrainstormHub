import { Injectable } from '@nestjs/common';
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

    // Fetch the idea details to include the title in the message
    const idea = await this.prisma.idea.findUnique({
      where: { id: parsedIdeaId },
      include: {
        board: true, // Include the board information for the idea
      },
    });

    // Fetch the user details to include the username
    const user = await this.prisma.user.findUnique({
      where: { id: parsedUserId },
    });

    // Emit activity message with idea title and board title
    this.activityGateway.sendActivity(
      `${user?.username} commented on the idea: "${idea?.title}" with comment: "${newComment.content}" in board: "${idea?.board.title}"`,
    );

    return newComment;
  }

  // Get comments for an idea
  async findAll(ideaId: number) {
    const parsedIdeaId = parseInt(ideaId.toString(), 10);
    return this.prisma.comment.findMany({
      where: {
        ideaId: parsedIdeaId,
      },
      orderBy: {
        createdAt: 'desc', // Order by latest comment first
      },
    });
  }
}
