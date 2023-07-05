import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SeriesEntity } from '@src/entities/series.entity';
import { UserProfile } from '@src/interfaces/user.interface';
import { ContentEntity } from '@src/entities/content.entity';

@Injectable()
export class SeriesService {
  constructor(
    @InjectRepository(SeriesEntity)
    private seriesRepository: Repository<SeriesEntity>,
    @InjectRepository(ContentEntity)
    private contentRepository: Repository<ContentEntity>,
  ) {}

  async getSeries(
    profile: UserProfile | null,
    seq: number,
  ): Promise<SeriesEntity> {
    const result = await this.seriesRepository
      .createQueryBuilder('series')
      .where('series.seq = :seq', { seq })
      .getOne();

    if (result == null) {
      throw new BadRequestException('해당 컨텐츠가 존재하지 않습니다.');
    }

    const contents = await this.contentRepository
      .createQueryBuilder('content')
      .where('(content.status)')
      .andWhere(
        `(not content."is_adult" 
        or (
          content."is_adult" and EXTRACT( year FROM age(CURRENT_DATE, :birth)) >= 18))`,
        {
          birth: profile?.birth ?? '3000-01-01',
        },
      )
      .andWhere('content.series_seq = :seq', { seq })
      .getMany();

    result.content = contents;

    return result;
  }
}
