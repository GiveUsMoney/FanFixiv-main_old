import {
  IsString as _IsString,
  IsInt as _IsInt,
  Min as _Min,
  IsUrl as _IsUrl,
  ValidationOptions,
} from 'class-validator';

export const IsString = (validationOptions?: ValidationOptions) =>
  _IsString({
    message: '$property가 문자열이 아닙니다.',
    ...validationOptions,
  });

export const IsInt = (validationOptions?: ValidationOptions) =>
  _IsInt({
    message: '$property가 int형이 아닙니다.',
    ...validationOptions,
  });

export const Min = (value: number) =>
  _Min(value, {
    message: `$property가 너무 작습니다. (최소 ${value} 이상)`,
  });

export const IsUrl = () =>
  _IsUrl({
    message: `$property가 URL이 아닙니다.`,
  });
