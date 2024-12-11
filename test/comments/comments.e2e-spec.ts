import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module'; // Adjust path as necessary
import { INestApplication } from '@nestjs/common';
import { PrismaService } from '../../src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

describe('CommentsController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;
  let token: string; // JWT token for authorization
  let userData: { email: string; password: string; username: string };
  let boardId: number; // ID of the created board
  let ideaId: number; // ID of the created idea

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = app.get<PrismaService>(PrismaService);
    jwtService = app.get<JwtService>(JwtService);

    await app.init();

    // Create a test user
    const uniqueTimestamp = Date.now();
    userData = {
      email: `test-${uniqueTimestamp}@example.com`,
      password: 'password123',
      username: `testuser-${uniqueTimestamp}`,
    };

    // Create the user in the database
    const user = await prisma.user.create({
      data: {
        email: userData.email,
        password: userData.password,
        username: userData.username,
        supabaseId: `test-supabase-id-${uniqueTimestamp}`, // Unique supabase ID
      },
    });

    // Generate a JWT token for the test user
    token = jwtService.sign({ sub: user.supabaseId });

    // Create a test board
    const createBoardDto = { title: 'Test Board', description: 'Board for testing ideas' };
    const response = await request(app.getHttpServer())
      .post('/boards')
      .set('Authorization', `Bearer ${token}`)
      .send(createBoardDto)
      .expect(201);

    boardId = response.body.id; // Store the created board ID

    // Create a test idea
    const createIdeaDto = { title: 'Test Idea', description: 'This is a test idea' };
    const ideaResponse = await request(app.getHttpServer())
      .post(`/boards/${boardId}/ideas`)
      .set('Authorization', `Bearer ${token}`)
      .send(createIdeaDto)
      .expect(201);

    ideaId = ideaResponse.body.id; // Store the created idea ID
  });

  // Helper function to create a comment
  const createComment = async (content: string) => {
    const response = await request(app.getHttpServer())
      .post(`/ideas/${ideaId}/comments`)
      .set('Authorization', `Bearer ${token}`)
      .send({ content })
      .expect(201);
    return response.body;
  };

  // Success Test: Add a comment to an idea
  it('should add a comment to an idea (POST /ideas/:ideaId/comments)', async () => {
    const commentContent = 'This is a test comment';

    const response = await createComment(commentContent);

    expect(response).toHaveProperty('id');
    expect(response.content).toBe(commentContent);
    expect(response.ideaId).toBe(ideaId);
    expect(response.userId).toBeDefined(); // Ensure the user ID is included (check that comment is associated with the user)
  });

  // Success Test: Get all comments for an idea (GET /ideas/:ideaId/comments)
  it('should retrieve all comments for a specific idea (GET /ideas/:ideaId/comments)', async () => {
    const commentContent = 'This is another test comment';

    // Create a comment for the idea first
    await createComment(commentContent);

    // Now, retrieve all comments for the created idea
    const response = await request(app.getHttpServer())
      .get(`/ideas/${ideaId}/comments`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    // Check that the response is an array and contains the created comment
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0); // Ensure there is at least one comment
    expect(response.body[0]).toHaveProperty('id');
    expect(response.body[0].content).toBe(commentContent);
    expect(response.body[0].ideaId).toBe(ideaId);
  });

  // Failure Test: Try to add a comment to a non-existent idea
  it('should fail to add a comment to a non-existent idea (POST /ideas/:ideaId/comments)', async () => {
    const invalidIdeaId = 999999; // Assuming this idea ID does not exist
    const commentContent = 'This comment is for a non-existent idea';

    const response = await request(app.getHttpServer())
      .post(`/ideas/${invalidIdeaId}/comments`)
      .set('Authorization', `Bearer ${token}`)
      .send({ content: commentContent })
      .expect(404); // Expecting a 404 status for idea not found

    expect(response.body.message).toBe('Idea not found');
  });

  // Failure Test: Unauthorized user trying to add a comment
  it('should fail if the user is unauthorized (POST /ideas/:ideaId/comments)', async () => {
    const commentContent = 'This is an unauthorized comment';

    // Make the request without a valid token
    const response = await request(app.getHttpServer())
      .post(`/ideas/${ideaId}/comments`)
      .send({ content: commentContent })
      .expect(401); // Expecting a 401 status for unauthorized

    expect(response.body.message).toBe('No token provided');
  });

  // Failure Test: Try to retrieve comments for a non-existent idea (GET /ideas/:ideaId/comments)
  it('should fail to retrieve comments for a non-existent idea (GET /ideas/:ideaId/comments)', async () => {
    const invalidIdeaId = 999999; // Assuming this idea ID does not exist in the database

    const response = await request(app.getHttpServer())
      .get(`/ideas/${invalidIdeaId}/comments`)
      .set('Authorization', `Bearer ${token}`)
      .expect(404); // Expecting a 404 status for idea not found

    expect(response.body.message).toBe('Idea not found'); // Ensure that the response contains the correct error message
  });
});
