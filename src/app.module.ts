import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { BoardsModule } from './boards/boards.module';
import { PrismaModule } from './prisma/prisma.module';  // Import PrismaModule instead
import { IdeasModule } from './ideas/ideas.module';
import { UserModule } from './user/user.module';
import { CommentsModule } from './comments/comments.module';

@Module({
  imports: [AuthModule, BoardsModule, PrismaModule, IdeasModule, UserModule, CommentsModule], 
  controllers: [],
  providers: [],
})
export class AppModule {}
