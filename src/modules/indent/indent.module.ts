import { Module } from '@nestjs/common';
import { IndentService } from './indent.service';
import { IndentController } from './indent.controller';

@Module({
  controllers: [IndentController],
  providers: [IndentService],
  exports: [IndentService],
})
export class IndentModule {}