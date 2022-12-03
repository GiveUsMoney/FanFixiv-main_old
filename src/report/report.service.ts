import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';
import { ReportContentDto, ReportResultDto } from '@src/dto/report.dto';

@Injectable()
export class ReportService {
  constructor(private readonly amqpConnection: AmqpConnection) {}

  reportContent(user: number, dto: ReportContentDto): ReportResultDto {
    dto.reporter = user;
    try {
      this.amqpConnection.publish<ReportContentDto>(
        'fanfixiv.admin',
        'main.report',
        dto,
      );
      return new ReportResultDto({
        message: '신고가 성공적으로 완료되었습니다.',
      });
    } catch (e) {
      return new ReportResultDto({
        message: '신고가 실패하였습니다.',
      });
    }
  }
}
