import {
  IsString as _IsString,
  IsInt as _IsInt,
  Min as _Min,
} from 'class-validator';

export const IsString = () =>
  _IsString({
    message: '$property가 문자열이 아닙니다.',
  });

export const IsInt = () =>
  _IsInt({
    message: '$property가 int형이 아닙니다.',
  });

export const Min = (value: number) =>
  _Min(value, {
    message: `$property가 너무 작습니다. (최소 ${value} 이상)`,
  });
