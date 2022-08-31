import { IsEnum, IsString, IsOptional } from 'class-validator';
import { Language } from 'src/interfaces/tag.interface';

export class TagLangDto {
  @IsOptional()
  @IsEnum(Language, { each: true })
  lang: Language = Language.KR;
}

export class TagDto extends TagLangDto {
  @IsString()
  s: string;
}
