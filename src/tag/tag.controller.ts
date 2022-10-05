import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiQuery, ApiTags } from '@nestjs/swagger';
import { User } from '@src/common/decorator/user.decorator';
import { Profile } from '@src/dto/profile.dto';
import {
  LimitDto,
  TagDescriptionDto,
  TagDto,
  TagResultDto,
} from '@src/dto/tag.dto';
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
    type: [TagDescriptionDto],
  })
  async getAllTags(
    @User() user: Profile | null,
    @Query() dto: LimitDto,
  ): Promise<TagDescriptionDto[]> {
    const items = await this.tagService.findAll(user, dto);
    return items.map((item) => new TagDescriptionDto(item));
  }

  @Get()
  @ApiQuery({
    type: TagDto,
  })
  @ApiOkResponse({
    type: [TagResultDto],
  })
  async getTagsByText(
    @User() user: Profile | null,
    @Query() dto: TagDto,
  ): Promise<TagResultDto[]> {
    const items = await this.tagService.find(user, dto);
    return items.map((item) => new TagResultDto(item));
  }
}
