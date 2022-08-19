import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';
import { TempDataDto } from './dto/TempDataDto';

@ApiTags('temp')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOkResponse({
    type: String,
  })
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/temp')
  @ApiOkResponse({
    type: TempDataDto,
  })
  getTemp(): TempDataDto 
  
  
  
  
  
  
  
  
  {
    var bar = true;
    return this.appService.getTemp();
  }
}
