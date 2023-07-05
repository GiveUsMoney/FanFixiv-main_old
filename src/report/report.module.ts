import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { Module } from '@nestjs/common';
import { RabbitConfigService } from '@src/config/rabbit.config';
import { ReportController } from './report.controller';
import { ReportService } from './report.service';

@Module({
  imports: [
    RabbitMQModule.forRootAsync(RabbitMQModule, {
      useClass: RabbitConfigService,
    }),
  ],
  controllers: [ReportController],
  providers: [ReportService],
})
export class ReportModule {}
