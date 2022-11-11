import { Controller, Get } from '@nestjs/common';
import { Query } from '@nestjs/common/decorators';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Profile, User } from '@src/common/decorator/user.decorator';
import { ContentDto, ContentResultDto } from '@src/dto/content.dto';
import { UserProfile } from '@src/dto/user.dto';
import { ContentService } from './content.service';

/**
 * 컨텐츠 Controller
 *
 * - GET /content
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
  async getContent(
    @User() user: number,
    @Profile() profile: UserProfile | null,
    @Query() dto: ContentDto,
  ): Promise<ContentResultDto> {
    const [contents, count] = await this.contentService.getContent(
      user,
      profile,
      dto,
    );
    const page = Math.ceil(count / dto.count);
    return new ContentResultDto(page, contents);
  }
}
