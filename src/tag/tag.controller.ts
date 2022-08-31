import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Tag } from 'src/db/entities/tag.entity';
import { LimitDto, TagDto } from 'src/dto/TagDto';
import { TagService } from './tag.service';

@ApiTags('tag')
@Controller('tag')
export class TagController {
  constructor(private readonly tagService: TagService) {}

  @Get('all')
  @ApiOkResponse({
    type: [Tag],
  })
  getAllTags(@Query() dto: LimitDto): Promise<Tag[]> {
    return this.tagService.findAll(dto);
  }

  @Get()
  @ApiOkResponse({
    type: [Tag],
  })
  getTagsByText(@Query() dto: TagDto): Promise<Tag[]> {
    return this.tagService.find(dto);
  }
}
