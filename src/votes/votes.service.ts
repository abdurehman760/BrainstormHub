import { Injectable } from '@nestjs/common';
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
      throw new Error('User not found');
    }

    // Validate the vote value to ensure it's -1 or 1
    if (value !== 1 && value !== -1) {
      throw new Error(
        'Invalid vote value. Please use 1 for upvote or -1 for downvote.',
      );
    }

    // Fetch the idea details to include the title in the message
    const idea = await this.prisma.idea.findUnique({
      where: { id: Number(ideaId) },
      include: {
        board: true, // Includes the board information for the idea
      },
    });

    if (!idea) {
      // If the idea is not found, return a user-friendly warning message instead of server error
      return {
        message: 'Idea not found. Please check the idea ID and try again.',
        success: false,
      };
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

    // Emit activity message with idea title and board title
    if (existingVote) {
      // If a vote already exists, update the existing vote
      await this.prisma.vote.update({
        where: { id: existingVote.id },
        data: { value },
      });

      // Send activity feed notification for updated vote
      this.activityGateway.sendActivity(
        `${user.username} updated their vote on the idea: "${idea?.title}" to ${value === 1 ? 'upvote' : 'downvote'} in board: "${idea?.board.title}"`,
      );

      return {
        message: 'Vote updated',
        ideaId: Number(ideaId),
        newValue: value,
        success: true,
      }; // Include updated details
    } else {
      // If no vote exists, create a new vote record
      await this.prisma.vote.create({
        data: {
          value,
          idea: {
            connect: { id: Number(ideaId) }, // Connect the vote to the idea
          },
          user: {
            connect: { id: user.id }, // Connect the vote to the user
          },
        },
      });

      // Send activity feed notification for new vote
      this.activityGateway.sendActivity(
        `${user.username} voted on the idea: "${idea?.title}" with a ${value === 1 ? 'upvote' : 'downvote'} in board: "${idea?.board.title}"`,
      );

      return {
        message: 'Vote added',
        ideaId: Number(ideaId),
        voteValue: value,
        success: true,
      }; // Include added details
    }
  }
}
