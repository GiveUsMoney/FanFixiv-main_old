import { IsInt, IsString, IsOptional } from 'class-validator';

export class LimitDto {
  @IsOptional()
  @IsInt()
  limit: number;
}
export class TagDto extends LimitDto {
  @IsString()
  s: string;

  limit = 5;
}
