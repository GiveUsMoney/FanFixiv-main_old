import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Profile, User } from '@src/common/decorator/user.decorator';
import { UserProfile } from '@src/interfaces/user.interface';
import {
  LimitDto,
  TagDescriptionDto,
  TagDto,
  TagResultDto,
} from '@src/dto/tag.dto';
import { TagService } from './tag.service';
import { TagRequestDto } from '@src/dto/tag-request.dto';
import { Roles } from '@src/common/decorator/roles.decorator';
import { Role } from '@src/common/enum/roles.enum';

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

  @Post()
  @Roles(Role.USER)
  @ApiBearerAuth()
  @ApiBody({ type: TagRequestDto })
  async tagRequest(
    @User() user: number,
    @Body() dto: TagRequestDto,
  ): Promise<TagDescriptionDto> {
    const tag = await this.tagService.insert(user, dto);
    return new TagDescriptionDto(tag);
  }
}
