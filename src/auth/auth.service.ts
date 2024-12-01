import { Injectable } from '@nestjs/common';
import { supabase } from '../config/supabase.config';
import { User, AuthError } from '@supabase/supabase-js';

@Injectable()
export class AuthService {
  // Register a new user
  async register(email: string, password: string): Promise<User | AuthError> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    return data?.user;
  }

  // Login an existing user
  async login(email: string, password: string): Promise<User | AuthError> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    return data?.user;
  }

  // Get the current logged-in user
  async getCurrentUser(): Promise<User | null> {
    const { data, error } = await supabase.auth.getUser();

    if (error) {
      throw new Error(error.message);
    }

    return data?.user || null;
  }
}
