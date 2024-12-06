// src/comments/comments.module.ts
import { Module } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { PrismaModule } from '../prisma/prisma.module'; // Import PrismaModule
import { JwtModule } from '@nestjs/jwt'; // Import JwtModule
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // Import JwtAuthGuard

@Module({
  imports: [
    PrismaModule,  // Import PrismaModule
    JwtModule.register({
      secret: process.env.JWT_SECRET_KEY, // Make sure to use your secret key
      signOptions: { expiresIn: '60m' }, // Set appropriate expiration time
    }),
  ], 
  providers: [CommentsService, JwtAuthGuard], // Provide JwtAuthGuard
  controllers: [CommentsController],
})
export class CommentsModule {}
