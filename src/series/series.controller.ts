import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Profile } from '@src/common/decorator/user.decorator';
import { SeriesWithContentDto } from '@src/dto/series.dto';
import { UserProfile } from '@src/interfaces/user.interface';
import { SeriesService } from './series.service';

@ApiTags('series')
@Controller('series')
export class SeriesController {
  constructor(private readonly seriesService: SeriesService) {}

  @Get(':seq')
  @ApiBearerAuth()
  @ApiOkResponse({ type: SeriesWithContentDto })
  async getContent(
    @Profile() profile: UserProfile | null,
    @Param('seq', ParseIntPipe) seq: number,
  ): Promise<SeriesWithContentDto> {
    const result = await this.seriesService.getSeries(profile, seq);
    return new SeriesWithContentDto(result);
  }
}
