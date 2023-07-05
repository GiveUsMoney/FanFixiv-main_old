export interface Tag {
  type: TagTypes;
  name: string;
  description: string;
  status: boolean;
  isAdult: boolean;
  requester: number;
  profiles?: ArtistProfile[];
}

export interface TagRequest {
  type: TagTypes;
  name: string;
  description: string;
  isAdult?: boolean;
  artistProfile?: string[];
}

export interface ArtistProfile {
  artistProfile: string;
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
  EXTRA,
}

export enum TagSearchTypes {
  NAME,
  PROFILE,
  DESCRIPTION,
}

export enum ExtraTagTypes {
  POPULARITY,
  LIKES,
}
