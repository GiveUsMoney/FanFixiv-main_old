import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Profile } from '@src/common/decorator/user.decorator';
import { UserProfile } from '@src/dto/user.dto';
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
  @ApiBearerAuth()
  @ApiQuery({
    type: LimitDto,
  })
  @ApiOkResponse({
    type: [TagDescriptionDto],
  })
  async getAllTags(
    @Profile() user: UserProfile | null,
    @Query() dto: LimitDto,
  ): Promise<TagDescriptionDto[]> {
    const items = await this.tagService.findAll(user, dto);
    return items.map((item) => new TagDescriptionDto(item));
  }

  @Get()
  @ApiBearerAuth()
  @ApiQuery({
    type: TagDto,
  })
  @ApiOkResponse({
    type: [TagResultDto],
  })
  async getTagsByText(
    @Profile() user: UserProfile | null,
    @Query() dto: TagDto,
  ): Promise<TagResultDto[]> {
    const items = await this.tagService.find(user, dto);
    return items.map((item) => new TagResultDto(item));
  }
}
