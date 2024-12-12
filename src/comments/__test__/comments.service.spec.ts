import { Test, TestingModule } from '@nestjs/testing';
import { mockDeep } from 'jest-mock-extended';
import { CommentsService } from '../comments.service';
import { PrismaService } from '../../prisma/prisma.service';
import { ActivityGateway } from '../../activity/activity.gateway';

describe('CommentsService', () => {
  let commentsService: CommentsService;
  let prismaService: PrismaService;
  let activityGateway: ActivityGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentsService,
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

    commentsService = module.get<CommentsService>(CommentsService);
    prismaService = module.get<PrismaService>(PrismaService);
    activityGateway = module.get<ActivityGateway>(ActivityGateway);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new comment and send a notification', async () => {
      const content = 'This is a comment';
      const ideaId = 1;
      const userId = 1;
      
      const newComment = { id: 1, content, ideaId, userId };
      const idea = { id: ideaId, title: 'Idea Title', board: { title: 'Board Title' } };
      const user = { id: userId, username: 'testuser' };

      // Mock Prisma Service create method
      prismaService.comment.create = jest.fn().mockResolvedValue(newComment);
      prismaService.idea.findUnique = jest.fn().mockResolvedValue(idea);
      prismaService.user.findUnique = jest.fn().mockResolvedValue(user);

      // Mock ActivityGateway
      activityGateway.sendActivity = jest.fn();

      const result = await commentsService.create(content, ideaId, userId);

      expect(prismaService.comment.create).toHaveBeenCalledWith({
        data: {
          content,
          idea: { connect: { id: ideaId } },
          user: { connect: { id: userId } },
        },
      });

      expect(activityGateway.sendActivity).toHaveBeenCalledWith(
        'testuser commented on the idea: "Idea Title" with comment: "This is a comment" in board: "Board Title"',
      );

      expect(result).toEqual(newComment);
    });

    it('should throw an error if comment creation fails', async () => {
      const content = 'This is a comment';
      const ideaId = 1;
      const userId = 1;

      // Mock Prisma Service: Simulate idea not found
      prismaService.idea.findUnique = jest.fn().mockResolvedValue(null);  // Make idea not found

      await expect(commentsService.create(content, ideaId, userId))
        .rejects
        .toThrow('Idea not found'); // Expect "Idea not found" error here
    });
  });

  describe('findAll', () => {
    it('should return all comments for an idea', async () => {
      const ideaId = 1;
      const comments = [{ id: 1, content: 'Comment 1', ideaId }, { id: 2, content: 'Comment 2', ideaId }];

      // Mock the retrieval of the idea and comments
      prismaService.idea.findUnique = jest.fn().mockResolvedValue({ id: ideaId });  // Mock idea found
      prismaService.comment.findMany = jest.fn().mockResolvedValue(comments);

      const result = await commentsService.findAll(ideaId);

      expect(prismaService.comment.findMany).toHaveBeenCalledWith({
        where: { ideaId },
        orderBy: { createdAt: 'desc' },
      });

      expect(result).toEqual(comments);
    });

    it('should return an empty list if no comments exist for the idea', async () => {
      const ideaId = 1;

      // Mock the retrieval of the idea and simulate no comments found
      prismaService.idea.findUnique = jest.fn().mockResolvedValue({ id: ideaId });  // Mock idea found
      prismaService.comment.findMany = jest.fn().mockResolvedValue([]);

      const result = await commentsService.findAll(ideaId);

      expect(prismaService.comment.findMany).toHaveBeenCalledWith({
        where: { ideaId },
        orderBy: { createdAt: 'desc' },
      });

      expect(result).toEqual([]);
    });
  });
});

