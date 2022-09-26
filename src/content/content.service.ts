import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Content } from '@src/db/entities/content.entity';
import { ContentDto } from '@src/dto/ContentDto';
import { Repository } from 'typeorm';

@Injectable()
export class ContentService {
  constructor(
    @InjectRepository(Content)
    private contentRepository: Repository<Content>,
  ) {}

  /** @return 컨텐츠 개수 */
  getContentCount(): Promise<number> {
    return this.contentRepository.count();
  }

  /**
   * @param dto 컨텐츠 DTO
   * @param dto.count 출력할 컨텐츠 수
   * @param dto.page 표시할 페이지 번호
   * @return 컨텐츠 목록
   */
  getContent(dto: ContentDto): Promise<Content[]> {
    const { count, page } = dto;
    const skip = count * (page - 1);
    return this.contentRepository.find({
      relations: ['tags'],
      order: {
        seq: 'ASC',
      },
      take: count,
      skip,
    });
  }
}
