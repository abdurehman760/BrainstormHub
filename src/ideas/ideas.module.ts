import { Module } from '@nestjs/common';
import { IdeasService } from './ideas.service';
import { IdeasController } from './ideas.controller';
import { PrismaModule } from '../prisma/prisma.module'; 

@Module({
  imports: [PrismaModule],  
  providers: [IdeasService],
  controllers: [IdeasController],
})
export class IdeasModule {}
