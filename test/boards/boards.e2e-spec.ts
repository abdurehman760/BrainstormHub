import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module'; // Adjust the path as necessary
import { INestApplication } from '@nestjs/common';
import { PrismaService } from '../../src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

describe('BoardsController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;
  let token: string; // Variable to store the JWT
  let userData: { email: string; password: string; username: string };
  let createdBoardId: number; // To store the ID of the created board

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = app.get<PrismaService>(PrismaService);
    jwtService = app.get<JwtService>(JwtService);

    await app.init();

    // Create a test user with a unique email and username
    const uniqueTimestamp = Date.now();
    userData = {
      email: `test-${uniqueTimestamp}@example.com`,
      password: 'password123',
      username: `testuser-${uniqueTimestamp}`,
    };

    // Generate a unique Supabase ID for each test
    const supabaseId = `test-supabase-id-${uniqueTimestamp}`;

    const user = await prisma.user.create({
      data: {
        email: userData.email,
        password: userData.password, // Normally you'd hash the password before storing it
        username: userData.username,
        supabaseId, // Use the unique Supabase ID
      },
    });

    // Generate a JWT token for the test user
    token = jwtService.sign({ sub: user.supabaseId });

    // Create a test board for the user
    const createBoardDto = {
      title: 'Test Board',
      description: 'This is a test board description',
    };

    const response = await request(app.getHttpServer())
      .post('/boards')
      .set('Authorization', `Bearer ${token}`)
      .send(createBoardDto)
      .expect(201);

    createdBoardId = response.body.id; // Store the created board ID for use in the next test
  });

  it('should retrieve all boards (GET /boards)', async () => {
    const response = await request(app.getHttpServer())
      .get('/boards')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body).toBeInstanceOf(Array);
    expect(response.body.length).toBeGreaterThan(0);
  });

  it('should retrieve a single board by ID (GET /boards/:id)', async () => {
    const response = await request(app.getHttpServer())
      .get(`/boards/${createdBoardId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body).toHaveProperty('id');
    expect(response.body.id).toBe(createdBoardId);
    expect(response.body.title).toBe('Test Board');
    expect(response.body.description).toBe('This is a test board description');
  });

  it('should search for boards by title or description (GET /boards/search)', async () => {
    const query = 'Test Board'; // Searching by title

    const response = await request(app.getHttpServer())
      .get(`/boards/search?query=${query}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body).toBeInstanceOf(Array);
    expect(response.body.length).toBeGreaterThan(0);
    expect(response.body[0].title).toContain(query);
  });

  it('should update a board by ID (PUT /boards/:id)', async () => {
    const updateBoardDto = {
      title: 'Updated Test Board',
      description: 'This is an updated test board description',
    };

    const response = await request(app.getHttpServer())
      .put(`/boards/${createdBoardId}`)
      .set('Authorization', `Bearer ${token}`)
      .send(updateBoardDto)
      .expect(200);

    expect(response.body).toHaveProperty('id');
    expect(response.body.id).toBe(createdBoardId);
    expect(response.body.title).toBe(updateBoardDto.title);
    expect(response.body.description).toBe(updateBoardDto.description);
  });

  it('should delete a board by ID (DELETE /boards/:id)', async () => {
    // Delete the board and expect a 200 OK response
    await request(app.getHttpServer())
      .delete(`/boards/${createdBoardId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
  });
  
});
