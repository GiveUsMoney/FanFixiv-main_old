import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Tag } from '@src/db/entities/tag.entity';
import {
  LimitDto,
  TagDescribeDto,
  TagDto,
  TagResultDto,
} from '@src/dto/TagDto';
import { TagService } from './tag.service';

@ApiTags('tag')
@Controller('tag')
export class TagController {
  constructor(private readonly tagService: TagService) {}

  @Get('all')
  @ApiOkResponse({
    type: [Tag],
  })
  async getAllTags(@Query() dto: LimitDto): Promise<TagDescribeDto[]> {
    const items = await this.tagService.findAll(dto);
    return items.map((item) => new TagDescribeDto(item));
  }

  @Get()
  @ApiOkResponse({
    type: [Tag],
  })
  async getTagsByText(@Query() dto: TagDto): Promise<TagResultDto[]> {
    const items = await this.tagService.find(dto);
    return items.map((item) => new TagResultDto(item));
  }
}
