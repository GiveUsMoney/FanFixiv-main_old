import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { TempData } from './interfaces/temp.interface';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/temp')
  getTemp(): TempData {
    return this.appService.getTemp();
  }
}
