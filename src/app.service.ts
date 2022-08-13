import { Injectable } from '@nestjs/common';
import { TempData } from './interfaces/temp.interface';

@Injectable()
export class AppService {
  private ID = 0;

  getHello(): string {
    return 'Hello World!';
  }

  getTemp(): TempData {
    return {
      id: this.ID++,
      content: 'Hello World!',
    };
  }
}
