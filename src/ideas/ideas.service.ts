import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityGateway } from '../activity/activity.gateway';
@Injectable()
export class IdeasService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly activityGateway: ActivityGateway,
  ) {}

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

    // Create the idea in the database
    const newIdea = await this.prisma.idea.create({
      data: {
        boardId: parsedBoardId,
        title: createIdeaDto.title,
        description: createIdeaDto.description,
      },
    });

    // Emit a notification for idea creation
    const board = await this.prisma.board.findUnique({
      where: { id: parsedBoardId },
      include: {
        user: true, // Get the user who owns the board
      },
    });

    this.activityGateway.sendActivity(
      `${board?.user.username} created a new idea: ${newIdea.title} in board: ${board?.title}`,
    );

    return newIdea;
  }

  // Update an idea by ID
  async update(id: number, updateIdeaDto: any) {
    const parsedId = parseInt(id as unknown as string, 10);

    // Update the idea in the database
    const updatedIdea = await this.prisma.idea.update({
      where: { id: parsedId },
      data: updateIdeaDto,
    });

    // Emit a notification for idea update
    const board = await this.prisma.board.findUnique({
      where: { id: updatedIdea.boardId },
      include: {
        user: true, // Get the user who owns the board
      },
    });

    this.activityGateway.sendActivity(
      `${board?.user.username} updated idea: ${updatedIdea.title} in board: ${board?.title}`,
    );

    return updatedIdea;
  }

  // Delete an idea by ID
  async remove(id: number) {
    const parsedId = parseInt(id as unknown as string, 10);

    // Delete the idea from the database
    const deletedIdea = await this.prisma.idea.delete({
      where: { id: parsedId },
    });

    // Emit a notification for idea deletion
    const board = await this.prisma.board.findUnique({
      where: { id: deletedIdea.boardId },
      include: {
        user: true, // Get the user who owns the board
      },
    });

    this.activityGateway.sendActivity(
      `${board?.user.username} deleted idea: ${deletedIdea.title} in board: ${board?.title}`,
    );

    return deletedIdea;
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
      const positiveVotes = idea.votes.filter(
        (vote) => vote.value === 1,
      ).length;
      const negativeVotes = idea.votes.filter(
        (vote) => vote.value === -1,
      ).length;

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

  // Search ideas by title or description
  async search(boardId: number, query: string) {
    const parsedBoardId = parseInt(boardId as unknown as string, 10);

    return this.prisma.idea.findMany({
      where: {
        boardId: parsedBoardId,
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
      },
    });
  }
}
