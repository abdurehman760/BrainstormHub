import { Module } from '@nestjs/common';
import { IdeasService } from './ideas.service';
import { IdeasController } from './ideas.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from 'src/auth/auth.module';
import { ActivityGateway } from 'src/activity/activity.gateway';

@Module({
  imports: [PrismaModule, AuthModule],
  providers: [IdeasService, ActivityGateway],
  controllers: [IdeasController],
})
export class IdeasModule {}
