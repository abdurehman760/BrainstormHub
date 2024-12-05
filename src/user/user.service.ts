// src/user/user.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { User } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  // Create a new user with hashed password
  async createUser(email: string, password: string, username?: string): Promise<User> {
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save user to the database (Prisma)
    return this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        username,
      },
    });
  }

  // Find user by email
  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }
}
