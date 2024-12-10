//src\boards\boards.module.ts

import { Module } from '@nestjs/common';
import { BoardsController } from './boards.controller';
import { BoardsService } from './boards.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { ActivityGateway } from '../activity/activity.gateway';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [BoardsController],
  providers: [BoardsService, ActivityGateway],
})
export class BoardsModule {}
