import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { BoardsModule } from './boards/boards.module';
import { PrismaModule } from './prisma/prisma.module';  // Import PrismaModule instead
import { IdeasModule } from './ideas/ideas.module';

@Module({
  imports: [AuthModule, BoardsModule, PrismaModule, IdeasModule], 
  controllers: [],
  providers: [],
})
export class AppModule {}
