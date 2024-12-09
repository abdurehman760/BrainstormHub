import * as bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  // Method to create a user with Supabase ID
  async createUser(data: {
    email: string;
    password: string;
    username?: string;
    supabaseId: string;
  }) {
    // Hash the password before storing it
    const hashedPassword = await bcrypt.hash(data.password, 10); // 10 is the salt rounds

    // Create a user in Prisma with the hashed password and supabaseId
    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword, // Store the hashed password
        username: data.username || '', // If no username, store an empty string
        supabaseId: data.supabaseId, // Store Supabase user ID here
      },
    });

    return user;
  }

  // Additional user-related methods can be added as needed
}
