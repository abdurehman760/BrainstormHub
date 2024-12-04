import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; 
import { CreateIdeaDto } from './dto/create-idea.dto'; // Import your DTO for creating ideas
import { UpdateIdeaDto } from './dto/update-idea.dto'; // Import DTO for updating ideas

@Injectable()
export class IdeasService {
  constructor(private readonly prisma: PrismaService) {}

  // Get all ideas for a specific board
async findAll(boardId: number) {
  const parsedBoardId = parseInt(boardId as unknown as string, 10);  // Parse boardId as an integer
  return this.prisma.idea.findMany({
    where: {
      boardId: parsedBoardId, // Use parsedBoardId
    },
  });
}


  // Create a new idea in a board
  async create(boardId: number, createIdeaDto: CreateIdeaDto) {
    const parsedBoardId = parseInt(boardId as unknown as string, 10); 
    console.log('Parsed boardId type:', typeof parsedBoardId); 
    return this.prisma.idea.create({
      data: {
        boardId: parsedBoardId,  // Use parsedBoardId as the number
        title: createIdeaDto.title,
        description: createIdeaDto.description,
      },
    });
  }
  
  

 // Update an idea by ID
async update(id: number, updateIdeaDto: UpdateIdeaDto) {
  const parsedId = parseInt(id as unknown as string, 10);  // Parse id as an integer
  
  return this.prisma.idea.update({
    where: {
      id: parsedId,  // Use parsedId
    },
    data: {
      title: updateIdeaDto.title,
      description: updateIdeaDto.description
    }
  });
}


 // Delete an idea by ID
async remove(id: number) {
  const parsedId = parseInt(id as unknown as string, 10);  // Parse the ID to ensure it's an integer
  return this.prisma.idea.delete({
    where: {
      id: parsedId,  // Use parsedId here
    },
  });
}
}
