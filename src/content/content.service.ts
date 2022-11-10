import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ContentEntity } from '@src/entities/content.entity';
import { ContentDto } from '@src/dto/content.dto';
import { Repository } from 'typeorm';
import { UserProfile } from '@src/dto/user.dto';
import { TagEntity } from '@src/entities/tag.entity';
import { TagTypes } from '@src/interfaces/tag.interface';

@Injectable()
export class ContentService {
  constructor(
    @InjectRepository(ContentEntity)
    private contentRepository: Repository<ContentEntity>,
    @InjectRepository(TagEntity)
    private tagRepository: Repository<TagEntity>,
  ) {
    this.tagRepository
      .find({
        select: ['seq', 'name'],
        where: {
          type: TagTypes.EXTRA,
        },
      })
      .then((tags) => {
        this.EXTAR_TAGS = tags;
      });
  }

  private EXTAR_TAGS: TagEntity[] = [];

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
    user: UserProfile | null,
    dto: ContentDto,
  ): Promise<ContentEntity[]> {
    const { count, page } = dto;
    const tags = dto.tags ?? [];
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

    if (tags.length != 0) {
      const exTagIndex = this.EXTAR_TAGS.map((x) => x.seq);
      const nTags = tags.filter((x) => exTagIndex.indexOf(x) < 0);
      const exTags = tags.filter((x) => exTagIndex.indexOf(x) >= 0);

      if (nTags.length) {
        result = result.andWhere(
          `"content_seq" in (
            select "content_seq" from "tb_content_tag_reg"
            where "tag_seq" in (:...idx)
            group by "content_seq"
            having count("tag_seq") >= :len
          )`,
          {
            idx: nTags,
            len: nTags.length,
          },
        );
      }
      if (exTags.length != 0) {
        // TODO: 엑스트라 태그 별로 로직이 필요.
      }
    }

    result = result
      .orderBy('content_created_at', 'DESC')
      .limit(count)
      .skip(skip);

    return result.getMany();
  }
}
