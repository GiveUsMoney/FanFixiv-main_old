import { ITag } from './tag.interface';

export interface IContent {
  title: string;
  thumbnail: string;
  translate_review: string;
  like: number;
  tags: ITag[];
}
