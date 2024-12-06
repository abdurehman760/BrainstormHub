import { Module } from '@nestjs/common';
import { BoardsController } from './boards.controller';
import { BoardsService } from './boards.service';
import { PrismaModule } from '../prisma/prisma.module'; 
import { AuthModule } from 'src/auth/auth.module';


@Module({
  imports: [PrismaModule,AuthModule],
  controllers: [BoardsController],
  providers: [BoardsService,]
})
export class BoardsModule {}
