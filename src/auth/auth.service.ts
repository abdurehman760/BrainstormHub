// src/auth/auth.service.ts
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { supabase } from '../config/supabase.config';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private userService: UserService,
  ) {}

  // Register a new user
  async register(email: string, password: string, username?: string) {
    // Create user in Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    // Check if `data` contains the user
    const supabaseId = data?.user?.id; // user id will be inside data.user

    if (!supabaseId) {
      throw new Error('User ID not found in Supabase response');
    }

    // Create the user in the database (using Prisma)
    const createdUser = await this.userService.createUser({
      email,
      password,
      username,
      supabaseId, // Store Supabase's user ID as `supabaseId`
    });

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

    const supabaseId = data?.user?.id;
    const payload = { sub: supabaseId, email: data?.user?.email };
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
