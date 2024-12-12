import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

describe('VotesController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;
  let userData: { email: string; username: string; supabaseId: string };
  let token: string;
  let idea: any;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get<PrismaService>(PrismaService);
    jwtService = moduleFixture.get<JwtService>(JwtService);

    await app.init();

    // Create unique user data
    const uniqueTimestamp = Date.now();
    userData = {
      email: `test-${uniqueTimestamp}@example.com`,
      username: `testuser-${uniqueTimestamp}`,
      supabaseId: `test-supabase-id-${uniqueTimestamp}`,
    };

    // Create a test user
    const user = await prisma.user.create({
      data: {
        email: userData.email,
        username: userData.username,
        supabaseId: userData.supabaseId,
      },
    });

    // Generate JWT token for the test user
    token = jwtService.sign({ sub: user.supabaseId });

    // Create a test board associated with the user
    const board = await prisma.board.create({
      data: {
        title: `Test Board ${uniqueTimestamp}`,
        user: {
          connect: { id: user.id }, // Connect the board to the created user
        },
      },
    });

    // Create a test idea linked to the board
    idea = await prisma.idea.create({
      data: {
        title: `Test Idea ${uniqueTimestamp}`,
        description: 'This is a test idea.',
        board: {
          connect: { id: board.id },
        },
      },
    });
  });

  it('should allow a user to upvote an idea (POST /ideas/:ideaId/vote)', async () => {
    const response = await request(app.getHttpServer())
      .post(`/ideas/${idea.id}/vote`) // Correct the route here
      .set('Authorization', `Bearer ${token}`)
      .send({
        value: 1, // The value is either 1 or -1 for upvote or downvote
      })
      .expect(201);

    expect(response.body).toEqual(
      expect.objectContaining({
        message: 'Vote added',
        ideaId: idea.id,
        voteValue: 1,
        success: true,
      }),
    );
  });

  it('should allow a user to downvote an idea (POST /ideas/:ideaId/vote)', async () => {
    const response = await request(app.getHttpServer())
      .post(`/ideas/${idea.id}/vote`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        value: -1, // Downvote
      })
      .expect(201);

    expect(response.body).toEqual(
      expect.objectContaining({
        message: 'Vote updated', // Expecting 'Vote updated' message
        ideaId: idea.id,
        newValue: -1, // Expecting 'newValue' instead of 'voteValue'
        success: true,
      }),
    );
  });

  it('should return an error if an invalid vote value is provided (POST /ideas/:ideaId/vote)', async () => {
    const response = await request(app.getHttpServer())
      .post(`/ideas/${idea.id}/vote`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        value: 0, // Invalid vote value
      })
      .expect(400); // Bad request

    expect(response.body).toEqual(
      expect.objectContaining({
        error: 'Bad Request', // New error field
        message: expect.arrayContaining([
          'Vote value must be either 1 (upvote) or -1 (downvote).',
        ]),
        statusCode: 400,
      }),
    );
  });

  it('should return an error if the idea does not exist (POST /ideas/:ideaId/vote)', async () => {
    const response = await request(app.getHttpServer())
      .post('/ideas/999999/vote') // Invalid idea ID
      .set('Authorization', `Bearer ${token}`)
      .send({
        value: 1,
      })
      .expect(404); // Expecting Not Found
  
    expect(response.body).toEqual(
      expect.objectContaining({
        error: 'Not Found', // Expecting 'Not Found' error type
        message: 'Idea not found. Please check the idea ID and try again.',
        statusCode: 404,
      }),
    );
  });
  

  it('should return an error if the user is not found (POST /ideas/:ideaId/vote)', async () => {
    const invalidToken = 'Bearer invalid_token';

    const response = await request(app.getHttpServer())
      .post(`/ideas/${idea.id}/vote`)
      .set('Authorization', invalidToken) // Invalid token
      .send({
        value: 1,
      })
      .expect(401); // Unauthorized error

    expect(response.body).toEqual(
      expect.objectContaining({
        error: 'Unauthorized',
        message: 'Invalid token', // Updated error message
        statusCode: 401,
      }),
    );
  });
});
