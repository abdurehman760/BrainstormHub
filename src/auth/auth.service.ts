import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { supabase } from '../config/supabase.config';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  // Register a new user
  async register(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    return data?.user; // `data` contains the `user` object
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

  // Get the current logged-in user (using `getUser()` method)
  async getCurrentUser() {
    const { data, error } = await supabase.auth.getUser();

    if (error) {
      throw new Error(error.message);
    }

    return data?.user || null;
  }
}
