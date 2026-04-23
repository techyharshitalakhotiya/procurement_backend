import { Module } from '@nestjs/common';
import { MIService } from './mi.service';
import { MIController } from './mi.controller';

@Module({
  controllers: [MIController],
  providers: [MIService],
  exports: [MIService],
})
export class MIModule {}