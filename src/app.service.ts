import { Injectable } from '@nestjs/common';
import { TempData } from './interfaces/temp.interface';

/**
 *  테스트용 서비스입니다. 후일 삭제해 주세요.
 */
@Injectable()
export class AppService {
  private ID = 0;

  /**
   * 테스트용 API입니다. 후일 삭제해주세요.
   */
  getHello(): string {
    return 'Hello World!';
  }

  /**
   * 테스트용 API입니다. 후일 삭제해주세요.
   */
  getTemp(): TempData {
    return {
      id: this.ID++,
      content: 'Hello World!',
    };
  }
}
