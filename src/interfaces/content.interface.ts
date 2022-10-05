import { Tag } from './tag.interface';

export interface Content {
  title: string;
  thumbnail: string;
  translateReview: string;
  like: number;
  tags: Tag[];
}
