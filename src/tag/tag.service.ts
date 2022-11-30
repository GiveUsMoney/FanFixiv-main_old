import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TagEntity, TagNameEntity } from '@src/entities/tag.entity';
import { LimitDto, TagDto, TagListDto } from '@src/dto/tag.dto';
import { DataSource, Repository } from 'typeorm';
import { UserProfile } from '@src/interfaces/user.interface';
import { TagRequestDto } from '@src/dto/tag-request.dto';
import { TagSearchTypes, TagTypes } from '@src/interfaces/tag.interface';
import { ArtistProfileEntity } from '@src/entities/artist-profile.entity';

@Injectable()
export class TagService {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(TagEntity)
    private tagRepository: Repository<TagEntity>,
  ) {}

  /**
   * 모든 사용중인 태그를 리턴
   * @param user UserProfile
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
        `(not tag."is_adult" 
        or (
          tag."is_adult" and EXTRACT( year FROM age(CURRENT_DATE, :birth)) >= 18))`,
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
   * @param user UserProfile
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
        `(not tag."is_adult" 
        or (
          tag."is_adult" and EXTRACT( year FROM age(CURRENT_DATE, :birth)) >= 18))`,
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

  /**
   * 태그의 상세 정보를 리턴
   * @param user IProfile
   * @param user.birth 사용자의 생일
   * @param seq 태그 고유 번호
   * @return 태그 상세
   */
  findDetail(user: UserProfile | null, seq: number): Promise<TagEntity> {
    return this.tagRepository
      .createQueryBuilder('tag')
      .leftJoinAndSelect('tag.profiles', 'profile')
      .where('tag.status')
      .andWhere(
        `(not tag."is_adult" 
        or (
          tag."is_adult" and EXTRACT( year FROM age(CURRENT_DATE, :birth)) >= 18))`,
        {
          birth: user?.birth ?? '3000-01-01',
        },
      )
      .andWhere('tag.seq = :seq', { seq })
      .orderBy('profile.seq', 'ASC')
      .getOne();
  }

  /**
   * 키워드와 일치하는 태그를 찾아서 리턴
   * @param user IProfile
   * @param user.birth 사용자의 생일
   * @param dto 태그 고유 번호
   * @param dto.type 태그 종류
   * @param dto.stype 검색 유형
   * @param dto.s 검색 키워드
   * @param dto.limit 검색 개수 제한
   * @return 태그 상세
   */
  findList(user: UserProfile, dto: TagListDto) {
    if (dto.type !== TagTypes.ARTIST && dto.stype === TagSearchTypes.PROFILE)
      throw new BadRequestException(
        '해당 태그에는 프로필 검색을 할수 없습니다.',
      );

    let result = this.tagRepository
      .createQueryBuilder('tag')
      .leftJoinAndSelect('tag.profiles', 'profile')
      .where('tag.status')
      .andWhere(
        `(not tag."is_adult" 
        or (
          tag."is_adult" and EXTRACT( year FROM age(CURRENT_DATE, :birth)) >= 18))`,
        {
          birth: user?.birth ?? '3000-01-01',
        },
      )
      .andWhere('tag.type = :type', { type: dto.type });

    switch (dto.stype) {
      case TagSearchTypes.NAME:
        result = result.andWhere('tag.name LIKE :search', {
          search: `%${dto.s}%`,
        });
        break;
      case TagSearchTypes.PROFILE:
        result = result.andWhere('profile.artistProfile LIKE :search', {
          search: `%${dto.s}%`,
        });
        break;
      case TagSearchTypes.DESCRIPTION:
        result = result.andWhere('tag.description LIKE :search', {
          search: `%${dto.s}%`,
        });
        break;
    }

    return result.orderBy('tag.name', 'ASC').limit(dto.limit).getMany();
  }

  /**

   */
  async insert(user: number, dto: TagRequestDto): Promise<TagEntity> {
    if (dto.type == TagTypes.ARTIST && dto.profiles == undefined) {
      throw new BadRequestException(
        '원작자 태그는 원작자 프로필 링크가 필요합니다.',
      );
    }

    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    let result: TagEntity;

    try {
      result = await queryRunner.manager.save(
        new TagEntity({
          ...dto,
          requester: user,
          status: false,
        }),
      );

      for (const x in dto.profiles) {
        await queryRunner.manager.save(
          new ArtistProfileEntity({
            tag: result,
            artistProfile: dto.profiles[x],
          }),
        );
      }

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException('중복되는 태그가 이미 존재합니다.');
    } finally {
      await queryRunner.release();
    }

    return result;
  }
}
