export interface ITag {
  type: string;
  name: string;
  describe: string;
  using: boolean;
}

export enum Language {
  KR = 'kr',
  JP = 'jp',
  ENG = 'eng',
}

export enum TagTypes {
  ARTIST = '원작자',
  SERIES = '시리즈',
  CHARACTOR = '캐릭터',
  ATTRIBUTE = '속성',
  LANGUAGE = '언어',
}
