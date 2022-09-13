import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';
import { TempDataDto } from './dto/TempDataDto';

/**
 * 테스트용 Controller
 */
@ApiTags('temp')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /**
   * 테스트용 API입니다. 후일 삭제해주세요.
   */
  @Get()
  @ApiOkResponse({
    type: String,
  })
  getHello(): string {
    return this.appService.getHello();
  }

  /**
   * 테스트용 API입니다. 후일 삭제해주세요.
   */
  @Get('/temp')
  @ApiOkResponse({
    type: TempDataDto,
  })
  getTemp(): TempDataDto {
    return this.appService.getTemp();
  }
}
