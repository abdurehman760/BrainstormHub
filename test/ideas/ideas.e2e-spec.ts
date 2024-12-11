import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module'; // Adjust path as necessary
import { INestApplication } from '@nestjs/common';
import { PrismaService } from '../../src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

describe('IdeasController (e2e)', () => {
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
  });

  // Helper function to create an idea
  const createIdea = async (ideaDto) => {
    const response = await request(app.getHttpServer())
      .post(`/boards/${boardId}/ideas`)
      .set('Authorization', `Bearer ${token}`)
      .send(ideaDto)
      .expect(201);
    return response.body;
  };

  // Test: Get all ideas for a specific board
  it('should retrieve all ideas for a specific board (GET /boards/:boardId/ideas)', async () => {
    const idea1 = { title: 'Idea 1', description: 'Description for Idea 1' };
    const idea2 = { title: 'Idea 2', description: 'Description for Idea 2' };

    await createIdea(idea1);
    await createIdea(idea2);

    const response = await request(app.getHttpServer())
      .get(`/boards/${boardId}/ideas`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body).toBeInstanceOf(Array);
    expect(response.body.length).toBe(2);
    expect(response.body[0].title).toBe('Idea 1');
    expect(response.body[1].title).toBe('Idea 2');
  });

  // Test: Create a new idea in a board
  it('should create a new idea in a board (POST /boards/:boardId/ideas)', async () => {
    const createIdeaDto = { title: 'New Idea', description: 'Description for the new idea' };

    const response = await createIdea(createIdeaDto);

    ideaId = response.id; // Store the created idea ID

    expect(response.title).toBe(createIdeaDto.title);
    expect(response.description).toBe(createIdeaDto.description);
    expect(response.boardId).toBe(boardId);
  });

  // Test: Update an idea by ID
  it('should update an idea by ID (PUT /ideas/:id)', async () => {
    const updateIdeaDto = { title: 'Updated Idea', description: 'Updated description for the idea' };

    const response = await request(app.getHttpServer())
      .put(`/ideas/${ideaId}`)
      .set('Authorization', `Bearer ${token}`)
      .send(updateIdeaDto)
      .expect(200);

    expect(response.body.title).toBe(updateIdeaDto.title);
    expect(response.body.description).toBe(updateIdeaDto.description);
    expect(response.body.id).toBe(ideaId);
  });

  // Test: Search for ideas by title or description
  it('should search ideas by title or description (GET /boards/:boardId/ideas/search)', async () => {
    const idea1 = { title: 'Searchable Idea', description: 'This idea should be found' };
    const idea2 = { title: 'Another Idea', description: 'This idea should also be found' };

    await createIdea(idea1);
    await createIdea(idea2);

    const response = await request(app.getHttpServer())
      .get(`/boards/${boardId}/ideas/search?query=Searchable`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body).toBeInstanceOf(Array);
    expect(response.body.length).toBe(1); // Only one idea should match the query
    expect(response.body[0].title).toBe('Searchable Idea');
  });

  // Test: Delete an idea by ID
  it('should delete an idea by ID (DELETE /ideas/:id)', async () => {
    await request(app.getHttpServer())
      .delete(`/ideas/${ideaId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204); // Expecting a 204 status for successful deletion
  });

  // Test: Get the leaderboard for a board
  it('should fetch the leaderboard for a board (GET /boards/:boardId/ideas/leaderboard)', async () => {
    const response = await request(app.getHttpServer())
      .get(`/boards/${boardId}/ideas/leaderboard`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body).toBeInstanceOf(Array);
    expect(response.body.length).toBeGreaterThan(0); // Ensure the leaderboard is not empty
    expect(response.body[0]).toHaveProperty('title'); // Ensure title is present
    expect(response.body[0]).toHaveProperty('totalVotes'); // Ensure totalVotes is present
    expect(response.body[0]).toHaveProperty('positiveVotes'); // Ensure positiveVotes is present
    expect(response.body[0]).toHaveProperty('negativeVotes'); // Ensure negativeVotes is present
  });
});
