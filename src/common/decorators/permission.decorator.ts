import { SetMetadata } from '@nestjs/common';

export const Permission = (entity: string, action: string) =>
  SetMetadata('permission', { entity, action });