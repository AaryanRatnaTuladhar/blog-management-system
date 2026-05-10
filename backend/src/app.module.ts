import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminModule } from './admin/admin.module.js';
import { AuthModule } from './auth/auth.module.js';
import { BlogsModule } from './blogs/blogs.module.js';
import { CommentsModule } from './comments/comments.module.js';
import { CacheModule } from './infrastructure/cache/cache.module.js';
import { QueueModule } from './infrastructure/queue/queue.module.js';
import { RateLimitModule } from './infrastructure/rate-limit/rate-limit.module.js';
import { NotificationsModule } from './notifications/notifications.module.js';
import { UsersModule } from './users/users.module.js';
import { HealthController } from './health.controller.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env', ignoreEnvVars: true }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 40 }]),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 5432),
        username: config.get<string>('DB_USER', 'postgres'),
        password: config.get<string>('DB_PASSWORD', 'postgres'),
        database: config.get<string>('DB_NAME', 'blog_management'),
        autoLoadEntities: true,
        synchronize: true,
      }),
    }),
    AuthModule,
    UsersModule,
    BlogsModule,
    CommentsModule,
    NotificationsModule,
    AdminModule,
    CacheModule,
    QueueModule,
    RateLimitModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
