import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class IdeasService {
  constructor(private readonly prisma: PrismaService) {}

  // Get all ideas for a specific board
  async findAll(boardId: number) {
    const parsedBoardId = parseInt(boardId as unknown as string, 10);
    return this.prisma.idea.findMany({
      where: {
        boardId: parsedBoardId,
      },
    });
  }

  // Create a new idea in a board
  async create(boardId: number, createIdeaDto: any) {
    const parsedBoardId = parseInt(boardId as unknown as string, 10);
    return this.prisma.idea.create({
      data: {
        boardId: parsedBoardId,
        title: createIdeaDto.title,
        description: createIdeaDto.description,
      },
    });
  }

  // Update an idea by ID
  async update(id: number, updateIdeaDto: any) {
    const parsedId = parseInt(id as unknown as string, 10);
    return this.prisma.idea.update({
      where: { id: parsedId },
      data: updateIdeaDto,
    });
  }

  // Delete an idea by ID
  async remove(id: number) {
    const parsedId = parseInt(id as unknown as string, 10);
    return this.prisma.idea.delete({
      where: { id: parsedId },
    });
  }

  // Get leaderboard for a specific board
  async getLeaderboard(boardId: number) {
    const parsedBoardId = parseInt(boardId as unknown as string, 10);

    const ideas = await this.prisma.idea.findMany({
      where: { boardId: parsedBoardId },
      include: {
        votes: true, // Include votes for each idea
      },
    });

    // Compute total, positive, and negative votes for each idea
    const leaderboard = ideas.map((idea) => {
      const totalVotes = idea.votes.reduce((sum, vote) => sum + vote.value, 0);
      const positiveVotes = idea.votes.filter((vote) => vote.value === 1).length;
      const negativeVotes = idea.votes.filter((vote) => vote.value === -1).length;

      return {
        id: idea.id,
        title: idea.title,
        description: idea.description,
        totalVotes,
        positiveVotes,
        negativeVotes,
      };
    });

    // Sort ideas by total votes (descending)
    return leaderboard.sort((a, b) => b.totalVotes - a.totalVotes);
  }
}
