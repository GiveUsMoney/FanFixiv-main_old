import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ContentEntity } from '@src/entities/content.entity';
import { ContentDto } from '@src/dto/content.dto';
import { Repository } from 'typeorm';
import { UserProfile } from '@src/interfaces/user.interface';
import { TagEntity } from '@src/entities/tag.entity';
import { ExtraTagTypes, TagTypes } from '@src/interfaces/tag.interface';
import { LikesEntity } from '@src/entities/likes.entity';

@Injectable()
export class ContentService {
  constructor(
    @InjectRepository(ContentEntity)
    private contentRepository: Repository<ContentEntity>,
    @InjectRepository(TagEntity)
    private tagRepository: Repository<TagEntity>,
  ) {}

  private EXTAR_TAGS: TagEntity[] = [];

  async setExtraTags() {
    this.EXTAR_TAGS = await this.tagRepository.find({
      select: ['seq', 'extraTag'],
      where: {
        type: TagTypes.EXTRA,
      },
    });
  }

  /**
   * @param user 사용자 고유번호
   * @param profile IProfile
   * @param profile.birth 사용자의 생일
   * @param dto 컨텐츠 DTO
   * @param dto.count 출력할 컨텐츠 수
   * @param dto.page 표시할 페이지 번호
   * @param dto.tags 검색할 태그들
   * @return 컨텐츠 목록
   */
  async getContent(
    user: number,
    profile: UserProfile | null,
    dto: ContentDto,
  ): Promise<[ContentEntity[], number]> {
    if (!this.EXTAR_TAGS) await this.setExtraTags();

    const { count, page } = dto;
    const tags = dto.tags ?? [];
    const skip = count * (page - 1);

    let content = this.contentRepository
      .createQueryBuilder('content')
      .leftJoinAndSelect('content.tags', 'tag')
      .leftJoinAndSelect(
        (sub) =>
          sub
            .subQuery()
            .select('like.content_seq', 'like_content_seq')
            .addSelect('COUNT(seq)', 'like')
            .from(LikesEntity, 'like')
            .groupBy('like.content_seq'),
        'like',
        '"like"."like_content_seq" = content.seq',
      )
      .leftJoinAndSelect(
        (sub) =>
          sub
            .subQuery()
            .select('like.content_seq', 'like_content_seq')
            .addSelect('COUNT(seq) > 0', 'do_like')
            .from(LikesEntity, 'like')
            .where('like.user_seq = :user', { user })
            .groupBy('like.content_seq'),
        'do_like',
        '"do_like"."like_content_seq" = content.seq',
      )
      .addSelect('COALESCE("like"."like", 0)', 'content_like')
      .addSelect('COALESCE("do_like"."do_like", false)', 'content_do_like')
      .where(
        `(not content."is_adult" 
        or (
          content."is_adult" and EXTRACT( year FROM age(CURRENT_DATE, :birth)) >= 18))`,
        {
          birth: profile?.birth ?? '3000-01-01',
        },
      );

    if (tags.length != 0) {
      const exTagIndex = this.EXTAR_TAGS.map((x) => x.seq);
      const nTags = tags.filter((x) => !exTagIndex.includes(x));
      const exTags = tags.filter((x) => exTagIndex.includes(x));

      if (nTags.length) {
        content = content.andWhere(
          `"content"."seq" in (
            select "reg"."content_seq" from "tb_content_tag_reg" "reg"
            where "tag_seq" in (:...idx)
            group by "reg"."content_seq"
            having count("reg"."tag_seq") >= :len
          )`,
          {
            idx: nTags,
            len: nTags.length,
          },
        );
      }
      if (exTags.length != 0) {
        const exTagTypes = exTags.map((idx) => {
          return this.EXTAR_TAGS.find((x) => x.seq == idx).extraTag;
        });
        if (exTagTypes.includes(ExtraTagTypes.POPULARITY)) {
          content = content.andWhere('"like"."like" >= 5');
        }
        if (exTagTypes.includes(ExtraTagTypes.LIKES)) {
          content = content.andWhere('"do_like"."do_like"');
        }
      }
    }

    content = content.orderBy('content_created_at', 'DESC');

    const result = await content.getMany();

    return [result.slice(skip, skip + count), result.length];
  }
}
