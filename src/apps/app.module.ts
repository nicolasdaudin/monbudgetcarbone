import { Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ApiModule } from './api/api.module';



@Module({
  imports: [ApiModule]
})
export class AppModule { }
