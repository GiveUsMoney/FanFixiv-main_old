export interface ITag {
  type: TagTypes;
  describe: string;
  using: boolean;
}

export interface ITagName {
  name: string;
  lang: Language;
}

export enum Language {
  KR = 'korea',
  JP = 'japan',
  ENG = 'english',
}

export enum TagTypes {
  ARTIST = 'artist',
  series = 'series',
  CHARACTOR = 'charactor',
  ATTRIBUTE = 'attribute',
  LANGUAGE = 'language',
}
