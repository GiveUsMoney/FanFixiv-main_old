export class BaseDto {
  constructor(obj: any) {
    Object.assign(this, obj);
  }
}
