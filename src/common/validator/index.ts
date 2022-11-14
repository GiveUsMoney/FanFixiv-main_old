import {
  IsString as _IsString,
  IsInt as _IsInt,
  Min as _Min,
  IsUrl as _IsUrl,
  IsEnum as _IsEnum,
  ValidationOptions,
} from 'class-validator';
import ValidatorJS from 'validator';

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

export const IsUrl = (
  options?: ValidatorJS.IsURLOptions,
  validationOptions?: ValidationOptions,
) =>
  _IsUrl(options, {
    message: `$property가 URL이 아닙니다.`,
    ...validationOptions,
  });

export const IsEnum = (entity: object, validationOptions?: ValidationOptions) =>
  _IsEnum(entity, {
    message: `$property가 ENUM에 해당하지 않습니다.`,
    ...validationOptions,
  });
