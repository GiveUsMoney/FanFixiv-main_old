import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { Equals, IsEmpty, IsInt, IsString } from '@src/common/validator';
import { IsEnum, IsOptional } from 'class-validator';
import { BaseDto } from './base.dto';
import {
  ContentReportType,
  Report,
  ReportType,
  UserReportType,
} from '@src/interfaces/report.interface';

export class ReportDto extends BaseDto implements Report {
  @IsEnum(ReportType)
  @Transform(({ value }) => ReportType[value])
  @ApiProperty({
    enum: ReportType,
    description: '신고 유형',
  })
  type: ReportType;

  reportType: ContentReportType | UserReportType;

  @IsEmpty()
  reporter: number;

  @IsInt()
  @Transform(({ value }) => parseInt(value))
  @ApiProperty({
    type: Number,
    description: '신고 대상',
  })
  target: number;

  @IsOptional()
  @IsString()
  @ApiProperty({
    type: String,
    description: '신고에 대한 상세 내용',
    required: false,
  })
  detail: string;
}

export class ReportContentDto extends ReportDto {
  @Equals(ReportType.CONTENT)
  type: ReportType;

  @IsEnum(ContentReportType)
  @Transform(({ value }) => ContentReportType[value])
  @ApiProperty({
    enum: ContentReportType,
    description: '컨텐츠 신고 상세 유형',
  })
  reportType: ContentReportType;
}

export class ReportUserDto extends ReportDto {
  @Equals(ReportType.USER)
  type: ReportType;

  @IsEnum(UserReportType)
  @Transform(({ value }) => UserReportType[value])
  @ApiProperty({
    enum: UserReportType,
    description: '유저 신고 상세 유형',
  })
  reportType: UserReportType;
}

export class ReportResultDto extends BaseDto {
  @ApiProperty({
    type: String,
    description: '결과 메세지',
  })
  message: string;
}
