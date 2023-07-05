import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getAge } from '@src/common/utils/birth.utils';
import { LikeResultDto } from '@src/dto/likes.dto';
import { UserProfile } from '@src/interfaces/user.interface';
import { ContentEntity } from '@src/entities/content.entity';
import { LikesEntity } from '@src/entities/likes.entity';
import { Repository } from 'typeorm';

@Injectable()
export class LikesService {
  constructor(
    @InjectRepository(LikesEntity)
    private likesRepository: Repository<LikesEntity>,
    @InjectRepository(ContentEntity)
    private contentRepository: Repository<ContentEntity>,
  ) {}

  async doLike(
    userSeq: number,
    contentSeq: number,
    profile: UserProfile,
  ): Promise<LikeResultDto> {
    const content = await this.contentRepository.findOne({
      where: {
        seq: contentSeq,
      },
    });

    if (!content) {
      throw new HttpException(
        '존재하지 않는 컨텐츠입니다.',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (content.isAdult && getAge(profile.birth) >= 18) {
      throw new HttpException(
        '미성년자는 성인물 컨텐츠에 접근이 불가합니다.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const _like = await this.likesRepository.findOne({
      relations: ['content'],
      where: {
        userSeq,
        content: {
          seq: contentSeq,
        },
      },
    });

    if (!_like) {
      await this.likesRepository.save(
        new LikesEntity({
          userSeq,
          content,
        }),
      );
    } else {
      await this.likesRepository.remove(_like);
    }

    const like = await this.likesRepository.count({
      relations: ['content'],
      where: {
        userSeq,
        content: {
          seq: contentSeq,
        },
      },
    });

    return new LikeResultDto({ like });
  }
}
