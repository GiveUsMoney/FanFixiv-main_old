import { Likes } from './likes.interface';
import { Tag } from './tag.interface';

export interface Content {
  title: string;
  thumbnail: string;
  translateReview: string;
  isAdult: boolean;
  status: boolean;
  like: number;
  doLike: boolean;
  artist: Tag;
  tags: Tag[];
  likes: Likes[];
  source: ContentSource[];
  series: Series;
}

export interface ContentSource {
  type: SourceType;
  link: string;
  content: Content;
}

export interface Series {
  title: string;
  content: Content[];
}

export enum SourceType {
  ARTIST,
  TRANSLATOR,
}
