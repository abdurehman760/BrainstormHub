import { Module } from '@nestjs/common';
import { VotesController } from './votes.controller';
import { VotesService } from './votes.service';
import { PrismaModule } from '../prisma/prisma.module'; // Import Prisma module
import { AuthModule } from 'src/auth/auth.module'; // Import AuthModule for JWT functionality

@Module({
  imports: [PrismaModule, AuthModule], 
  controllers: [VotesController],
  providers: [VotesService],
})
export class VotesModule {}
