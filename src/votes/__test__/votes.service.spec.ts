import { Test, TestingModule } from '@nestjs/testing';
import { mockDeep } from 'jest-mock-extended';
import { VotesService } from '../votes.service';
import { PrismaService } from '../../prisma/prisma.service';
import { ActivityGateway } from '../../activity/activity.gateway';

describe('VotesService', () => {
  let votesService: VotesService;
  let prismaService: PrismaService;
  let activityGateway: ActivityGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VotesService,
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

    votesService = module.get<VotesService>(VotesService);
    prismaService = module.get<PrismaService>(PrismaService);
    activityGateway = module.get<ActivityGateway>(ActivityGateway);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('voteOnIdea', () => {
    it('should allow a user to vote on an idea', async () => {
      const ideaId = '1';
      const value = 1;
      const supabaseId = 'user123';
      const user = { id: 1, username: 'testuser' };
      const idea = { id: 1, title: 'Idea 1', board: { title: 'Board 1' } };

      // Mocking Prisma Service
      prismaService.user.findUnique = jest.fn().mockResolvedValue(user);
      prismaService.idea.findUnique = jest.fn().mockResolvedValue(idea);
      prismaService.vote.create = jest.fn().mockResolvedValue({ id: 1, value });

      // Mock ActivityGateway
      activityGateway.sendActivity = jest.fn();

      const result = await votesService.voteOnIdea(ideaId, value, supabaseId);

      expect(prismaService.vote.create).toHaveBeenCalledWith({
        data: {
          value,
          idea: { connect: { id: 1 } },
          user: { connect: { id: 1 } },
        },
      });
      expect(activityGateway.sendActivity).toHaveBeenCalledWith(
        `${user.username} voted on the idea: "Idea 1" with a upvote in board: "Board 1"`,
      );
      expect(result).toEqual({
        message: 'Vote added',
        ideaId: 1,
        voteValue: value,
        success: true,
      });
    });

    it('should update a user\'s vote on an idea if they have already voted', async () => {
      const ideaId = '1';
      const value = -1;
      const supabaseId = 'user123';
      const user = { id: 1, username: 'testuser' };
      const idea = { id: 1, title: 'Idea 1', board: { title: 'Board 1' } };
      const existingVote = { id: 1, value: 1 };

      // Mocking Prisma Service
      prismaService.user.findUnique = jest.fn().mockResolvedValue(user);
      prismaService.idea.findUnique = jest.fn().mockResolvedValue(idea);
      prismaService.vote.findUnique = jest.fn().mockResolvedValue(existingVote);
      prismaService.vote.update = jest.fn().mockResolvedValue({ ...existingVote, value });

      // Mock ActivityGateway
      activityGateway.sendActivity = jest.fn();

      const result = await votesService.voteOnIdea(ideaId, value, supabaseId);

      expect(prismaService.vote.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { value },
      });
      expect(activityGateway.sendActivity).toHaveBeenCalledWith(
        `${user.username} updated their vote on the idea: "Idea 1" to downvote in board: "Board 1"`,
      );
      expect(result).toEqual({
        message: 'Vote updated',
        ideaId: 1,
        newValue: value,
        success: true,
      });
    });

    it('should throw an error if the vote value is invalid', async () => {
      const ideaId = '1';
      const value = 0;  // Invalid value
      const supabaseId = 'user123';
      const user = { id: 1, username: 'testuser' };

      // Mocking Prisma Service
      prismaService.user.findUnique = jest.fn().mockResolvedValue(user);
      prismaService.idea.findUnique = jest.fn().mockResolvedValue({ id: 1, title: 'Idea 1' });

      // Test invalid vote value
      await expect(votesService.voteOnIdea(ideaId, value, supabaseId))
        .rejects
        .toThrow('Invalid vote value. Please use 1 for upvote or -1 for downvote.');
    });

    it('should throw an error if the user is not found', async () => {
      const ideaId = '1';
      const value = 1;
      const supabaseId = 'user123';

      // Mocking Prisma Service to return no user
      prismaService.user.findUnique = jest.fn().mockResolvedValue(null);

      await expect(votesService.voteOnIdea(ideaId, value, supabaseId))
        .rejects
        .toThrow('User not found');
    });

    it('should return a message if the idea is not found', async () => {
      const ideaId = '1';
      const value = 1;
      const supabaseId = 'user123';
      const user = { id: 1, username: 'testuser' };

      // Mocking Prisma Service
      prismaService.user.findUnique = jest.fn().mockResolvedValue(user);
      prismaService.idea.findUnique = jest.fn().mockResolvedValue(null);  // Idea not found

      const result = await votesService.voteOnIdea(ideaId, value, supabaseId);

      expect(result).toEqual({
        message: 'Idea not found. Please check the idea ID and try again.',
        success: false,
      });
    });
  });
});
