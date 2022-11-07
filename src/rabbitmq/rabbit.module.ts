import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { Module } from '@nestjs/common';
import { RabbitConfigService } from '@src/config/rabbit.config';
import { RabbitService } from './rabbit.service';

@Module({
  imports: [
    RabbitMQModule.forRootAsync(RabbitMQModule, {
      useClass: RabbitConfigService,
    }),
  ],
  providers: [RabbitService],
})
export class RabbitModule {}
