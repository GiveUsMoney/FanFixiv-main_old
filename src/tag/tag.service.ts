import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TagEntity, TagNameEntity } from '@src/entities/tag.entity';
import { LimitDto, TagDto } from '@src/dto/tag.dto';
import { Repository } from 'typeorm';
import { UserProfile } from '@src/dto/user.dto';

@Injectable()
export class TagService {
  constructor(
    @InjectRepository(TagEntity)
    private tagRepository: Repository<TagEntity>,
  ) {}

  /**
   * 모든 사용중인 태그를 리턴
   * @param user IProfile
   * @param user.birth 사용자의 생일
   * @param dto LimitDTO
   * @param dto.limit 검색 개수 제한
   * @return 태그 목록
   */
  findAll(user: UserProfile, dto: LimitDto): Promise<TagEntity[]> {
    return this.tagRepository
      .createQueryBuilder('tag')
      .where('tag.status')
      .andWhere(
        `not tag."is_adult" 
        or (
          tag."is_adult" and EXTRACT( year FROM age(CURRENT_DATE, :birth)) >= 18) `,
        {
          birth: user?.birth ?? '3000-01-01',
        },
      )
      .orderBy('tag.name', 'ASC')
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
  find(user: UserProfile | null, dto: TagDto): Promise<TagEntity[]> {
    return this.tagRepository
      .createQueryBuilder('tag')
      .innerJoin(TagNameEntity, 'tn', 'tn.type_seq = tag.type::text')
      .where('tag.status')
      .andWhere(
        `not tag."is_adult" 
        or (
          tag."is_adult" and EXTRACT( year FROM age(CURRENT_DATE, :birth)) >= 18)`,
        {
          birth: user?.birth ?? '3000-01-01',
        },
      )
      .andWhere("concat(tn.type_name, ':', tag.name) ILIKE :search", {
        search: `%${dto.s}%`,
      })
      .orderBy('tag.name', 'ASC')
      .limit(dto.limit)
      .getMany();
  }
}
