import {
  IsString as _IsString,
  IsInt as _IsInt,
  Min as _Min,
  IsUrl as _IsUrl,
  IsEnum as _IsEnum,
  IsBoolean as _IsBoolean,
  IsEmpty as _IsEmpty,
  Equals as _Equals,
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

export const IsBoolean = (validationOptions?: ValidationOptions) =>
  _IsBoolean({
    message: '$property가 boolean형이 아닙니다.',
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

export const IsEmpty = (validationOptions?: ValidationOptions) =>
  _IsEmpty({
    message: `$property는 공란이어야 합니다.`,
    ...validationOptions,
  });

export const Equals = (
  comparison: any,
  validationOptions?: ValidationOptions,
) =>
  _Equals(comparison, {
    message: `$property는 특정한 값과 동일해야 합니다.`,
    ...validationOptions,
  });
