import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { AuthModule } from '../../src/auth/auth.module';
import { JwtModule } from '@nestjs/jwt';

describe('AuthController (E2E)', () => {
  let app: INestApplication;
  let accessToken: string;
  let userData: { email: string; password: string; username: string };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AuthModule,
        JwtModule.register({
          secret: 'testsecret',
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

  // Successful Registration
  it('should register a new user successfully', async () => {
    const uniqueTimestamp = Date.now();
    userData = {
      email: `test-${uniqueTimestamp}@example.com`,
      password: 'password123',
      username: `testuser-${uniqueTimestamp}`,
    };

    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send(userData)
      .expect(HttpStatus.CREATED);

    expect(response.body).toHaveProperty('user');
    expect(response.body.user).toMatchObject({
      email: userData.email,
      username: userData.username,
    });
  });

  // Registration Failure: Invalid Email
  it('should fail to register with an invalid email format', async () => {
    const invalidUserData = {
      email: 'invalid-email',
      password: 'password123',
      username: 'invaliduser',
    };

    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send(invalidUserData)
      .expect(HttpStatus.BAD_REQUEST);

    expect(response.body.message).toContain('Invalid email format');
  });

  // Successful Login
  it('should login an existing user successfully and return a JWT token', async () => {
    const loginData = {
      email: userData.email,
      password: userData.password,
    };

    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send(loginData)
      .expect(HttpStatus.CREATED);

    expect(response.body).toHaveProperty('accessToken');
    accessToken = response.body.accessToken;
  });

  // Login Failure: Wrong Credentials
  it('should fail to login with incorrect credentials', async () => {
    const wrongLoginData = {
      email: userData.email,
      password: 'wrongpassword',
    };

    await request(app.getHttpServer())
      .post('/auth/login')
      .send(wrongLoginData)
      .expect(HttpStatus.UNAUTHORIZED);
  });

  // Successful Fetch Current User
  it('should get the current logged-in user', async () => {
    expect(accessToken).toBeDefined();

    const response = await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(HttpStatus.OK);

    expect(response.body).toHaveProperty('email', userData.email);
  });

  // Fetch Current User Failure: No Token
  it('should fail to get current user without a token', async () => {
    await request(app.getHttpServer())
      .get('/auth/me')
      .expect(HttpStatus.UNAUTHORIZED);
  });

  // Fetch Current User Failure: Invalid Token
  it('should fail to get current user with an invalid token', async () => {
    await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', 'Bearer invalidtoken')
      .expect(HttpStatus.UNAUTHORIZED);
  });
});
