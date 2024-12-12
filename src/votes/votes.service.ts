import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityGateway } from '../activity/activity.gateway';

@Injectable()
export class VotesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly activityGateway: ActivityGateway,
  ) {}

  // Function to vote on an idea
  async voteOnIdea(ideaId: string, value: number, supabaseId: string) {
    const user = await this.prisma.user.findUnique({
      where: { supabaseId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Validate the vote value to ensure it's -1 or 1
    if (value !== 1 && value !== -1) {
      throw new BadRequestException(
        'Invalid vote value. Please use 1 for upvote or -1 for downvote.',
      );
    }

    // Fetch the idea details
    const idea = await this.prisma.idea.findUnique({
      where: { id: Number(ideaId) },
      include: {
        board: true, // Includes the board information for the idea
      },
    });

    if (!idea) {
      throw new NotFoundException('Idea not found. Please check the idea ID and try again.');
    }

    // Check if the user has already voted on the idea
    const existingVote = await this.prisma.vote.findUnique({
      where: {
        userId_ideaId: {
          userId: user.id,
          ideaId: Number(ideaId),
        },
      },
    });

    // Handle vote updates or creation
    if (existingVote) {
      await this.prisma.vote.update({
        where: { id: existingVote.id },
        data: { value },
      });

      this.activityGateway.sendActivity(
        `${user.username} updated their vote on the idea: "${idea?.title}" to ${
          value === 1 ? 'upvote' : 'downvote'
        } in board: "${idea?.board.title}"`,
      );

      return {
        message: 'Vote updated',
        ideaId: Number(ideaId),
        newValue: value,
        success: true,
      };
    } else {
      await this.prisma.vote.create({
        data: {
          value,
          idea: { connect: { id: Number(ideaId) } },
          user: { connect: { id: user.id } },
        },
      });

      this.activityGateway.sendActivity(
        `${user.username} voted on the idea: "${idea?.title}" with a ${
          value === 1 ? 'upvote' : 'downvote'
        } in board: "${idea?.board.title}"`,
      );

      return {
        message: 'Vote added',
        ideaId: Number(ideaId),
        voteValue: value,
        success: true,
      };
    }
  }
}
