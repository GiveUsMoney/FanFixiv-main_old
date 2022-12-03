import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '@src/common/decorator/roles.decorator';
import { User } from '@src/common/decorator/user.decorator';
import { Role } from '@src/common/enum/roles.enum';
import { ReportContentDto, ReportResultDto } from '@src/dto/report.dto';
import { ReportService } from './report.service';

@ApiTags('report')
@Controller('report')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Post('content')
  @Roles(Role.USER)
  @ApiBearerAuth()
  @ApiBody({ type: ReportContentDto })
  @ApiOkResponse({ type: ReportResultDto })
  async getAllTags(
    @User() user: number,
    @Body() dto: ReportContentDto,
  ): Promise<ReportResultDto> {
    const result = this.reportService.reportContent(user, dto);
    return new ReportResultDto(result);
  }
}
