import { Test, TestingModule } from '@nestjs/testing';
import {
  ClassSerializerInterceptor,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import * as request from 'supertest';
import { ReportController } from '@src/report/report.controller';
import { ReportService } from '@src/report/report.service';
import {
  ContentReportType,
  ReportType,
} from '@src/interfaces/report.interface';
import { APP_INTERCEPTOR } from '@nestjs/core';

describe('ReportController (e2e)', () => {
  let app: INestApplication;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      controllers: [ReportController],
      providers: [
        {
          provide: APP_INTERCEPTOR,
          useClass: ClassSerializerInterceptor,
        },
      ],
    })
      .useMocker((token) => {
        if (token === ReportService) {
          return {
            reportContent: jest.fn().mockReturnValue({
              message: '신고가 성공적으로 완료되었습니다.',
            }),
          };
        }
      })
      .compile();

    app = module.createNestApplication();

    app.useGlobalPipes(new ValidationPipe({ transform: true }));

    await app.init();
  });

  describe('/report/content (POST)', () => {
    let result: Record<string, any>;

    beforeAll(async () => {
      result = {
        message: '신고가 성공적으로 완료되었습니다.',
      };
    });

    test('200', () => {
      const body = {
        type: ReportType[ReportType.CONTENT],
        reportType: ContentReportType.TRANSLATE_ERROR,
        target: 0,
        detail: '테스트 신고입니다.',
      };

      return request(app.getHttpServer())
        .post(`/report/content`)
        .set('Authorization', 'Bearer ADULT')
        .send(body)
        .expect(201)
        .expect(result);
    });

    test('400', () => {
      const body = {
        type: ReportType[ReportType.CONTENT],
        reportType: ContentReportType.TRANSLATE_ERROR,
        target: 'test',
        detail: '테스트 신고입니다.',
      };

      return request(app.getHttpServer())
        .post(`/report/content`)
        .set('Authorization', 'Bearer ADULT')
        .send(body)
        .expect(400);
    });
  });

  afterAll(async () => {
    await app.close();
    await module.close();
  });
});
