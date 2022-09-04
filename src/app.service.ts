import { Injectable } from '@nestjs/common';
import { ITempData } from './interfaces/temp.interface';

@Injectable()
export class AppService {
  private ID = 0;

  getHello(): string {
    return 'Hello World!';
  }

  getTemp(): ITempData {
    return {
      id: this.ID++,
      content: 'Hello World!',
    };
  }
}
