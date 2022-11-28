export interface Report {
  type: ReportType;
  reportType: ContentReportType | UserReportType;
  target: number;
  reporter: number;
  detail: string;
}

export enum ReportType {
  CONTENT,
  USER,
}

export enum ContentReportType {
  TRANSLATE_ERROR,
  ADULT_CONTENT,
  NOT_ALLOWED_CONTENT,
  NOT_TRANSLATED,
  ADVERTISEMENT,
}

export enum UserReportType {
  BAD_NICKNAME,
  BAD_PROFILE_IMG,
  MACRO_BOT,
  ADVERTISEMENT_PAPERING,
}
