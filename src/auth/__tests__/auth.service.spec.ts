import { Test, TestingModule } from '@nestjs/testing';
import { mockDeep } from 'jest-mock-extended';
import { AuthService } from '../auth.service';
import { UserService } from '../../user/user.service';
import { supabase } from '../../config/supabase.config';
import { JwtService } from '@nestjs/jwt';

jest.mock('../../config/supabase.config', () => ({
  supabase: {
    auth: {
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      getUser: jest.fn(),
    },
  },
}));

describe('AuthService', () => {
  let authService: AuthService;
  let jwtService: JwtService;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: JwtService, useValue: { sign: jest.fn(() => 'mock-token') } },
        {
          provide: UserService,
          useValue: mockDeep<UserService>(),
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    userService = module.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a user and send a confirmation email', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      const username = 'testuser';

      // Mock Supabase signUp response
      (supabase.auth.signUp as jest.Mock).mockResolvedValue({
        data: { user: { id: 'supabase-user-id' } },
        error: null,
      });

      // Mock UserService createUser method
      userService.createUser = jest.fn().mockResolvedValue({
        id: 1,
        email,
        username,
        supabaseId: 'supabase-user-id',
      });

      const result = await authService.register(email, password, username);

      expect(supabase.auth.signUp).toHaveBeenCalledWith({ email, password });
      expect(userService.createUser).toHaveBeenCalledWith({
        email,
        password,
        username,
        supabaseId: 'supabase-user-id',
      });
      expect(result).toEqual({
        user: { id: 1, email, username, supabaseId: 'supabase-user-id' },
      });
    });

    it('should throw an error if registration fails due to Supabase error', async () => {
      const email = 'test@example.com';
      const password = 'password123';

      // Mock Supabase signUp response with error
      (supabase.auth.signUp as jest.Mock).mockResolvedValue({
        data: null,
        error: { message: 'Registration error' },
      });

      await expect(authService.register(email, password, 'testuser')).rejects.toThrow(
        'Registration error',
      );
    });

    it('should throw an error if UserService fails to create user', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      const username = 'testuser';

      // Mock Supabase signUp response
      (supabase.auth.signUp as jest.Mock).mockResolvedValue({
        data: { user: { id: 'supabase-user-id' } },
        error: null,
      });

      // Mock UserService createUser method to fail
      userService.createUser = jest.fn().mockRejectedValue(new Error('User creation failed'));

      await expect(authService.register(email, password, username)).rejects.toThrow(
        'User creation failed',
      );
    });

    it('should throw an error if email format is invalid', async () => {
      const email = 'invalid-email';
      const password = 'password123';
      const username = 'testuser';

      await expect(authService.register(email, password, username)).rejects.toThrow(
        'Invalid email format',
      );
    });
  });

  describe('login', () => {
    it('should login a verified user and return an access token', async () => {
      const email = 'test@example.com';
      const password = 'password123';

      // Mock Supabase signInWithPassword response
      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
        data: { user: { id: 'supabase-user-id', email } },
        error: null,
      });

      const token = 'mock-token';
      (jwtService.sign as jest.Mock).mockReturnValue(token);

      const result = await authService.login(email, password);

      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({ email, password });
      expect(jwtService.sign).toHaveBeenCalledWith({ sub: 'supabase-user-id', email });
      expect(result).toEqual({ accessToken: token });
    });

    it('should throw an error if login fails due to invalid credentials', async () => {
      const email = 'test@example.com';
      const password = 'password123';

      // Mock Supabase signInWithPassword response with error
      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
        data: null,
        error: { message: 'Invalid credentials' },
      });

      await expect(authService.login(email, password)).rejects.toThrow('Invalid login credentials');
    });

    it('should throw an error if login fails due to network or unexpected error', async () => {
      const email = 'test@example.com';
      const password = 'password123';

      // Mock Supabase signInWithPassword to simulate a network or unexpected error
      (supabase.auth.signInWithPassword as jest.Mock).mockRejectedValue(new Error('Network error'));

      await expect(authService.login(email, password)).rejects.toThrow('Network error');
    });

    it('should throw an error if token generation fails after successful login', async () => {
      const email = 'test@example.com';
      const password = 'password123';

      // Mock Supabase signInWithPassword response
      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
        data: { user: { id: 'supabase-user-id', email } },
        error: null,
      });

      // Mock JwtService to throw an error during token generation
      (jwtService.sign as jest.Mock).mockImplementation(() => {
        throw new Error('Token generation failed');
      });

      await expect(authService.login(email, password)).rejects.toThrow('Token generation failed');
    });
  });
});
