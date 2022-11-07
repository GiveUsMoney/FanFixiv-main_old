import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { Injectable, OnApplicationShutdown } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class ShutDownService implements OnApplicationShutdown {
  constructor(@InjectRedis() private readonly redis: Redis) {}

  onApplicationShutdown() {
    this.redis.disconnect();
  }
}
