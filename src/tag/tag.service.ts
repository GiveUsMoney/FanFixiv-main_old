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

  findAll(dto: LimitDto): Promise<Tag[]> {
    return this.tagRepository
      .createQueryBuilder('tag')
      .where('tag.using = true')
      .limit(dto.limit)
      .getMany();
  }

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
