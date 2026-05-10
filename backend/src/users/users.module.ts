import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity.js';
import { UsersBootstrap } from './users.bootstrap.js';
import { UsersService } from './users.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UsersService, UsersBootstrap],
  exports: [UsersService, TypeOrmModule],
})
export class UsersModule {}
