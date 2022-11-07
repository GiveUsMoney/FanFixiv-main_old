import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ModuleConfigFactory } from '@golevelup/nestjs-modules';
import { RabbitMQConfig } from '@golevelup/nestjs-rabbitmq';

@Injectable()
export class RabbitConfigService
  implements ModuleConfigFactory<RabbitMQConfig>
{
  constructor(private readonly configService: ConfigService) {}
  async createModuleConfig(): Promise<RabbitMQConfig> {
    return {
      exchanges: [
        {
          name: 'fanfixiv.main',
          type: 'direct',
        },
      ],
      uri: this.configService.get('MQ_URI'),
      connectionInitOptions: { wait: false },
    };
  }
}
