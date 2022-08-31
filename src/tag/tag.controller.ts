import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Tag } from 'src/db/entities/tag.entity';
import { TagLangDto } from 'src/dto/TagDto';
import { TagService } from './tag.service';

@ApiTags('tag')
@Controller('tag')
export class TagController {
  constructor(private readonly tagService: TagService) {}

  @Get('all')
  @ApiOkResponse({
    type: [Tag],
  })
  getAllTags(@Query() dto: TagLangDto): Promise<Tag[]> {
    console.log(dto);
    return this.tagService.findAll(dto);
  }
}
