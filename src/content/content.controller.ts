import { Controller, Get } from '@nestjs/common';
import { Query } from '@nestjs/common/decorators';
import { ApiTags } from '@nestjs/swagger';
import { ContentDto, ContentResultDto } from '@src/dto/ContentDto';
import { ContentService } from './content.service';

@ApiTags('content')
@Controller('content')
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @Get()
  async getContent(@Query() dto: ContentDto): Promise<ContentResultDto> {
    const items = await this.contentService.getContent(dto);
    const contents = items.map((item) => {
      item.like = 99; // <- 더미 좋아요 기능. 후일 삭제 예정
      return item;
    });
    const count = Math.ceil(
      (await this.contentService.getContentCount()) / dto.count,
    );
    return new ContentResultDto(count, contents);
  }
}
