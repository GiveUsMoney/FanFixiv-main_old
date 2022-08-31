import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Tag } from 'src/db/entities/tag.entity';
import { TagLangDto } from 'src/dto/TagDto';
import { Repository } from 'typeorm';

@Injectable()
export class TagService {
  constructor(
    @InjectRepository(Tag)
    private tagRepository: Repository<Tag>,
  ) {}

  findAll(dto: TagLangDto): Promise<Tag[]> {
    return this.tagRepository
      .createQueryBuilder('tag')
      .leftJoinAndSelect('tag.names', 'names')
      .where('tag.using = true')
      .andWhere('names.lang = :lang', { lang: dto.lang })
      .getMany();
  }
}
