import { Test, TestingModule } from '@nestjs/testing';
import { mockDeep } from 'jest-mock-extended';
import { UserService } from '../user.service';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
}));

describe('UserService', () => {
  let userService: UserService;
  let prismaService: PrismaService;
  let bcryptHashMock: jest.Mock;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaService>(), // Mocking Prisma service
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    prismaService = module.get<PrismaService>(PrismaService);
    bcryptHashMock = bcrypt.hash as jest.Mock; // Type assertion for the bcrypt mock
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    it('should create a user with a hashed password', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        supabaseId: 'supabaseId123',
        username: 'testuser',
      };

      // Mock the return value of bcrypt.hash
      bcryptHashMock.mockResolvedValue('hashedpassword');

      // Cast the Prisma method to a Jest mock function
      (prismaService.user.create as jest.Mock).mockResolvedValue({
        id: 1,
        email: userData.email,
        password: 'hashedpassword',
        username: userData.username,
        supabaseId: userData.supabaseId,
      });

      const result = await userService.createUser(userData);

      // Verify bcrypt.hash was called with the correct arguments
      expect(bcryptHashMock).toHaveBeenCalledWith(userData.password, 10);

      // Verify Prisma's user creation method was called with correct parameters
      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: {
          email: userData.email,
          password: 'hashedpassword',
          username: userData.username,
          supabaseId: userData.supabaseId,
        },
      });

      // Verify the result
      expect(result).toEqual({
        id: 1,
        email: userData.email,
        password: 'hashedpassword',
        username: userData.username,
        supabaseId: userData.supabaseId,
      });
    });

    it('should throw an error if the Prisma create method fails', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        supabaseId: 'supabaseId123',
        username: 'testuser',
      };

      // Mock the return value of bcrypt.hash
      bcryptHashMock.mockResolvedValue('hashedpassword');

      // Cast the Prisma method to a Jest mock function and simulate an error
      (prismaService.user.create as jest.Mock).mockRejectedValue(new Error('Failed to create user'));

      await expect(userService.createUser(userData)).rejects.toThrow('Failed to create user');
    });
  });
});
