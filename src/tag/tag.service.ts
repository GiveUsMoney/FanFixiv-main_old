import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Tag } from '@src/db/entities/tag.entity';
import { LimitDto, TagDto } from '@src/dto/TagDto';
import { Repository } from 'typeorm';

@Injectable()
export class TagService {
  constructor(
    @InjectRepository(Tag)
    private tagRepository: Repository<Tag>,
  ) {}

  /**
   * 모든 사용중인 태그를 리턴
   * @param dto LimitDTO (limit : 검색 개수 제한)
   * @return 태그 목록
   */
  findAll(dto: LimitDto): Promise<Tag[]> {
    return this.tagRepository
      .createQueryBuilder('tag')
      .where('tag.using = true')
      .limit(dto.limit)
      .getMany();
  }

  /**
   * 키워드와 일치하는 태그를 찾아서 리턴
   * @param dto 태그 DTO (s : 검색 키워드, limit : 검색 개수 제한)
   * @return 태그 목록
   */
  find(dto: TagDto): Promise<Tag[]> {
    return this.tagRepository
      .createQueryBuilder('tag')
      .where('tag.using = true')
      .andWhere("concat(tag.type, ':', tag.name) ILIKE :search", {
        search: '%' + dto.s + '%',
      })
      .limit(dto.limit)
      .getMany();
  }
}
