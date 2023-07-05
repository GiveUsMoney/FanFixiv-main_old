import { Module } from '@nestjs/common';
import { RabbitService } from './rabbit.service';

@Module({
  providers: [RabbitService],
})
export class RabbitModule {}
