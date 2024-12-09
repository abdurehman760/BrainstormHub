import { Test, TestingModule } from '@nestjs/testing';
import { mockDeep } from 'jest-mock-extended';
import { BoardsService } from '../boards.service';
import { PrismaService } from '../../prisma/prisma.service';
import { ActivityGateway } from '../../activity/activity.gateway';
import { CreateBoardDto } from '../dto/create-board.dto';
import { UpdateBoardDto } from '../dto/update-board.dto';

describe('BoardsService', () => {
  let boardsService: BoardsService;
  let prismaService: PrismaService;
  let activityGateway: ActivityGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BoardsService,
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

    boardsService = module.get<BoardsService>(BoardsService);
    prismaService = module.get<PrismaService>(PrismaService);
    activityGateway = module.get<ActivityGateway>(ActivityGateway);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new board and send a notification', async () => {
      const createBoardDto: CreateBoardDto = {
        userId: 1,
        title: 'New Board',
        description: 'Description of new board',
      };

      const newBoard = { ...createBoardDto, id: 1 };

      // Mock Prisma Service create method
      prismaService.board.create = jest.fn().mockResolvedValue(newBoard);

      // Mock user retrieval
      prismaService.user.findUnique = jest.fn().mockResolvedValue({ username: 'testuser' });

      // Mock ActivityGateway
      activityGateway.sendActivity = jest.fn();

      const result = await boardsService.create(createBoardDto);

      // Fix: Update the test to pass userId within user.connect
      expect(prismaService.board.create).toHaveBeenCalledWith({
        data: {
          title: createBoardDto.title,
          description: createBoardDto.description,
          user: { connect: { id: createBoardDto.userId } }, // Correct structure
        },
      });
      expect(activityGateway.sendActivity).toHaveBeenCalledWith(
        'testuser created a new board: New Board',
      );
      expect(result).toEqual(newBoard);
    });

    it('should throw an error if board creation fails', async () => {
      const createBoardDto: CreateBoardDto = {
        userId: 1,
        title: 'New Board',
        description: 'Description of new board',
      };

      prismaService.board.create = jest.fn().mockRejectedValue(new Error('Failed to create board'));

      await expect(boardsService.create(createBoardDto)).rejects.toThrow('Failed to create board');
    });
  });

  describe('findAll', () => {
    it('should return all boards', async () => {
      const boards = [{ id: 1, title: 'Board 1', description: 'Description 1' }];
      prismaService.board.findMany = jest.fn().mockResolvedValue(boards);

      const result = await boardsService.findAll();

      expect(prismaService.board.findMany).toHaveBeenCalled();
      expect(result).toEqual(boards);
    });

    it('should return an empty list if no boards exist', async () => {
      prismaService.board.findMany = jest.fn().mockResolvedValue([]);

      const result = await boardsService.findAll();

      expect(prismaService.board.findMany).toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });

  describe('search', () => {
    it('should return boards matching the search query', async () => {
      const query = 'Board';
      const boards = [{ id: 1, title: 'Board 1', description: 'Board description' }];
      prismaService.board.findMany = jest.fn().mockResolvedValue(boards);

      const result = await boardsService.search(query);

      expect(prismaService.board.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
          ],
        },
      });
      expect(result).toEqual(boards);
    });

    it('should return an empty list if no boards match the query', async () => {
      const query = 'Nonexistent';
      prismaService.board.findMany = jest.fn().mockResolvedValue([]);

      const result = await boardsService.search(query);

      expect(prismaService.board.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
          ],
        },
      });
      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a board by ID', async () => {
      const board = { id: 1, title: 'Board 1', description: 'Description 1' };
      prismaService.board.findUnique = jest.fn().mockResolvedValue(board);

      const result = await boardsService.findOne(1);

      expect(prismaService.board.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual(board);
    });

    it('should return null if board not found', async () => {
      prismaService.board.findUnique = jest.fn().mockResolvedValue(null);

      const result = await boardsService.findOne(999);

      expect(prismaService.board.findUnique).toHaveBeenCalledWith({
        where: { id: 999 },
      });
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update a board and send a notification', async () => {
      const updateBoardDto: UpdateBoardDto = { title: 'Updated Title' };
      const updatedBoard = { id: 1, title: 'Updated Title', description: 'Description 1', userId: 1 };

      // Mock Prisma Service update method
      prismaService.board.update = jest.fn().mockResolvedValue(updatedBoard);

      // Mock user retrieval
      prismaService.user.findUnique = jest.fn().mockResolvedValue({ username: 'testuser' });

      // Mock ActivityGateway
      activityGateway.sendActivity = jest.fn();

      const result = await boardsService.update(1, updateBoardDto);

      expect(prismaService.board.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateBoardDto,
      });
      expect(activityGateway.sendActivity).toHaveBeenCalledWith(
        'testuser updated board: Updated Title',
      );
      expect(result).toEqual(updatedBoard);
    });

    it('should throw an error if board update fails', async () => {
      const updateBoardDto: UpdateBoardDto = { title: 'Updated Title' };

      prismaService.board.update = jest.fn().mockRejectedValue(new Error('Failed to update board'));

      await expect(boardsService.update(1, updateBoardDto)).rejects.toThrow('Failed to update board');
    });
  });

  describe('remove', () => {
    it('should delete a board and send a notification', async () => {
      const deletedBoard = { id: 1, title: 'Board 1', description: 'Description 1', userId: 1 };

      // Mock Prisma Service delete method
      prismaService.board.delete = jest.fn().mockResolvedValue(deletedBoard);

      // Mock user retrieval
      prismaService.user.findUnique = jest.fn().mockResolvedValue({ username: 'testuser' });

      // Mock ActivityGateway
      activityGateway.sendActivity = jest.fn();

      const result = await boardsService.remove(1);

      expect(prismaService.board.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(activityGateway.sendActivity).toHaveBeenCalledWith(
        'testuser deleted board: Board 1',
      );
      expect(result).toEqual(deletedBoard);
    });

    it('should throw an error if board deletion fails', async () => {
      prismaService.board.delete = jest.fn().mockRejectedValue(new Error('Failed to delete board'));

      await expect(boardsService.remove(1)).rejects.toThrow('Failed to delete board');
    });
  });
});
