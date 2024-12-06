import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';


@Injectable()
export class CommentsService {
  constructor(private readonly prisma: PrismaService) {}

  // Add a comment to an idea
  async create(content: string, ideaId: number, userId: number) {
    return this.prisma.comment.create({
      data: {
        content,
        idea: {
          connect: {
            id: parseInt(ideaId.toString(), 10), // Ensure ideaId is an integer
          },
        },
        user: {
          connect: {
            id: userId,
          },
        },
      },
    });
  }

  // Get comments for an idea
  async findAll(ideaId: number) {
    return this.prisma.comment.findMany({
      where: {
        ideaId: parseInt(ideaId.toString(), 10), // Ensure ideaId is an integer
      },
      orderBy: {
        createdAt: 'desc', // Order by latest comment first
      },
    });
  }
}
