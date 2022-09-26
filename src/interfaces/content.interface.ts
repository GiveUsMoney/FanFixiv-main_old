import { ITag } from './tag.interface';

export interface IContent {
  title: string;
  thumbnail: string;
  translateReview: string;
  like: number;
  tags: ITag[];
}
