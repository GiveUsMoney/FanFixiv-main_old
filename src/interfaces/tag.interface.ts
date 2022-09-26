export interface ITag {
  type: TagTypes;
  name: string;
  description: string;
  status: boolean;
  isAdult: boolean;
}

export enum Language {
  KR = 'kr',
  JP = 'jp',
  ENG = 'eng',
}

export enum TagTypes {
  ARTIST,
  SERIES,
  CHARACTOR,
  ATTRIBUTE,
  LANGUAGE,
}
