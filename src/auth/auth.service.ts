import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
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
    // Email format validation using regex
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      throw new BadRequestException('Invalid email format');
    }

    // Create user in Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    // Check if `data` contains the user
    const supabaseId = data?.user?.id;

    if (!supabaseId) {
      throw new InternalServerErrorException('User ID not found in Supabase response');
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
      throw new UnauthorizedException('Invalid login credentials');
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
      throw new UnauthorizedException(error.message);
    }

    return data?.user || null;
  }
}
