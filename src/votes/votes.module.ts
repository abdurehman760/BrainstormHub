import { Module } from '@nestjs/common';
import { VotesController } from './votes.controller';
import { VotesService } from './votes.service';
import { PrismaModule } from '../prisma/prisma.module'; 
import { AuthModule } from '../auth/auth.module'; 
import { ActivityGateway } from '../activity/activity.gateway';

@Module({
  imports: [PrismaModule, AuthModule], 
  controllers: [VotesController],
  providers: [VotesService,ActivityGateway],
})
export class VotesModule {}
