import { RabbitRPC } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';

@Injectable()
export class RabbitService {
  @RabbitRPC({
    exchange: 'fanfixiv.main',
    routingKey: 'profile-img.form',
    queue: 'profile-img.form',
  })
  public async rpcHandler(msg: any) {
    console.log(msg);
    return { response: 42 };
  }
}
