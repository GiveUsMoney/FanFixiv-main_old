import { BadRequestException, Injectable } from '@nestjs/common';
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

  private snakeToCamel(str: string) {
    return str
      .toLowerCase()
      .replace(/([-_][a-z])/g, (group) =>
        group.toUpperCase().replace('-', '').replace('_', ''),
      );
  }

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
  async getContents(
    user: number,
    profile: UserProfile | null,
    dto: ContentDto,
  ): Promise<[ContentEntity[], number]> {
    if (this.EXTAR_TAGS.length === 0) await this.setExtraTags();

    const { count, page } = dto;
    const tags = dto.tags ?? [];
    const skip = count * (page - 1);

    let content = this.contentRepository
      .createQueryBuilder('content')
      .leftJoinAndSelect(
        (sub) =>
          sub
            .subQuery()
            .select([
              '"tmp"."seq" as "tag_seq"',
              '"tmp"."c_seq" as "c_seq"',
              '"tmp"."count_rank" as "count_rank"',
              '"tmp"."type" as "tag_type"',
              '"tmp"."name" as "tag_name"',
              '"tmp"."status" as "tag_status"',
            ])
            .from(
              (sub) =>
                sub
                  .subQuery()
                  .select('"reg"."content_seq"', 'c_seq')
                  .addSelect(
                    `rank() 
                    over(partition by reg.content_seq order by tag_count.count desc, tag_count.seq asc)`,
                    'count_rank',
                  )
                  .from('tb_content_tag_reg', 'reg')
                  .leftJoinAndSelect(
                    (sub) =>
                      sub
                        .select('"tag".*')
                        .addSelect('count(tag.seq) as count')
                        .from(TagEntity, 'tag')
                        .innerJoin(
                          'tb_content_tag_reg',
                          'reg',
                          '"reg"."tag_seq" = "tag"."seq"',
                        )
                        .where(`tag.type <> '0'::tb_tag_type_enum`)
                        .groupBy('"tag"."seq"'),
                    'tag_count',
                    '"tag_count"."seq" = "reg"."tag_seq"',
                  ),
              'tmp',
            )
            .where('"tmp"."count_rank" <= 3'),
        'tag',
        '"tag"."c_seq" = "content"."seq"',
      )
      .leftJoinAndSelect('content.artist', 'artist')
      .leftJoin(
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
      .leftJoin(
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
      .where('(tag.tag_status or tag.tag_status is null)')
      .andWhere(
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
          return this.EXTAR_TAGS.find((x) => x.seq === idx).extraTag;
        });
        if (exTagTypes.includes(ExtraTagTypes.POPULARITY)) {
          content = content.andWhere('"like"."like" >= 5');
        }
        if (exTagTypes.includes(ExtraTagTypes.LIKES)) {
          content = content.andWhere('"do_like"."do_like"');
        }
      }
    }

    content = content
      .orderBy('content_created_at', 'DESC')
      .addOrderBy('"tag"."count_rank"', 'ASC')
      .addOrderBy('"tag"."tag_seq"', 'ASC');

    const rawResult = await content.getRawMany();

    const result = rawResult.reduce((act, cur) => {
      const r = Object.entries(cur).reduce(
        (o, [k, v]) => {
          if (k.includes('content_')) {
            o[this.snakeToCamel(k.replace('content_', ''))] = v;
          } else if (k.includes('artist_')) {
            o.artist[this.snakeToCamel(k.replace('artist_', ''))] = v;
          } else if (k.includes('tag_')) {
            o.tags[0][this.snakeToCamel(k.replace('tag_', ''))] = v;
          }
          return o;
        },
        { tags: [{}], artist: {} } as any,
      );

      if (r.tags[0].seq === null) {
        r.tags = [];
      }

      const x = act.find((x) => x.seq === r.seq);

      if (x == undefined) {
        act.push(r);
      } else {
        x.tags.push(r.tags[0]);
      }
      return act;
    }, []);

    return [result.slice(skip, skip + count), result.length];
  }

  /**
   * @param user 사용자 고유번호
   * @param profile IProfile
   * @param profile.birth 사용자의 생일
   * @param seq 컨텐츠 SEQ
   * @return 컨텐츠 목록
   */
  async getContent(
    user: number,
    profile: UserProfile | null,
    seq: number,
  ): Promise<ContentEntity> {
    const result = await this.contentRepository
      .createQueryBuilder('content')
      .leftJoinAndSelect('content.tags', 'tag')
      .leftJoinAndSelect('content.source', 'source')
      .leftJoinAndSelect('content.series', 'series')
      .leftJoin(
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
      .leftJoin(
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
      .where('(tag.status or tag.status is null)')
      .andWhere('(content.status)')
      .andWhere(
        `(not content."is_adult" 
        or (
          content."is_adult" and EXTRACT( year FROM age(CURRENT_DATE, :birth)) >= 18))`,
        {
          birth: profile?.birth ?? '3000-01-01',
        },
      )
      .andWhere('content.seq = :seq', { seq })
      .getOne();

    if (result == null) {
      throw new BadRequestException('해당 컨텐츠가 존재하지 않습니다.');
    }

    return result;
  }
}
