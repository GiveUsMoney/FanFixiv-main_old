import { Controller, Get, ParseIntPipe } from '@nestjs/common';
import { Param, Query } from '@nestjs/common/decorators';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Profile, User } from '@src/common/decorator/user.decorator';
import {
  ContentDetailDto,
  ContentDto,
  ContentResultDto,
  ContentViewDto,
} from '@src/dto/content.dto';
import { UserProfile } from '@src/interfaces/user.interface';
import { ContentService } from './content.service';

/**
 * 컨텐츠 Controller
 *
 * - GET /content
 * - GET /content/:seq
 * - GET /content/view/:seq
 */
@ApiTags('content')
@Controller('content')
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @Get()
  @ApiBearerAuth()
  @ApiQuery({
    type: ContentDto,
  })
  @ApiOkResponse({ type: ContentResultDto })
  async getContents(
    @User() user: number,
    @Profile() profile: UserProfile | null,
    @Query() dto: ContentDto,
  ): Promise<ContentResultDto> {
    const [content, count] = await this.contentService.getContents(
      user,
      profile,
      dto,
    );
    const pageCount = Math.ceil(count / dto.count);
    return new ContentResultDto({ pageCount, content });
  }

  @Get(':seq')
  @ApiBearerAuth()
  @ApiOkResponse({ type: ContentDetailDto })
  async getContent(
    @User() user: number,
    @Profile() profile: UserProfile | null,
    @Param('seq', ParseIntPipe) seq: number,
  ): Promise<ContentDetailDto> {
    const content = await this.contentService.getContent(user, profile, seq);
    return new ContentDetailDto(content);
  }

  @Get('view/:seq')
  @ApiBearerAuth()
  @ApiOkResponse({ type: ContentViewDto })
  async getContentView(
    @User() user: number,
    @Profile() profile: UserProfile | null,
    @Param('seq', ParseIntPipe) seq: number,
  ): Promise<ContentViewDto> {
    const content = await this.contentService.getContentView(
      user,
      profile,
      seq,
    );
    return new ContentViewDto(content);
  }
}
