import {
  Controller,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '@src/common/decorator/roles.decorator';
import { Profile, User } from '@src/common/decorator/user.decorator';
import { Role } from '@src/common/enum/roles.enum';
import { JwtAuthGuard } from '@src/common/guard/jwt-auth.guard';
import { LikeResultDto } from '@src/dto/likes.dto';
import { UserProfile } from '@src/dto/user.dto';
import { LikesService } from './like.service';

@ApiTags('likes')
@Controller('likes')
export class LikesController {
  constructor(private readonly likesService: LikesService) {}

  @Post(':content')
  @Roles(Role.USER)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async doLike(
    @User() userSeq: number,
    @Profile() profile: UserProfile,
    @Param('content', ParseIntPipe) content: number,
  ): Promise<LikeResultDto> {
    return this.likesService.doLike(userSeq, content, profile);
  }
}
