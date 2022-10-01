import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Tag, TagName } from '@src/entities/tag.entity';
import { LimitDto, TagDto } from '@src/dto/TagDto';
import { Repository } from 'typeorm';
import { IProfile } from '@src/dto/ProfileDto';

@Injectable()
export class TagService {
  constructor(
    @InjectRepository(Tag)
    private tagRepository: Repository<Tag>,
  ) {}

  /**
   * 모든 사용중인 태그를 리턴
   * @param user IProfile
   * @param user.birth 사용자의 생일
   * @param dto LimitDTO
   * @param dto.limit 검색 개수 제한
   * @return 태그 목록
   */
  findAll(user: IProfile, dto: LimitDto): Promise<Tag[]> {
    return this.tagRepository
      .createQueryBuilder('tag')
      .where('tag.status')
      .andWhere(
        `not tag."isAdult" 
        or (
          tag."isAdult" and EXTRACT( year FROM age(CURRENT_DATE, :birth)) >= 18) `,
        {
          birth: user?.birth ?? '3000-01-01',
        },
      )
      .limit(dto.limit)
      .getMany();
  }

  /**
   * 키워드와 일치하는 태그를 찾아서 리턴
   * @param user IProfile
   * @param user.birth 사용자의 생일
   * @param dto 태그 DTO
   * @param dto.s 검색 키워드
   * @param dto.limit 검색 개수 제한
   * @return 태그 목록
   */
  find(user: IProfile | null, dto: TagDto): Promise<Tag[]> {
    return this.tagRepository
      .createQueryBuilder('tag')
      .innerJoin(TagName, 'tn', 'tn.type_seq = tag.type::text')
      .where('tag.status')
      .andWhere(
        `not tag."isAdult" 
        or (
          tag."isAdult" and EXTRACT( year FROM age(CURRENT_DATE, :birth)) >= 18)`,
        {
          birth: user?.birth ?? '3000-01-01',
        },
      )
      .andWhere("concat(tn.type_name, ':', tag.name) ILIKE :search", {
        search: `%${dto.s}%`,
      })
      .limit(dto.limit)
      .getMany();
  }
}
