import { Test, TestingModule } from '@nestjs/testing';
import { mockDeep } from 'jest-mock-extended';
import { IdeasService } from '../ideas.service';
import { PrismaService } from '../../prisma/prisma.service';
import { ActivityGateway } from '../../activity/activity.gateway';

describe('IdeasService', () => {
  let ideasService: IdeasService;
  let prismaService: PrismaService;
  let activityGateway: ActivityGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IdeasService,
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaService>(),
        },
        {
          provide: ActivityGateway,
          useValue: mockDeep<ActivityGateway>(),
        },
      ],
    }).compile();

    ideasService = module.get<IdeasService>(IdeasService);
    prismaService = module.get<PrismaService>(PrismaService);
    activityGateway = module.get<ActivityGateway>(ActivityGateway);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new idea and send a notification', async () => {
      const createIdeaDto = { title: 'New Idea', description: 'Idea Description' };
      const newIdea = { id: 1, ...createIdeaDto, boardId: 1 };
      const board = { id: 1, title: 'Board 1', user: { username: 'testuser' } };

      // Mock Prisma Service
      prismaService.idea.create = jest.fn().mockResolvedValue(newIdea);
      prismaService.board.findUnique = jest.fn().mockResolvedValue(board);

      // Mock ActivityGateway
      activityGateway.sendActivity = jest.fn();

      const result = await ideasService.create(1, createIdeaDto);

      expect(prismaService.idea.create).toHaveBeenCalledWith({
        data: { ...createIdeaDto, boardId: 1 },
      });
      expect(activityGateway.sendActivity).toHaveBeenCalledWith(
        'testuser created a new idea: New Idea in board: Board 1',
      );
      expect(result).toEqual(newIdea);
    });

    it('should throw an error if idea creation fails', async () => {
      const createIdeaDto = { title: 'New Idea', description: 'Idea Description' };

      // Mock Prisma Service to simulate failure
      prismaService.board.findUnique = jest.fn().mockResolvedValue(null);  // Simulate board not found

      await expect(ideasService.create(1, createIdeaDto)).rejects.toThrow('Board not found');
    });
  });

  describe('update', () => {
    it('should update an idea and send a notification', async () => {
      const updateIdeaDto = { title: 'Updated Idea' };
      const updatedIdea = { id: 1, title: 'Updated Idea', description: 'Idea Description', boardId: 1 };
      const board = { id: 1, title: 'Board 1', user: { username: 'testuser' } };

      // Mock Prisma Service to simulate finding an idea
      prismaService.idea.update = jest.fn().mockResolvedValue(updatedIdea);
      prismaService.board.findUnique = jest.fn().mockResolvedValue(board);
      prismaService.idea.findUnique = jest.fn().mockResolvedValue(updatedIdea);  // Ensure idea is found

      // Mock ActivityGateway
      activityGateway.sendActivity = jest.fn();

      const result = await ideasService.update(1, updateIdeaDto);

      expect(prismaService.idea.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateIdeaDto,
      });
      expect(activityGateway.sendActivity).toHaveBeenCalledWith(
        'testuser updated idea: Updated Idea in board: Board 1',
      );
      expect(result).toEqual(updatedIdea);
    });

    it('should throw an error if idea update fails', async () => {
      const updateIdeaDto = { title: 'Updated Idea' };

      // Mock Prisma Service to simulate failure
      prismaService.idea.findUnique = jest.fn().mockResolvedValue(null);  // Simulate idea not found

      await expect(ideasService.update(1, updateIdeaDto)).rejects.toThrow('Idea not found');
    });
  });

  describe('remove', () => {
    it('should delete an idea and send a notification', async () => {
      const deletedIdea = { id: 1, title: 'Deleted Idea', description: 'Idea Description', boardId: 1 };
      const board = { id: 1, title: 'Board 1', user: { username: 'testuser' } };

      // Mock Prisma Service to simulate finding and deleting the idea
      prismaService.idea.delete = jest.fn().mockResolvedValue(deletedIdea);
      prismaService.board.findUnique = jest.fn().mockResolvedValue(board);
      prismaService.idea.findUnique = jest.fn().mockResolvedValue(deletedIdea);  // Ensure idea is found

      // Mock ActivityGateway
      activityGateway.sendActivity = jest.fn();

      const result = await ideasService.remove(1);

      expect(prismaService.idea.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(activityGateway.sendActivity).toHaveBeenCalledWith(
        'testuser deleted idea: Deleted Idea in board: Board 1',
      );
      expect(result).toEqual(deletedIdea);
    });

    it('should throw an error if idea deletion fails', async () => {
      // Mock Prisma Service to simulate failure
      prismaService.idea.findUnique = jest.fn().mockResolvedValue(null);  // Simulate idea not found

      await expect(ideasService.remove(1)).rejects.toThrow('Idea not found');
    });
  });

  describe('getLeaderboard', () => {
    it('should return a leaderboard sorted by total votes', async () => {
      const ideas = [
        { id: 1, title: 'Idea 1', description: 'Description 1', votes: [{ value: 1 }, { value: -1 }] },
        { id: 2, title: 'Idea 2', description: 'Description 2', votes: [{ value: 1 }, { value: 1 }] },
      ];

      prismaService.idea.findMany = jest.fn().mockResolvedValue(ideas);

      const result = await ideasService.getLeaderboard(1);

      expect(result).toEqual([
        { id: 2, title: 'Idea 2', description: 'Description 2', totalVotes: 2, positiveVotes: 2, negativeVotes: 0 },
        { id: 1, title: 'Idea 1', description: 'Description 1', totalVotes: 0, positiveVotes: 1, negativeVotes: 1 },
      ]);
    });
  });

  describe('search', () => {
    it('should return ideas matching the search query', async () => {
      const query = 'Idea';
      const ideas = [
        { id: 1, title: 'Idea 1', description: 'Description 1' },
        { id: 2, title: 'Another Idea', description: 'Description 2' },
      ];

      prismaService.idea.findMany = jest.fn().mockResolvedValue(ideas);

      const result = await ideasService.search(1, query);

      expect(prismaService.idea.findMany).toHaveBeenCalledWith({
        where: {
          boardId: 1,
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
          ],
        },
      });
      expect(result).toEqual(ideas);
    });

    it('should return an empty list if no ideas match the query', async () => {
      const query = 'Nonexistent';
      prismaService.idea.findMany = jest.fn().mockResolvedValue([]);

      const result = await ideasService.search(1, query);

      expect(prismaService.idea.findMany).toHaveBeenCalledWith({
        where: {
          boardId: 1,
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
          ],
        },
      });
      expect(result).toEqual([]);
    });
  });
});

