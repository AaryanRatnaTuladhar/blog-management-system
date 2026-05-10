import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis as UpstashRedis } from '@upstash/redis';
import Redis from 'ioredis';

@Injectable()
export class CacheService {
  private readonly redis: {
    get: (key: string) => Promise<string | null>;
    set: (key: string, value: string, modeOrOptions?: unknown, ttlSeconds?: number) => Promise<unknown>;
    del: (key: string) => Promise<unknown>;
  };

  constructor(config: ConfigService) {
    const upstashUrl = config.get<string>('UPSTASH_REDIS_REST_URL');
    const upstashToken = config.get<string>('UPSTASH_REDIS_REST_TOKEN');

    if (upstashUrl && upstashToken) {
      const upstash = new UpstashRedis({ url: upstashUrl, token: upstashToken });
      this.redis = {
        get: async (key: string) => {
          const value = await upstash.get<string | null>(key);
          return value;
        },
        set: async (key: string, value: string, _modeOrOptions?: unknown, ttlSeconds = 120) => {
          await upstash.set(key, value, { ex: ttlSeconds });
          return 'OK';
        },
        del: async (key: string) => upstash.del(key),
      };
      return;
    }

    this.redis = new Redis({
      host: config.get<string>('REDIS_HOST', 'localhost'),
      port: config.get<number>('REDIS_PORT', 6379),
      password: config.get<string>('REDIS_PASSWORD'),
    });
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.redis.get(key);
      if (value === null || value === undefined) return null;
      if (typeof value === 'string') {
        return JSON.parse(value) as T;
      }
      return value as T;
    } catch {
      return null;
    }
  }

  async set(key: string, value: unknown, ttlSeconds = 120) {
    try {
      await this.redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
    } catch {
      // Cache failures should not break API responses.
    }
  }

  del(key: string) {
    return this.redis.del(key).catch(() => 0);
  }
}
