import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ContentEntity } from '@src/entities/content.entity';
import { ContentDto } from '@src/dto/content.dto';
import { Repository } from 'typeorm';
import { Profile } from '@src/dto/profile.dto';

@Injectable()
export class ContentService {
  constructor(
    @InjectRepository(ContentEntity)
    private contentRepository: Repository<ContentEntity>,
  ) {}

  /** @return 컨텐츠 개수 */
  getContentCount(): Promise<number> {
    return this.contentRepository.count();
  }

  /**
   * @param user IProfile
   * @param user.birth 사용자의 생일
   * @param dto 컨텐츠 DTO
   * @param dto.count 출력할 컨텐츠 수
   * @param dto.page 표시할 페이지 번호
   * @param dto.tags 검색할 태그들
   * @return 컨텐츠 목록
   */
  async getContent(
    user: Profile | null,
    dto: ContentDto,
  ): Promise<ContentEntity[]> {
    const { count, page } = dto;
    const skip = count * (page - 1);
    let result = this.contentRepository
      .createQueryBuilder('content')
      .leftJoinAndSelect('content.tags', 'tag')
      .andWhere(
        `not content."is_adult" 
        or (
          content."is_adult" and EXTRACT( year FROM age(CURRENT_DATE, :birth)) >= 18)`,
        {
          birth: user?.birth ?? '3000-01-01',
        },
      );

    if (dto.tags) {
      result = result.andWhere(
        `"content_seq" in (select "content_seq" from "tb_content_tag_reg"
        where "tag_seq" in (:...idx)
        group by "content_seq"
        having count("tag_seq") >= :len
      )`,
        {
          idx: dto.tags,
          len: dto.tags.length,
        },
      );
    }

    result = result
      .orderBy('content_created_at', 'DESC')
      .limit(count)
      .skip(skip);

    return result.getMany();
  }
}
