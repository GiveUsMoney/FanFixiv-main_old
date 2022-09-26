import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  BadRequestException,
} from '@nestjs/common';
import { Response } from 'express';

interface ErrorResponse {
  status: number;
  message: string;
  err: string[];
}

@Catch(BadRequestException)
export class BadRequestFilter implements ExceptionFilter {
  catch(exception: BadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const err = exception.getResponse()['message'];

    response.status(status).json({
      status,
      message: '입력된 값이 올바르지 않습니다.',
      err,
    } as ErrorResponse);
  }
}
