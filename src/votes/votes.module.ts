import { Module } from '@nestjs/common';
import { VotesController } from './votes.controller';
import { VotesService } from './votes.service';
import { PrismaModule } from '../prisma/prisma.module'; 
import { AuthModule } from 'src/auth/auth.module'; 
import { ActivityGateway } from 'src/activity/activity.gateway';

@Module({
  imports: [PrismaModule, AuthModule], 
  controllers: [VotesController],
  providers: [VotesService,ActivityGateway],
})
export class VotesModule {}
