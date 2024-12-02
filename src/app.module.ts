import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { BoardsModule } from './boards/boards.module';
import { PrismaService } from './prisma/prisma.service'; 


@Module({
  imports: [AuthModule, BoardsModule],
  controllers: [],
  providers: [PrismaService],
})
export class AppModule {}
