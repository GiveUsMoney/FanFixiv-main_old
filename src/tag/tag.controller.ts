import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiQuery, ApiTags } from '@nestjs/swagger';
import {
  LimitDto,
  TagDescribeDto,
  TagDto,
  TagResultDto,
} from '@src/dto/TagDto';
import { TagService } from './tag.service';

/**
 * 태그 컨트롤러
 *
 * - GET /tag
 * - GET /tag/all
 */
@ApiTags('tag')
@Controller('tag')
export class TagController {
  constructor(private readonly tagService: TagService) {}

  @Get('all')
  @ApiQuery({
    type: LimitDto,
  })
  @ApiOkResponse({
    type: [TagDescribeDto],
  })
  async getAllTags(@Query() dto: LimitDto): Promise<TagDescribeDto[]> {
    const items = await this.tagService.findAll(dto);
    return items.map((item) => new TagDescribeDto(item));
  }

  @Get()
  @ApiQuery({
    type: TagDto,
  })
  @ApiOkResponse({
    type: [TagResultDto],
  })
  async getTagsByText(@Query() dto: TagDto): Promise<TagResultDto[]> {
    const items = await this.tagService.find(dto);
    return items.map((item) => new TagResultDto(item));
  }
}
