import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { UserInfo } from '@src/dto/user.dto';
import { Observable } from 'rxjs';
import { Request } from 'express';
import { ActionDto } from '@src/dto/action.dto';

@Injectable()
export class ActionInterceptor implements NestInterceptor {
  constructor(private readonly amqpConnection: AmqpConnection) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context
      .switchToHttp()
      .getRequest<Request & { user: UserInfo }>();
    const now = new Date();

    this.amqpConnection.publish<ActionDto>('fanfixiv.admin', 'main.action', {
      ip: req.ip,
      user: req.user ? parseInt(req.user.sub) : -1,
      path: req.path,
      data: req.method == 'POST' ? req.body : req.query,
      time: now.toISOString(),
    });

    return next.handle();
  }
}
