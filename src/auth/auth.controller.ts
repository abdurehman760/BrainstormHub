import { Controller, Post, Body, UseGuards, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Register a new user
  @Post('register')
  async register(@Body() body: { email: string; password: string }) {
    return await this.authService.register(body.email, body.password);
  }

  // Login an existing user
  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    return await this.authService.login(body.email, body.password);
  }

  // Protected route to get the current user's data
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getCurrentUser() {
    return await this.authService.getCurrentUser();
  }
}
