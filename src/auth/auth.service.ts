// src/auth/auth.service.ts
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { supabase } from '../config/supabase.config';
import { UserService } from '../user/user.service'; // Import UserService

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private userService: UserService, // Inject UserService
  ) {}

  // Register a new user
async register(email: string, password: string, username?: string) {
  // Create user in Supabase Auth
  const { error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    throw new Error(error.message);
  }

  // Create the user in the database (using Prisma)
  const createdUser = await this.userService.createUser(email, password, username);

  return { user: createdUser }; // Returning the created user object
}


  // Login an existing user
  async login(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    // Generate a JWT token after successful login
    const payload = { sub: data?.user?.id, email: data?.user?.email };
    const accessToken = this.jwtService.sign(payload);

    return { accessToken }; // Return JWT token
  }

  // Get the current logged-in user
  async getCurrentUser() {
    const { data, error } = await supabase.auth.getUser();

    if (error) {
      throw new Error(error.message);
    }

    return data?.user || null;
  }
}
