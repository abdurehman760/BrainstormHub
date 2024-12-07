import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class VotesService {
  constructor(private readonly prisma: PrismaService) {}

  async voteOnIdea(ideaId: string, value: number, supabaseId: string) {
    const user = await this.prisma.user.findUnique({
      where: { supabaseId },
    });

    if (!user) {
      throw new Error('User not found'); // Handle user not found
    }

    // Validate the vote value to ensure it's -1 or 1
    if (value !== 1 && value !== -1) {
      throw new Error('Invalid vote value. Please use 1 for upvote or -1 for downvote.');
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

    if (existingVote) {
      // If a vote already exists, update the existing vote and return a detailed message
      await this.prisma.vote.update({
        where: { id: existingVote.id },
        data: { value },
      });
      return { message: 'Vote updated', ideaId: Number(ideaId), newValue: value }; // Include updated details
    } else {
      // If no vote exists, create a new vote record and return a detailed message
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
      return { message: 'Vote added', ideaId: Number(ideaId), voteValue: value }; // Include added details
    }
  }
}
