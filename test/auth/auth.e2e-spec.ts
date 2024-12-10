import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { AuthModule } from '../../src/auth/auth.module';  // Adjusted path
import { JwtModule } from '@nestjs/jwt';  // Correct import for JwtModule

describe('AuthController (E2E) - Registration', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AuthModule,
        JwtModule.register({
          secret: 'testsecret', // For testing purposes
          signOptions: { expiresIn: '1d' },
        }),
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('should register a new user successfully', async () => {
    // Ensure unique email and username for each test run
    const uniqueTimestamp = Date.now();
    const userData = {
      email: `test-${uniqueTimestamp}@example.com`, // Unique email using timestamp
      password: 'password123',
      username: `testuser-${uniqueTimestamp}`, // Unique username using timestamp
    };

    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send(userData)
      .expect(HttpStatus.CREATED);

    // Ensure the response contains the user details with the real generated `id`
    expect(response.body).toHaveProperty('user');
    expect(response.body.user).toMatchObject({
      email: userData.email,
      username: userData.username,
    });
  });
});
